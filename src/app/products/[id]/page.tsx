'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { getProductById } from '@/lib/data/products';
import { useAuth } from '@/lib/context/AuthContext';
import { isTossConfigured } from '@/lib/toss/client';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const product = getProductById(params.id as string);

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

  const allImages = [product.images.main, ...product.images.gallery];
  const totalPrice = product.price * quantity;

  const handlePayment = () => {
    // Check if user is logged in
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/products/${product.id}`));
      return;
    }

    // Check if TossPayments is configured
    if (!isTossConfigured) {
      setError('결제 시스템이 설정되지 않았습니다. 관리자에게 문의해주세요.');
      return;
    }

    // Navigate to checkout page with the payment widget
    router.push(`/checkout/${product.id}?quantity=${quantity}`);
  };

  return (
    <main className="relative bg-[#030014] min-h-screen">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">홈</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white">상품</Link>
            <span>/</span>
            <span className="text-white">{product.nameKo}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <Image
                  src={allImages[selectedImage]}
                  alt={product.nameKo}
                  fill
                  className="object-cover"
                />
                {product.isFeatured && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white text-sm font-bold">
                    BEST SELLER
                  </div>
                )}
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === index
                        ? 'border-cyan-500'
                        : 'border-transparent hover:border-white/30'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                  {product.name}
                </span>
                <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">
                  {product.duration.nights}박 {product.duration.days}일
                </span>
              </div>

              <h1 className="text-4xl font-bold text-white mb-2">{product.nameKo}</h1>
              <p className="text-gray-400 mb-6">{product.ship}에서 출발</p>

              <p className="text-gray-300 text-lg mb-8">{product.descriptionKo}</p>

              {/* Destinations */}
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  여행 코스
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.destinations.map((dest, index) => (
                    <span key={dest} className="flex items-center text-gray-300">
                      {dest}
                      {index < product.destinations.length - 1 && (
                        <svg className="w-4 h-4 mx-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-3">포함 사항</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.featuresKo.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-gray-300">
                      <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Booking */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    {product.originalPrice && (
                      <div className="text-gray-500 line-through text-lg">
                        ₩{formatPrice(product.originalPrice)}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-white">
                      ₩{formatPrice(product.price)}
                      <span className="text-base text-gray-400 font-normal ml-1">/인</span>
                    </div>
                  </div>
                  {product.originalPrice && (
                    <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-300">인원</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white font-bold text-xl w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-4 border-t border-white/10 mb-6">
                  <span className="text-gray-300">총 금액</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    ₩{formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePayment}
                    className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                  >
                    바로 예약하기
                  </button>
                  <Link
                    href="/#contact"
                    className="px-6 py-4 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
                  >
                    상담하기
                  </Link>
                </div>

                {!user && (
                  <p className="text-center text-gray-400 text-sm mt-4">
                    예약하려면 <Link href="/login" className="text-cyan-400 hover:underline">로그인</Link>이 필요합니다.
                  </p>
                )}

                {/* Test Mode Notice */}
                {isTossConfigured && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-400 text-xs text-center">
                      현재 테스트 모드입니다. 실제 결제가 이루어지지 않습니다.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">안전 결제</h3>
              <p className="text-gray-400 text-sm">TossPayments를 통한 안전한 결제 시스템</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">간편 결제</h3>
              <p className="text-gray-400 text-sm">카드, 계좌이체, 간편결제 모두 지원</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">24시간 상담</h3>
              <p className="text-gray-400 text-sm">언제든 문의하세요. 전문 상담원이 도움을 드립니다.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
