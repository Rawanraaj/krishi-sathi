import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderStatus } from '../models/order';
import { VALID_STATUS_TRANSITIONS } from '../models/order';

const LOCAL_ORDERS_KEY = 'krishi_sathi_local_orders';

/**
 * Timeout wrapper — same pattern as listingsService.ts.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firestore operation timed out after ${timeoutMs / 1000}s.`));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function isFirebaseConfigured(): boolean {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(apiKey && apiKey !== 'demo-api-key' && apiKey.trim() !== '');
}

// ── Local storage helpers ──────────────────────────────────────────

function getLocalOrders(): Order[] {
  const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveLocalOrders(orders: Order[]): void {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

// ── Public API ─────────────────────────────────────────────────────

export async function createOrder(
  orderData: Omit<Order, 'id' | 'createdAt' | 'status'>
): Promise<Order> {
  const newOrder: Order = {
    ...orderData,
    id: 'order-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured()) {
    try {
      const docRef = await withTimeout(
        addDoc(collection(db, 'orders'), {
          listingId: newOrder.listingId,
          cropName: newOrder.cropName,
          buyerId: newOrder.buyerId,
          buyerName: newOrder.buyerName,
          farmerId: newOrder.farmerId,
          farmerName: newOrder.farmerName,
          quantity: newOrder.quantity,
          unit: newOrder.unit,
          pricePerUnit: newOrder.pricePerUnit,
          totalPrice: newOrder.totalPrice,
          status: newOrder.status,
          createdAt: newOrder.createdAt,
          notes: newOrder.notes || '',
        }),
        5000,
      );
      newOrder.id = docRef.id;
    } catch (error: unknown) {
      console.error('Firestore createOrder failed:', error);
      const errObj = error as { code?: string };
      if (errObj?.code === 'permission-denied') {
        throw new Error('Firestore security rules blocked this order (permission-denied).');
      }
      console.warn('Falling back to local order storage.');
    }
  } else {
    console.info('Firebase not configured — saving order locally for demo.');
  }

  // Always persist locally for offline/demo resilience
  const locals = getLocalOrders();
  locals.unshift(newOrder);
  saveLocalOrders(locals);

  return newOrder;
}

export async function getOrdersForBuyer(buyerId: string): Promise<Order[]> {
  let remoteOrders: Order[] = [];

  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('buyerId', '==', buyerId),
        orderBy('createdAt', 'desc'),
      );
      const snap = await withTimeout(getDocs(q), 5000);
      snap.forEach((d) => {
        const data = d.data();
        remoteOrders.push({
          id: d.id,
          listingId: data.listingId,
          cropName: data.cropName,
          buyerId: data.buyerId,
          buyerName: data.buyerName,
          farmerId: data.farmerId,
          farmerName: data.farmerName,
          quantity: data.quantity,
          unit: data.unit,
          pricePerUnit: data.pricePerUnit,
          totalPrice: data.totalPrice,
          status: data.status as OrderStatus,
          createdAt: data.createdAt,
          notes: data.notes,
        });
      });
    } catch (error) {
      console.error('Firestore getOrdersForBuyer failed:', error);
    }
  }

  // Merge local orders (dedup by id, local takes precedence for status)
  const locals = getLocalOrders().filter((o) => o.buyerId === buyerId);
  const merged = mergeOrders(locals, remoteOrders);
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrdersForFarmer(farmerId: string): Promise<Order[]> {
  let remoteOrders: Order[] = [];

  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('farmerId', '==', farmerId),
        orderBy('createdAt', 'desc'),
      );
      const snap = await withTimeout(getDocs(q), 5000);
      snap.forEach((d) => {
        const data = d.data();
        remoteOrders.push({
          id: d.id,
          listingId: data.listingId,
          cropName: data.cropName,
          buyerId: data.buyerId,
          buyerName: data.buyerName,
          farmerId: data.farmerId,
          farmerName: data.farmerName,
          quantity: data.quantity,
          unit: data.unit,
          pricePerUnit: data.pricePerUnit,
          totalPrice: data.totalPrice,
          status: data.status as OrderStatus,
          createdAt: data.createdAt,
          notes: data.notes,
        });
      });
    } catch (error) {
      console.error('Firestore getOrdersForFarmer failed:', error);
    }
  }

  const locals = getLocalOrders().filter((o) => o.farmerId === farmerId);
  const merged = mergeOrders(locals, remoteOrders);
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Update order status with transition validation.
 *
 * @param orderId    - The order document ID.
 * @param newStatus  - The desired new status.
 * @param actorRole  - 'farmer' or 'buyer' — used for permission checks.
 * @param actorId    - uid of the person performing the action.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actorRole: 'farmer' | 'buyer',
  actorId: string,
): Promise<Order> {
  // 1) Find the order (local first, then we'll update both)
  const locals = getLocalOrders();
  const localIdx = locals.findIndex((o) => o.id === orderId);
  const order = localIdx >= 0 ? locals[localIdx] : null;

  if (!order) {
    throw new Error('Order not found.');
  }

  // 2) Permission check
  if (actorRole === 'buyer') {
    if (order.buyerId !== actorId) {
      throw new Error('You do not have permission to modify this order.');
    }
    // Buyers may only cancel their own pending orders
    if (newStatus !== 'cancelled' || order.status !== 'pending') {
      throw new Error('Buyers can only cancel their own pending orders.');
    }
  } else if (actorRole === 'farmer') {
    if (order.farmerId !== actorId) {
      throw new Error('You do not have permission to modify this order.');
    }
  }

  // 3) Validate transition
  const allowed = VALID_STATUS_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot transition order from "${order.status}" to "${newStatus}". Allowed: ${allowed.length ? allowed.join(', ') : 'none (final state)'}.`,
    );
  }

  // 4) Update Firestore if configured and order ID looks like a Firestore doc ID
  if (isFirebaseConfigured() && !orderId.startsWith('order-')) {
    try {
      await withTimeout(
        updateDoc(doc(db, 'orders', orderId), { status: newStatus }),
        5000,
      );
    } catch (error) {
      console.error('Firestore updateOrderStatus failed:', error);
      console.warn('Falling back to local-only status update.');
    }
  }

  // 5) Update local copy
  order.status = newStatus;
  if (localIdx >= 0) {
    locals[localIdx] = order;
  }
  saveLocalOrders(locals);

  return order;
}

// ── Merge helper ───────────────────────────────────────────────────

function mergeOrders(localOrders: Order[], remoteOrders: Order[]): Order[] {
  const map = new Map<string, Order>();
  // Remote first so local overrides
  remoteOrders.forEach((o) => map.set(o.id, o));
  localOrders.forEach((o) => map.set(o.id, o));
  return Array.from(map.values());
}
