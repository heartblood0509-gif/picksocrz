import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';

// This API updates all 'guest' orders to the specified userId
export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
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

    // Find all orders with userId: 'guest'
    const ordersRef = adminDb.collection('orders');
    const snapshot = await ordersRef.where('userId', '==', 'guest').get();

    if (snapshot.empty) {
      return NextResponse.json({
        message: 'No guest orders found',
        updated: 0
      });
    }

    // Update each order
    const batch = adminDb.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        userId: userId,
        userEmail: userEmail || '',
      });
      count++;
    });

    await batch.commit();

    console.log(`Updated ${count} orders from 'guest' to userId: ${userId}`);

    return NextResponse.json({
      message: `Successfully updated ${count} orders`,
      updated: count,
    });
  } catch (error) {
    console.error('Fix orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
