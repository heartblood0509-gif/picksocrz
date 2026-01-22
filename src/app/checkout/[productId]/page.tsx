'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';
import { getProductById } from '@/lib/data/products';
import { useAuth } from '@/lib/context/AuthContext';
import { TOSS_CLIENT_KEY, generateOrderId, isTossConfigured } from '@/lib/toss/client';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

// TossPayments v1 SDK types
interface TossPaymentsV1Instance {
  requestPayment: (method: string, params: {
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail?: string;
    successUrl: string;
    failUrl: string;
  }) => Promise<void>;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'카드' | '계좌이체' | '가상계좌'>('카드');
  const [tossInstance, setTossInstance] = useState<TossPaymentsV1Instance | null>(null);

  const product = getProductById(params.productId as string);
  const totalPrice = product ? product.price * quantity : 0;

  // Get quantity from URL params
  useEffect(() => {
    const q = searchParams.get('quantity');
    if (q) {
      setQuantity(parseInt(q) || 1);
    }
  }, [searchParams]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/checkout/${params.productId}?quantity=${quantity}`)}`);
    }
  }, [authLoading, user, router, params.productId, quantity]);

  // Load TossPayments v1 SDK
  useEffect(() => {
    if (!product || !isTossConfigured || !user) return;

    const loadSDK = async () => {
      try {
        // Check if already loaded
        const win = window as unknown as {
          TossPayments?: new (clientKey: string) => TossPaymentsV1Instance
        };

        if (win.TossPayments) {
          setTossInstance(new win.TossPayments(TOSS_CLIENT_KEY));
          setIsLoading(false);
          return;
        }

        // Load v1 SDK
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v1/payment';
        script.async = true;

        script.onload = () => {
          const loadedWin = window as unknown as {
            TossPayments?: new (clientKey: string) => TossPaymentsV1Instance
          };

          if (loadedWin.TossPayments) {
            setTossInstance(new loadedWin.TossPayments(TOSS_CLIENT_KEY));
          } else {
            setError('결제 시스템을 불러올 수 없습니다.');
          }
          setIsLoading(false);
        };

        script.onerror = () => {
          setError('결제 시스템을 불러올 수 없습니다.');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Load SDK error:', err);
        setError('결제 시스템을 초기화할 수 없습니다.');
        setIsLoading(false);
      }
    };

    loadSDK();
  }, [product, user]);

  const handlePayment = async () => {
    if (!tossInstance || !product || !user) {
      setError('결제를 진행할 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const orderId = generateOrderId();
      const baseUrl = window.location.origin;

      await tossInstance.requestPayment(paymentMethod, {
        amount: totalPrice,
        orderId,
        orderName: `${product.nameKo} (${quantity}명)`,
        customerName: user.displayName || '고객',
        customerEmail: user.email || undefined,
        successUrl: `${baseUrl}/payment/success?orderId=${orderId}&productId=${product.id}&quantity=${quantity}`,
        failUrl: `${baseUrl}/payment/fail`,
      });
    } catch (err) {
      console.error('Payment error:', err);
      if (err instanceof Error && !err.message.includes('사용자가 결제를 취소')) {
        setError(err.message || '결제 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!product) {
    return (
      <main className="relative bg-[#030014] min-h-screen flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">상품을 찾을 수 없습니다</h1>
          <Link href="/products" className="text-cyan-400 hover:text-cyan-300">
            상품 목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="relative bg-[#030014] min-h-screen flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="relative bg-[#030014] min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-white">홈</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white">상품</Link>
            <span>/</span>
            <Link href={`/products/${product.id}`} className="hover:text-white">{product.nameKo}</Link>
            <span>/</span>
            <span className="text-white">결제</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-8">결제하기</h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Order Summary - Left */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">주문 상품</h2>

                <div className="flex gap-4 mb-4">
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.images.main}
                      alt={product.nameKo}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white">{product.nameKo}</h3>
                    <p className="text-sm text-gray-400">{product.duration.nights}박 {product.duration.days}일</p>
                    <p className="text-sm text-gray-400">{product.ship}</p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between py-3 border-t border-white/10">
                  <span className="text-gray-400">인원</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white font-bold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between py-3 border-t border-white/10">
                  <span className="text-gray-400">상품 금액</span>
                  <span className="text-white">₩{formatPrice(product.price)} × {quantity}</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-lg font-semibold text-white">총 결제 금액</span>
                  <span className="text-2xl font-bold text-cyan-400">₩{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">예약자 정보</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">이름</span>
                      <span className="text-white">{user.displayName || '미설정'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">이메일</span>
                      <span className="text-white">{user.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods - Right */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">결제 수단 선택</h2>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <svg className="animate-spin w-8 h-8 text-cyan-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-gray-400">결제 시스템을 불러오는 중...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { value: '카드', label: '신용/체크카드', icon: '💳' },
                        { value: '계좌이체', label: '계좌이체', icon: '🏦' },
                        { value: '가상계좌', label: '가상계좌', icon: '📄' },
                      ].map((method) => (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value as typeof paymentMethod)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === method.value
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/30'
                          }`}
                        >
                          <div className="text-2xl mb-2">{method.icon}</div>
                          <div className={`text-sm font-medium ${
                            paymentMethod === method.value ? 'text-cyan-400' : 'text-gray-300'
                          }`}>
                            {method.label}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Payment Info */}
                    <div className="p-4 bg-white/5 rounded-xl mb-6">
                      <p className="text-gray-400 text-sm">
                        {paymentMethod === '카드' && '카드 결제 시 TossPayments 결제창에서 카드 정보를 입력합니다. 카카오페이, 네이버페이 등 간편결제도 지원됩니다.'}
                        {paymentMethod === '계좌이체' && '계좌이체 선택 시 TossPayments 결제창에서 은행을 선택하고 이체를 진행합니다.'}
                        {paymentMethod === '가상계좌' && '가상계좌 발급 후 입금하시면 결제가 완료됩니다. 입금 기한 내에 입금해주세요.'}
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Pay Button */}
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing || !tossInstance}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          결제 진행 중...
                        </span>
                      ) : (
                        `₩${formatPrice(totalPrice)} 결제하기`
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Test Mode Notice */}
              {isTossConfigured && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-sm text-center">
                    현재 테스트 모드입니다. 실제 결제가 이루어지지 않습니다.
                  </p>
                </div>
              )}

              {/* Security Info */}
              <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  SSL 암호화
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  TossPayments 안전결제
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
