import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus } from '../models/order';
import {
  createOrder,
  getOrdersForBuyer,
  getOrdersForFarmer,
  updateOrderStatus,
} from '../services/ordersService';
import { useAuth } from './useAuth';

export function useOrders() {
  const { userProfile, loading: authLoading } = useAuth();

  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [farmerOrders, setFarmerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!userProfile) {
      setBuyerOrders([]);
      setFarmerOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (userProfile.role === 'buyer') {
        const orders = await getOrdersForBuyer(userProfile.uid);
        setBuyerOrders(orders);
      } else if (userProfile.role === 'farmer') {
        const orders = await getOrdersForFarmer(userProfile.uid);
        setFarmerOrders(orders);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load orders.';
      console.error('useOrders loadOrders error:', err);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!authLoading) {
      loadOrders();
    }
  }, [authLoading, loadOrders]);

  const placeOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt' | 'status'>,
  ): Promise<Order> => {
    setError(null);
    try {
      const created = await createOrder(orderData);
      // Immediately add to buyer orders for instant UI feedback
      setBuyerOrders((prev) => [created, ...prev]);
      return created;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to place order.';
      console.error('useOrders placeOrder error:', err);
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const updateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<void> => {
    if (!userProfile) {
      throw new Error('You must be logged in to update order status.');
    }
    setError(null);
    try {
      const updated = await updateOrderStatus(
        orderId,
        newStatus,
        userProfile.role,
        userProfile.uid,
      );
      // Update the appropriate local list
      if (userProfile.role === 'farmer') {
        setFarmerOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o)),
        );
      } else {
        setBuyerOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o)),
        );
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update order status.';
      console.error('useOrders updateStatus error:', err);
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  return {
    buyerOrders,
    farmerOrders,
    loading: loading || authLoading,
    error,
    placeOrder,
    updateStatus,
    refresh: loadOrders,
  };
}
