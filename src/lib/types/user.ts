import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  profileImage?: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences?: {
    newsletter: boolean;
    marketing: boolean;
  };
  address?: {
    zipCode: string;
    address1: string;
    address2?: string;
    city: string;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
