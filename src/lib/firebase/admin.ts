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
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId) {
    console.warn('Firebase Admin: Missing project ID');
    return null;
  }

  try {
    // If we have service account credentials, use them
    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      // Initialize without credentials (works in Google Cloud environments)
      adminApp = initializeApp({
        projectId,
      });
      console.log('Firebase Admin initialized with project ID only');
    }

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
