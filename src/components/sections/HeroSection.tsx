'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/cruise-background.mp4" type="video/mp4" />
        </video>
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 하단 페이드 아웃 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#030014] z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span
            className="inline-block px-5 py-2 mb-8 text-sm font-medium tracking-wider text-white/90 uppercase"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
          >
            Premium Cruise Experience
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span
            className="block text-white"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.6)' }}
          >
            바다 위의
          </span>
          <span
            className="block text-white"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.6)' }}
          >
            궁전을 경험하세요
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto font-normal leading-relaxed"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          전 세계 100개 이상의 목적지로 떠나는 프리미엄 크루즈 여행.
          <br />
          잊지 못할 순간들이 당신을 기다립니다.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-base hover:bg-gray-100 transition-all duration-300 shadow-2xl">
            지금 예약하기
          </button>

          <button className="px-8 py-4 bg-transparent border border-white/50 text-white rounded-full font-medium text-base hover:bg-white/10 hover:border-white/70 transition-all duration-300">
            항해 일정 보기
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {[
            { value: '100+', label: '목적지' },
            { value: '25+', label: '럭셔리 선박' },
            { value: '50만+', label: '만족한 고객' },
            { value: '15년+', label: '업계 경험' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold text-white mb-1"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5)' }}
              >
                {stat.value}
              </div>
              <div
                className="text-white/80 text-sm font-normal tracking-wide"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center">
          <span
            className="text-xs mb-3 text-white/70 font-normal tracking-widest uppercase"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          >
            Scroll
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}
