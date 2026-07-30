export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  listingId: string;
  cropName: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

/**
 * Valid status transitions.
 * - pending  -> confirmed | cancelled
 * - confirmed -> delivered | cancelled
 * - delivered -> (final, no transitions)
 * - cancelled -> (final, no transitions)
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};
