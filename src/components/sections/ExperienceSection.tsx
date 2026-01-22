'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { images } from '@/lib/images';

gsap.registerPlugin(ScrollTrigger);

const experiences = [
  {
    id: 1,
    title: '미슐랭 스타 다이닝',
    subtitle: 'Fine Dining',
    description: '세계적인 셰프들이 선보이는 미식의 향연. 12개의 레스토랑에서 글로벌 퀴진을 경험하세요.',
    image: images.experiences.dining,
    features: ['프라이빗 다이닝', '와인 페어링', '셰프 테이블']
  },
  {
    id: 2,
    title: '프라이빗 스위트',
    subtitle: 'Luxury Suites',
    description: '바다가 펼쳐지는 파노라마 뷰와 함께하는 최상급 스위트룸. 개인 버틀러 서비스 제공.',
    image: images.experiences.suite,
    features: ['오션뷰 발코니', '24시간 버틀러', '프리미엄 어메니티']
  },
  {
    id: 3,
    title: '월드클래스 스파',
    subtitle: 'Wellness Spa',
    description: '바다 위의 프리미엄 웰니스 센터. 전문 테라피스트의 힐링 트리트먼트를 만나보세요.',
    image: images.experiences.spa,
    features: ['하이드로테라피', '아로마 마사지', '요가 클래스']
  },
  {
    id: 4,
    title: '엔터테인먼트',
    subtitle: 'Entertainment',
    description: '브로드웨이 수준의 공연과 라이브 음악, 카지노까지. 매일 밤 특별한 엔터테인먼트.',
    image: images.experiences.entertainment,
    features: ['뮤지컬 쇼', '라이브 밴드', '프리미엄 카지노']
  },
  {
    id: 5,
    title: '익스커션 투어',
    subtitle: 'Shore Excursions',
    description: '각 기항지에서 즐기는 프라이빗 투어. 현지 문화와 자연을 깊이 있게 체험하세요.',
    image: images.experiences.excursion,
    features: ['프라이빗 가이드', 'VIP 액세스', '맞춤형 일정']
  }
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const cards = cardsRef.current;

    if (!section || !container || !cards) return;

    const totalWidth = cards.scrollWidth - window.innerWidth + 200;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${totalWidth}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1
      }
    });

    tl.to(cards, {
      x: -totalWidth,
      ease: 'none'
    });

    // Card animations
    const cardElements = cards.querySelectorAll('.experience-card');
    cardElements.forEach((card) => {
      ScrollTrigger.create({
        trigger: card,
        containerAnimation: tl,
        start: 'left center',
        end: 'right center',
        onEnter: () => {
          gsap.to(card, {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.3
          });
        },
        onLeave: () => {
          gsap.to(card, {
            scale: 0.9,
            opacity: 0.3,
            filter: 'blur(4px)',
            duration: 0.3
          });
        },
        onEnterBack: () => {
          gsap.to(card, {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.3
          });
        },
        onLeaveBack: () => {
          gsap.to(card, {
            scale: 0.9,
            opacity: 0.3,
            filter: 'blur(4px)',
            duration: 0.3
          });
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative min-h-screen bg-[#030014] overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-amber-500/5" />

      {/* Header */}
      <div className="absolute top-20 left-0 right-0 z-20 px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-amber-400 border border-amber-400/30 rounded-full glass">
            EXPERIENCE
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            프리미엄 <span className="text-gradient-gold">크루즈 체험</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl">
            바다 위에서 경험하는 세계 최고 수준의 럭셔리 서비스
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll container */}
      <div ref={containerRef} className="h-screen flex items-center pt-32">
        <div ref={cardsRef} className="flex gap-8 px-8 pl-[10vw]">
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className={`experience-card flex-shrink-0 w-[400px] md:w-[500px] ${
                index === 0 ? 'opacity-100 scale-100' : 'opacity-30 scale-90'
              }`}
              style={{
                filter: index === 0 ? 'blur(0px)' : 'blur(4px)'
              }}
            >
              <div className="h-[550px] rounded-3xl overflow-hidden relative group">
                {/* Background Image */}
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/60 to-transparent" />

                {/* Amber tint overlay */}
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div>
                    <p className="text-amber-400 text-sm font-medium mb-2">
                      {exp.subtitle}
                    </p>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {exp.title}
                    </h3>
                    <p className="text-gray-300 text-base mb-6 leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-3">
                      {exp.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 text-sm bg-amber-400/20 backdrop-blur-sm text-amber-300 rounded-full border border-amber-400/30"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Learn more */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <button className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors">
                      <span>자세히 보기</span>
                      <svg
                        className="w-4 h-4"
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
                    </button>
                  </div>
                </div>

                {/* Border */}
                <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-amber-400/30 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-gray-500">
        <span className="text-sm">스크롤하여 더 보기</span>
        <div className="flex gap-1">
          {experiences.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/20"
            />
          ))}
        </div>
        <svg
          className="w-5 h-5 animate-bounce"
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
    </section>
  );
}
