'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const confirmedRef = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Prevent multiple confirmations
    if (confirmedRef.current || isConfirming) {
      return;
    }

    // If already success or error, don't try again
    if (status === 'success' || status === 'error') {
      return;
    }

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const productId = searchParams.get('productId');
    const quantity = searchParams.get('quantity');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('잘못된 결제 정보입니다.');
      return;
    }

    // Use firebaseUser.uid as primary source (always available after auth)
    const userId = firebaseUser?.uid || user?.uid;

    if (!userId) {
      setStatus('error');
      setErrorMessage('로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
      return;
    }

    const confirm = async () => {
      // Mark as confirming
      setIsConfirming(true);
      confirmedRef.current = true;

      console.log('Confirming payment with userId:', userId);

      try {
        const response = await fetch('/api/payments/toss/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
            productId,
            quantity: quantity ? parseInt(quantity) : 1,
            userId: userId,
            customerName: user?.displayName || firebaseUser?.displayName || '고객',
            customerEmail: user?.email || firebaseUser?.email || '',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '결제 확인에 실패했습니다.');
        }

        setOrderNumber(data.orderNumber || orderId);
        setStatus('success');
      } catch (error) {
        console.error('Payment confirmation error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : '결제 확인에 실패했습니다.');
      } finally {
        setIsConfirming(false);
      }
    };

    confirm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  return (
    <main className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">결제 확인 중</h1>
            <p className="text-gray-400">잠시만 기다려주세요...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">결제가 완료되었습니다!</h1>
            {orderNumber && (
              <p className="text-cyan-400 text-sm mb-4">
                주문번호: {orderNumber}
              </p>
            )}
            <p className="text-gray-400 mb-8">
              마이페이지에서 예약 내역을 확인하세요.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/mypage/orders"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                예약 내역 확인
              </Link>
              <Link
                href="/"
                className="w-full py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">결제 확인 실패</h1>
            <p className="text-gray-400 mb-8">{errorMessage}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/products"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                다시 시도하기
              </Link>
              <Link
                href="/#contact"
                className="w-full py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              >
                고객센터 문의
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
