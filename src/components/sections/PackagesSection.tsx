'use client';

import { useRef, useState, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { images } from '@/lib/images';

const packages = [
  {
    name: 'Explorer',
    price: '₩2,990,000',
    duration: '7박 8일',
    description: '크루즈의 매력을 처음 경험하는 분들을 위한 입문 패키지',
    features: [
      '오션뷰 객실',
      '조식 & 석식 포함',
      '기본 엔터테인먼트',
      '피트니스 센터 이용',
      '기항지 1개 투어'
    ],
    popular: false,
    gradient: 'from-slate-500 to-slate-700',
    image: images.packages.explorer
  },
  {
    name: 'Voyager',
    price: '₩5,490,000',
    duration: '10박 11일',
    description: '프리미엄 서비스와 함께하는 완벽한 휴식의 여정',
    features: [
      '발코니 스위트',
      '올인클루시브 다이닝',
      '프리미엄 스파 패키지',
      'VIP 쇼 좌석',
      '기항지 3개 투어',
      '무제한 음료 패키지'
    ],
    popular: true,
    gradient: 'from-cyan-500 to-cyan-700',
    image: images.packages.voyager
  },
  {
    name: 'Royal',
    price: '₩12,900,000',
    duration: '14박 15일',
    description: '최상급 럭셔리로 완성되는 꿈의 항해',
    features: [
      '그랜드 스위트',
      '전용 버틀러 서비스',
      '미슐랭 레스토랑 예약',
      '프라이빗 익스커션',
      '헬리콥터 투어 포함',
      'VIP 공항 픽업',
      '스파 무제한 이용'
    ],
    popular: false,
    gradient: 'from-amber-500 to-amber-700',
    image: images.packages.royal
  }
];

interface TiltCardProps {
  children: React.ReactNode;
  gradient: string;
  popular: boolean;
  backgroundImage: string;
}

function TiltCard({ children, gradient, popular, backgroundImage }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    setGlarePosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      className="relative transition-transform duration-200 ease-out h-full"
      style={{ transform, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card content */}
      <div className={`relative h-full rounded-3xl overflow-hidden border ${popular ? 'border-cyan-400/50' : 'border-white/10'}`}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Package background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/90 to-[#030014]/70" />
        </div>

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />

        {/* Glare effect */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.2) 0%, transparent 50%)`
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full p-8">{children}</div>
      </div>

      {/* Popular badge glow */}
      {popular && (
        <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 opacity-50 blur-md -z-10" />
      )}
    </div>
  );
}

export default function PackagesSection() {
  return (
    <section id="packages" className="relative py-32 px-4 bg-[#030014]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-cyan-400 border border-cyan-400/30 rounded-full glass">
            PACKAGES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            나에게 맞는 <span className="text-gradient-ocean">패키지</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            다양한 패키지 중에서 당신의 여행 스타일에 맞는 최적의 옵션을 선택하세요
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="h-full"
            >
              <TiltCard gradient={pkg.gradient} popular={pkg.popular} backgroundImage={pkg.image}>
                <div className="flex flex-col h-full">
                  {/* Popular badge */}
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-bold rounded-bl-xl rounded-tr-2xl shadow-lg shadow-cyan-500/30">
                      BEST SELLER
                    </div>
                  )}

                  {/* Package name */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-gray-400 text-sm">{pkg.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <span className="text-4xl font-bold text-white">{pkg.price}</span>
                    <span className="text-gray-400 text-sm ml-2">/ {pkg.duration}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${pkg.popular ? 'bg-cyan-500/20' : 'bg-white/10'}`}>
                          <svg
                            className={`w-3 h-3 ${pkg.popular ? 'text-cyan-400' : 'text-gray-400'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:scale-105 shadow-lg shadow-cyan-500/30'
                        : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-cyan-400/50'
                    }`}
                  >
                    패키지 선택하기
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400 text-sm">모든 가격은 1인 기준이며, 시즌 및 객실 타입에 따라 변동될 수 있습니다.</span>
          </div>
          <p className="text-gray-500 text-sm">
            문의: <span className="text-cyan-400 font-medium">1588-0000</span> |
            이메일: <span className="text-cyan-400 font-medium">cruise@picksocruise.com</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
