import { Timestamp } from 'firebase/firestore';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  totalAmount: number;
  travelDate?: Timestamp;
  passengers?: {
    adults: number;
    children: number;
    infants: number;
  };
  payment: {
    method: 'toss' | 'card' | 'bank_transfer';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    tossPaymentKey?: string;
    tossOrderId?: string;
    paidAt?: Timestamp;
    refundedAt?: Timestamp;
    refundAmount?: number;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderFormData {
  productId: string;
  quantity: number;
  travelDate?: Date;
  passengers?: {
    adults: number;
    children: number;
    infants: number;
  };
  specialRequests?: string;
}

export type OrderStatus = Order['status'];
export type PaymentStatus = Order['payment']['status'];
