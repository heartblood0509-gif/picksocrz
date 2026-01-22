'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <main className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">결제에 실패했습니다</h1>

        <p className="text-gray-400 mb-2">
          {errorMessage || '결제 처리 중 문제가 발생했습니다.'}
        </p>

        {errorCode && (
          <p className="text-gray-500 text-sm mb-8">
            오류 코드: {errorCode}
          </p>
        )}

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
          <Link
            href="/"
            className="w-full py-3 text-gray-400 hover:text-white transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </main>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}
