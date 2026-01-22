import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { Product, Order, User } from '../types';

const checkFirebaseConfigured = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Please set up environment variables.');
  }
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  if (!isFirebaseConfigured || !db) return [];

  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (!isFirebaseConfigured || !db) return null;

  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);

  if (productSnap.exists()) {
    return { id: productSnap.id, ...productSnap.data() } as Product;
  }

  return null;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  if (!isFirebaseConfigured || !db) return null;

  const productsRef = collection(db, 'products');
  const q = query(productsRef, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Product;
  }

  return null;
};

// Orders
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  checkFirebaseConfigured();

  const ordersRef = collection(db!, 'orders');
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  if (!isFirebaseConfigured || !db) return null;

  const orderRef = doc(db, 'orders', id);
  const orderSnap = await getDoc(orderRef);

  if (orderSnap.exists()) {
    return { id: orderSnap.id, ...orderSnap.data() } as Order;
  }

  return null;
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const ordersRef = collection(db, 'orders');
    // Try with orderBy first (requires composite index)
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    // If index error, fallback to simple query without orderBy
    console.warn('Composite index not available, using fallback query:', error);

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];

    // Sort in memory by createdAt descending
    return orders.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['payment']['status']
): Promise<void> => {
  checkFirebaseConfigured();

  const orderRef = doc(db!, 'orders', orderId);

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (paymentStatus) {
    updateData['payment.status'] = paymentStatus;
    if (paymentStatus === 'completed') {
      updateData['payment.paidAt'] = serverTimestamp();
    }
  }

  await updateDoc(orderRef, updateData);
};

// Admin functions
export const getAllOrders = async (): Promise<Order[]> => {
  if (!isFirebaseConfigured || !db) return [];

  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
};

export const getAllUsers = async (): Promise<User[]> => {
  if (!isFirebaseConfigured || !db) return [];

  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
  })) as User[];
};

export const getAllProducts = async (): Promise<Product[]> => {
  if (!isFirebaseConfigured || !db) return [];

  const productsRef = collection(db, 'products');
  const q = query(productsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
};

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  checkFirebaseConfigured();

  const productsRef = collection(db!, 'products');
  const docRef = await addDoc(productsRef, {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<void> => {
  checkFirebaseConfigured();

  const productRef = doc(db!, 'products', id);
  await updateDoc(productRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  checkFirebaseConfigured();

  const productRef = doc(db!, 'products', id);
  await deleteDoc(productRef);
};

// User functions
export const getUserOrders = async (userId: string, userEmail?: string): Promise<Order[]> => {
  if (!isFirebaseConfigured || !db) {
    console.log('Firebase not configured');
    return [];
  }

  console.log('getUserOrders called with userId:', userId, 'email:', userEmail);

  try {
    const ordersRef = collection(db, 'orders');
    let orders: Order[] = [];

    // Try simple query first (without orderBy to avoid index issues)
    try {
      console.log('Querying orders with userId:', userId);
      const q = query(ordersRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      console.log('Query returned', snapshot.docs.length, 'documents');

      orders = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Order doc:', doc.id, 'userId:', data.userId);
        return {
          id: doc.id,
          ...data,
        };
      }) as Order[];

      // Sort in memory by createdAt descending
      orders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
    } catch (queryError) {
      console.error('Query error:', queryError);
    }

    // If no orders found by userId and email provided, try by email
    if (orders.length === 0 && userEmail) {
      console.log('No orders found by userId, trying by email:', userEmail);
      try {
        const emailQuery = query(ordersRef, where('userEmail', '==', userEmail));
        const emailSnapshot = await getDocs(emailQuery);
        console.log('Email query returned', emailSnapshot.docs.length, 'documents');

        orders = emailSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        // Sort in memory
        orders.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
      } catch (emailError) {
        console.warn('Email query failed:', emailError);
      }
    }

    console.log('Returning', orders.length, 'orders');
    return orders;
  } catch (error) {
    console.error('getUserOrders error:', error);
    return [];
  }
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<Pick<User, 'displayName' | 'phoneNumber' | 'profileImage'>>
): Promise<void> => {
  checkFirebaseConfigured();

  const userRef = doc(db!, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getUserById = async (userId: string): Promise<User | null> => {
  if (!isFirebaseConfigured || !db) return null;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  return null;
};

// Generate order number
export const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${random}`;
};
