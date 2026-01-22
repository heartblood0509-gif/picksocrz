import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
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

    // Payment confirmed successfully - now create order in Firestore
    let orderNumber = orderId;

    console.log('Payment confirmed. Creating order with:', {
      userId: userId || 'guest (no userId provided)',
      customerEmail,
      customerName,
      productId,
      amount,
    });

    if (isFirebaseConfigured && db) {
      try {
        // Get product info
        let productName = '크루즈 상품';
        let productPrice = amount / quantity;

        // Try to get product from Firestore first
        if (productId) {
          const productRef = doc(db, 'products', productId);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const productData = productSnap.data();
            productName = productData.nameKo || productData.name || '크루즈 상품';
            productPrice = productData.price || (amount / quantity);
          } else {
            // Fall back to static products
            const staticProduct = staticProducts.find(p => p.id === productId || p.slug === productId);
            if (staticProduct) {
              productName = staticProduct.nameKo || staticProduct.name;
              productPrice = staticProduct.price;
            }
          }
        }

        orderNumber = generateOrderNumber();

        // Create order in Firestore
        const ordersRef = collection(db, 'orders');
        await addDoc(ordersRef, {
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
            method: 'toss' as const,
            status: 'completed' as const,
            tossPaymentKey: data.paymentKey,
            tossOrderId: orderId,
            paidAt: serverTimestamp(),
          },
          status: 'confirmed' as const,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log('Order created successfully:', orderNumber);
      } catch (firestoreError) {
        // Log but don't fail - payment was already confirmed
        console.error('Failed to create order in Firestore:', firestoreError);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
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
