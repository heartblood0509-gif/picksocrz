import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { staticProducts } from '@/lib/data/products';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';

// Generate order number
const generateOrderNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${random}`;
};

export async function POST(req: NextRequest) {
  try {
    const {
      paymentKey,
      orderId,
      amount,
      productId,
      quantity = 1,
      userId,
      customerName,
      customerEmail,
    } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!TOSS_SECRET_KEY) {
      return NextResponse.json(
        { error: 'TossPayments is not configured. Please set TOSS_SECRET_KEY.' },
        { status: 500 }
      );
    }

    // Confirm payment with Toss API
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Toss Payment Error:', data);
      return NextResponse.json(
        { error: data.message || 'Payment confirmation failed' },
        { status: response.status }
      );
    }

    // Payment confirmed successfully - now create order in Firestore using Admin SDK
    let orderNumber = orderId;

    console.log('Payment confirmed. Creating order with:', {
      userId: userId || 'guest (no userId provided)',
      customerEmail,
      customerName,
      productId,
      amount,
    });

    let firestoreSuccess = false;
    let firestoreErrorMessage = '';

    const adminDb = getAdminDb();

    if (isAdminConfigured() && adminDb) {
      try {
        // Get product info
        let productName = '크루즈 상품';
        let productPrice = amount / quantity;

        // Try to get product from Firestore first
        if (productId) {
          try {
            const productRef = adminDb.collection('products').doc(productId);
            const productSnap = await productRef.get();

            if (productSnap.exists) {
              const productData = productSnap.data();
              productName = productData?.nameKo || productData?.name || '크루즈 상품';
              productPrice = productData?.price || (amount / quantity);
            } else {
              // Fall back to static products
              const staticProduct = staticProducts.find(p => p.id === productId || p.slug === productId);
              if (staticProduct) {
                productName = staticProduct.nameKo || staticProduct.name;
                productPrice = staticProduct.price;
              }
            }
          } catch (productError) {
            console.warn('Failed to get product info:', productError);
          }
        }

        orderNumber = generateOrderNumber();

        console.log('Creating order in Firestore with Admin SDK:', {
          orderNumber,
          userId: userId || 'guest',
          userEmail: customerEmail,
          productName,
          amount,
        });

        // Create order in Firestore using Admin SDK
        const ordersRef = adminDb.collection('orders');
        const docRef = await ordersRef.add({
          orderNumber,
          userId: userId || 'guest',
          userEmail: customerEmail || '',
          userName: customerName || '고객',
          userPhone: '',
          productId: productId || 'unknown',
          productName,
          productPrice,
          quantity,
          totalAmount: amount,
          payment: {
            method: 'toss',
            status: 'completed',
            tossPaymentKey: data.paymentKey,
            tossOrderId: orderId,
            paidAt: FieldValue.serverTimestamp(),
          },
          status: 'confirmed',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        console.log('Order created successfully with Admin SDK:', orderNumber, 'docId:', docRef.id);
        firestoreSuccess = true;
      } catch (firestoreError) {
        console.error('Failed to create order in Firestore:', firestoreError);
        firestoreErrorMessage = firestoreError instanceof Error ? firestoreError.message : 'Unknown error';
      }
    } else {
      console.warn('Firebase Admin not configured, skipping order creation');
      firestoreErrorMessage = 'Firebase Admin not configured';
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      firestoreSuccess,
      firestoreError: firestoreErrorMessage || undefined,
      payment: {
        paymentKey: data.paymentKey,
        orderId: data.orderId,
        status: data.status,
        totalAmount: data.totalAmount,
        method: data.method,
        approvedAt: data.approvedAt,
      },
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
