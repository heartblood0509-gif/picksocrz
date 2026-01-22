'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { images } from '@/lib/images';

const destinations = [
  {
    title: '지중해',
    subtitle: 'Mediterranean',
    description: '그리스, 이탈리아, 스페인의 아름다운 해안을 따라 펼쳐지는 문화와 역사의 여정',
    image: images.destinations.mediterranean,
    color: 'from-blue-500 to-cyan-500',
    highlights: ['산토리니', '로마', '바르셀로나']
  },
  {
    title: '카리브해',
    subtitle: 'Caribbean',
    description: '청록빛 바다와 백사장 해변, 열대의 낙원에서 즐기는 완벽한 휴식',
    image: images.destinations.caribbean,
    color: 'from-cyan-500 to-teal-500',
    highlights: ['바하마', '자메이카', '세인트 루시아']
  },
  {
    title: '알래스카',
    subtitle: 'Alaska',
    description: '장엄한 빙하와 야생 동물, 대자연의 경이로움을 만나는 모험',
    image: images.destinations.alaska,
    color: 'from-slate-400 to-blue-400',
    highlights: ['빙하만', '주노', '케치칸']
  },
  {
    title: '노르웨이 피오르드',
    subtitle: 'Norwegian Fjords',
    description: '웅장한 피오르드와 오로라, 북유럽의 신비로운 자연경관',
    image: images.destinations.norway,
    color: 'from-indigo-500 to-purple-500',
    highlights: ['베르겐', '송네 피오르드', '트롬소']
  },
  {
    title: '동남아시아',
    subtitle: 'Southeast Asia',
    description: '이국적인 문화와 맛, 활기찬 도시와 고요한 사원의 조화',
    image: images.destinations.asia,
    color: 'from-amber-500 to-orange-500',
    highlights: ['싱가포르', '태국', '베트남']
  },
  {
    title: '남태평양',
    subtitle: 'South Pacific',
    description: '에메랄드빛 라군과 폴리네시아 문화, 지상 최후의 낙원',
    image: images.destinations.pacific,
    color: 'from-teal-400 to-emerald-500',
    highlights: ['타히티', '피지', '보라보라']
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -10
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 50,
      damping: 20
    }
  }
};

export default function DestinationsSection() {
  return (
    <section id="destinations" className="relative py-32 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#030014] to-[#030014]" />

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
            DESTINATIONS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            꿈꿔왔던 <span className="text-gradient-ocean">목적지</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            전 세계 100개 이상의 경이로운 목적지로 떠나는 여정.
            당신만의 특별한 항해를 시작하세요.
          </p>
        </motion.div>

        {/* Destinations Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {destinations.map((destination, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="group relative cursor-pointer"
            >
              <div className="relative h-[420px] rounded-2xl overflow-hidden">
                {/* Background Image */}
                <Image
                  src={destination.image}
                  alt={destination.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/50 to-transparent" />

                {/* Color overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${destination.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform transition-transform duration-300 group-hover:translate-y-[-10px]">
                    <p className="text-cyan-400 text-sm font-medium mb-1">
                      {destination.subtitle}
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {destination.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {destination.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights.map((highlight, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>

                {/* Border glow on hover */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-cyan-400/50 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <button className="px-8 py-4 border border-cyan-400/50 rounded-full text-cyan-400 font-medium hover:bg-cyan-400/10 transition-all duration-300">
            모든 목적지 보기 →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
