import { NextResponse } from 'next/server';
import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import { staticProducts } from '@/lib/data/products';

// Seed products to Firestore
export async function POST() {
  if (!isFirebaseConfigured || !db) {
    return NextResponse.json(
      { error: 'Firebase is not configured' },
      { status: 500 }
    );
  }

  try {
    const productsRef = collection(db, 'products');

    // Check if products already exist
    const existingProducts = await getDocs(productsRef);
    if (!existingProducts.empty) {
      return NextResponse.json({
        message: 'Products already exist in Firestore',
        count: existingProducts.size,
      });
    }

    // Add each product to Firestore
    const results = [];
    for (const product of staticProducts) {
      const productRef = doc(productsRef, product.id);
      await setDoc(productRef, {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      results.push(product.id);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${results.length} products`,
      products: results,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed products' },
      { status: 500 }
    );
  }
}

// Get seed status
export async function GET() {
  if (!isFirebaseConfigured || !db) {
    return NextResponse.json(
      {
        configured: false,
        error: 'Firebase is not configured'
      },
      { status: 200 }
    );
  }

  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);

    return NextResponse.json({
      configured: true,
      collections: {
        products: snapshot.size,
        users: usersSnapshot.size,
        orders: ordersSnapshot.size,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
