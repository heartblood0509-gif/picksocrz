import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

const initializeFirebaseAdmin = (): App | null => {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check for service account credentials
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Handle private key formatting for different environments
  if (privateKey) {
    // Remove surrounding quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  console.log('Firebase Admin Config:', {
    projectId: projectId || 'NOT SET',
    clientEmail: clientEmail || 'NOT SET',
    privateKeyExists: !!privateKey,
    privateKeyLength: privateKey?.length || 0,
    privateKeyStart: privateKey?.substring(0, 30) || 'N/A',
  });

  if (!projectId) {
    console.warn('Firebase Admin: Missing project ID');
    return null;
  }

  if (!clientEmail) {
    console.warn('Firebase Admin: Missing client email');
    return null;
  }

  if (!privateKey) {
    console.warn('Firebase Admin: Missing private key');
    return null;
  }

  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('Firebase Admin initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
};

export const getAdminApp = (): App | null => {
  if (!adminApp) {
    adminApp = initializeFirebaseAdmin();
  }
  return adminApp;
};

export const getAdminDb = (): Firestore | null => {
  if (!adminDb) {
    const app = getAdminApp();
    if (app) {
      adminDb = getFirestore(app);
    }
  }
  return adminDb;
};

export const isAdminConfigured = (): boolean => {
  return getAdminApp() !== null;
};
