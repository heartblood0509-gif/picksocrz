'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  logOut,
  getUserDocument,
} from '../firebase/auth';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const userData = await getUserDocument(fbUser.uid);
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      setError('Firebase가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
      throw new Error('Firebase not configured');
    }

    try {
      setError(null);
      setLoading(true);
      const userData = await signInWithEmail(email, password);
      setUser(userData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(getKoreanErrorMessage(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseConfigured) {
      setError('Firebase가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
      throw new Error('Firebase not configured');
    }

    try {
      setError(null);
      setLoading(true);
      const userData = await signUpWithEmail(email, password, displayName);
      setUser(userData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setError(getKoreanErrorMessage(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      setError('Firebase가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
      throw new Error('Firebase not configured');
    }

    try {
      setError(null);
      setLoading(true);
      const userData = await signInWithGoogle();
      setUser(userData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.';
      setError(getKoreanErrorMessage(errorMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      setUser(null);
      return;
    }

    try {
      setError(null);
      await logOut();
      setUser(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '로그아웃에 실패했습니다.';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        isAdmin,
        isFirebaseConfigured,
        login,
        signup,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getKoreanErrorMessage(error: string): string {
  if (error.includes('auth/email-already-in-use')) {
    return '이미 사용 중인 이메일입니다.';
  }
  if (error.includes('auth/invalid-email')) {
    return '유효하지 않은 이메일 형식입니다.';
  }
  if (error.includes('auth/weak-password')) {
    return '비밀번호는 6자 이상이어야 합니다.';
  }
  if (error.includes('auth/user-not-found')) {
    return '등록되지 않은 이메일입니다.';
  }
  if (error.includes('auth/wrong-password')) {
    return '비밀번호가 올바르지 않습니다.';
  }
  if (error.includes('auth/too-many-requests')) {
    return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
  }
  if (error.includes('auth/popup-closed-by-user')) {
    return '로그인 창이 닫혔습니다.';
  }
  if (error.includes('auth/invalid-credential')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  return error;
}
