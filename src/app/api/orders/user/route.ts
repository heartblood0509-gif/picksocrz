import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('email');

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    if (!isAdminConfigured() || !adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured' },
        { status: 500 }
      );
    }

    const ordersRef = adminDb.collection('orders');
    let orders: Record<string, unknown>[] = [];

    // Try to get orders by userId first
    if (userId) {
      try {
        const snapshot = await ordersRef.where('userId', '==', userId).get();
        orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(`Found ${orders.length} orders by userId: ${userId}`);
      } catch (error) {
        console.error('Error querying by userId:', error);
      }
    }

    // If no orders found by userId, try by email
    if (orders.length === 0 && userEmail) {
      try {
        const emailSnapshot = await ordersRef.where('userEmail', '==', userEmail).get();
        orders = emailSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(`Found ${orders.length} orders by email: ${userEmail}`);
      } catch (error) {
        console.error('Error querying by email:', error);
      }
    }

    // If still no orders, try to get all orders and filter (for debugging)
    if (orders.length === 0) {
      try {
        const allSnapshot = await ordersRef.orderBy('createdAt', 'desc').get();
        const allOrders = allSnapshot.docs.map(doc => ({
          id: doc.id,
          userId: doc.data().userId,
          userEmail: doc.data().userEmail,
        }));
        console.log('All orders in database:', allOrders);

        // Filter by userId or email manually
        orders = allSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.userId === userId || data.userEmail === userEmail;
          })
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
      } catch (error) {
        console.error('Error querying all orders:', error);
      }
    }

    // Sort by createdAt descending
    orders.sort((a, b) => {
      const aTime = (a.createdAt as { _seconds?: number })?.['_seconds'] ||
                    (a.createdAt as { seconds?: number })?.seconds || 0;
      const bTime = (b.createdAt as { _seconds?: number })?.['_seconds'] ||
                    (b.createdAt as { seconds?: number })?.seconds || 0;
      return bTime - aTime;
    });

    return NextResponse.json({ orders, count: orders.length });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
