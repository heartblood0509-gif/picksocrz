'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Google Apps Script 웹 앱 URL (배포 후 여기에 실제 URL 입력)
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    message: ''
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Google Apps Script로 데이터 전송
      if (GOOGLE_SCRIPT_URL) {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // CORS 우회
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 처리
        setIsSubmitted(true);
      } else {
        // URL이 설정되지 않은 경우 시뮬레이션
        console.log('Form data:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setPrivacyAgreed(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      destination: '',
      message: ''
    });
  };

  return (
    <>
      {/* 개인정보 처리방침 모달 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPrivacyModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 md:p-8"
          >
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">개인정보 수집 및 이용 동의</h3>

            <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">1. 수집하는 개인정보 항목</h4>
                <p className="text-gray-400">
                  필수항목: 이름, 연락처, 이메일<br />
                  선택항목: 관심 목적지, 문의 내용
                </p>
              </div>

              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">2. 개인정보의 수집 및 이용 목적</h4>
                <p className="text-gray-400">
                  - 크루즈 상품 상담 및 예약 서비스 제공<br />
                  - 고객 문의에 대한 답변 및 상담<br />
                  - 맞춤형 여행 상품 안내 및 마케팅 정보 제공
                </p>
              </div>

              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">3. 개인정보의 보유 및 이용 기간</h4>
                <p className="text-gray-400">
                  수집일로부터 <strong className="text-white">1년간</strong> 보관 후 지체 없이 파기합니다.<br />
                  단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
                </p>
              </div>

              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">4. 동의 거부권 및 불이익</h4>
                <p className="text-gray-400">
                  귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.<br />
                  다만, 필수 항목에 대한 동의를 거부할 경우 상담 서비스 이용이 제한될 수 있습니다.
                </p>
              </div>

              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">5. 개인정보 처리 위탁</h4>
                <p className="text-gray-400">
                  당사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.<br />
                  - 위탁업체: Google LLC (데이터 저장 및 관리)<br />
                  - 위탁업무: 고객 문의 데이터 저장
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-gray-500 text-xs">
                  ※ 개인정보 관련 문의: cruise@picksocruise.com<br />
                  ※ 개인정보보호 책임자: 홍길동 (privacy@picksocruise.com)
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full mt-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-white font-semibold transition-colors"
            >
              확인
            </button>
          </motion.div>
        </div>
      )}

    <section id="contact" className="relative py-32 px-4 bg-[#030014]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-cyan-400 border border-cyan-400/30 rounded-full glass">
              CONTACT
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              꿈의 항해를 <br />
              <span className="text-gradient-ocean">시작하세요</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              크루즈 전문 상담사가 당신만의 완벽한 여정을 설계해 드립니다.
              지금 바로 문의하세요.
            </p>

            {/* Contact info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">전화 상담</p>
                  <p className="text-white font-medium">1588-0000</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">이메일</p>
                  <p className="text-white font-medium">cruise@oceanvoyage.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">본사</p>
                  <p className="text-white font-medium">서울시 강남구 테헤란로 123</p>
                </div>
              </div>
            </div>

            {/* Operating hours */}
            <div className="mt-10 p-6 rounded-2xl glass border border-white/10">
              <h4 className="text-white font-medium mb-4">상담 시간</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">평일</span>
                  <span className="text-white">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">토요일</span>
                  <span className="text-white">10:00 - 15:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">일요일/공휴일</span>
                  <span className="text-gray-500">휴무</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="p-8 rounded-3xl glass border border-white/10">
              {isSubmitted ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">감사합니다!</h3>
                  <p className="text-gray-400 mb-6">
                    문의가 접수되었습니다. <br />
                    24시간 내 연락드리겠습니다.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 text-cyan-400 border border-cyan-400/50 rounded-full hover:bg-cyan-400/10 transition-colors"
                  >
                    새 문의하기
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">이름 *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all duration-300"
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">연락처 *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all duration-300"
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">이메일 *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">관심 목적지</label>
                    <select
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all duration-300"
                    >
                      <option value="" className="bg-[#030014]">목적지 선택</option>
                      <option value="mediterranean" className="bg-[#030014]">지중해</option>
                      <option value="caribbean" className="bg-[#030014]">카리브해</option>
                      <option value="alaska" className="bg-[#030014]">알래스카</option>
                      <option value="norway" className="bg-[#030014]">노르웨이 피오르드</option>
                      <option value="asia" className="bg-[#030014]">동남아시아</option>
                      <option value="pacific" className="bg-[#030014]">남태평양</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">문의 내용</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all duration-300 resize-none"
                      placeholder="문의하실 내용을 입력해주세요..."
                    />
                  </div>

                  {/* 개인정보 수집 동의 */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        <span className="text-cyan-400">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="ml-2 text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                        >
                          내용보기
                        </button>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !privacyAgreed}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl text-white font-semibold hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-cyan-500/20"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        전송 중...
                      </span>
                    ) : (
                      '문의하기'
                    )}
                  </button>

                  <p className="text-gray-500 text-xs text-center">
                    * 필수 입력 항목입니다
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
}
