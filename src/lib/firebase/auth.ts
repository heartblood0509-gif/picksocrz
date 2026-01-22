import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import type { User } from '../types';

// Admin emails - users with these emails will be assigned admin role
const ADMIN_EMAILS = ['admin@pickso.com', 'admin@picksocruise.com'];

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

const checkFirebaseConfigured = () => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Please set up environment variables.');
  }
};

export const createUserDocument = async (
  firebaseUser: FirebaseUser,
  additionalData?: Partial<User>
): Promise<User> => {
  checkFirebaseConfigured();

  const userRef = doc(db!, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const role = isAdminEmail(firebaseUser.email || '') ? 'admin' : 'user';

    const userData: Omit<User, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>; updatedAt: ReturnType<typeof serverTimestamp> } = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || additionalData?.displayName || '',
      phoneNumber: firebaseUser.phoneNumber || additionalData?.phoneNumber || '',
      profileImage: firebaseUser.photoURL || '',
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    await setDoc(userRef, userData);

    const newUserSnap = await getDoc(userRef);
    return newUserSnap.data() as User;
  }

  return userSnap.data() as User;
};

export const getUserDocument = async (uid: string): Promise<User | null> => {
  checkFirebaseConfigured();

  const userRef = doc(db!, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  return null;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  checkFirebaseConfigured();

  const { user: firebaseUser } = await createUserWithEmailAndPassword(auth!, email, password);

  await updateProfile(firebaseUser, { displayName });

  const user = await createUserDocument(firebaseUser, { displayName });

  return user;
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  checkFirebaseConfigured();

  const { user: firebaseUser } = await signInWithEmailAndPassword(auth!, email, password);

  let user = await getUserDocument(firebaseUser.uid);

  if (!user) {
    user = await createUserDocument(firebaseUser);
  }

  return user;
};

export const signInWithGoogle = async (): Promise<User> => {
  checkFirebaseConfigured();

  const provider = new GoogleAuthProvider();
  const { user: firebaseUser } = await signInWithPopup(auth!, provider);

  let user = await getUserDocument(firebaseUser.uid);

  if (!user) {
    user = await createUserDocument(firebaseUser);
  }

  return user;
};

export const logOut = async (): Promise<void> => {
  checkFirebaseConfigured();
  await signOut(auth!);
};
