'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

const navLinks = [
  { href: '/about', label: '회사 소개' },
  { href: '/products', label: '상품 소개' },
  { href: '#destinations', label: '목적지' },
  { href: '#experience', label: '크루즈 체험' },
  { href: '#ships', label: '선박 소개' },
  { href: '#contact', label: '문의하기' },
  { href: '/news', label: '뉴스' },
];

export default function Navbar() {
  const { user, isAdmin, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const renderNavLink = (link: { href: string; label: string }, onClick?: () => void) => {
    const isAnchor = link.href.startsWith('#');
    const className = "text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-sm font-medium";

    if (isAnchor) {
      return (
        <a key={link.href} href={link.href} className={className} onClick={onClick}>
          {link.label}
        </a>
      );
    }

    return (
      <Link key={link.href} href={link.href} className={className} onClick={onClick}>
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#030014]/80 backdrop-blur-md border-b border-white/10'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                PICKSO<span className="text-cyan-400"> Cruise</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => renderNavLink(link))}
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              ) : user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-white text-sm hidden lg:block">{user.displayName || '사용자'}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-white font-medium text-sm truncate">{user.displayName}</p>
                          <p className="text-gray-400 text-xs truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/mypage"
                            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            마이페이지
                          </Link>
                          <Link
                            href="/mypage/orders"
                            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            주문내역
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              관리자
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-white/10 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            로그아웃
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full text-white font-medium text-sm hover:scale-105 transition-transform duration-200 glow-ocean"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="absolute top-20 left-4 right-4 bg-[#030014]/95 backdrop-blur-lg rounded-2xl border border-white/10 p-6 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isAnchor = link.href.startsWith('#');
                  if (isAnchor) {
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-lg font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-lg font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-white/10 pt-4 mt-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          {user.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.displayName}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/mypage"
                        className="block w-full text-center py-3 text-white bg-white/10 rounded-lg mb-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        마이페이지
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block w-full text-center py-3 text-cyan-400 bg-cyan-500/10 rounded-lg mb-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          관리자
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-3 text-red-400 bg-red-500/10 rounded-lg"
                      >
                        로그아웃
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block w-full text-center py-3 text-white bg-white/10 rounded-lg mb-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        로그인
                      </Link>
                      <Link
                        href="/signup"
                        className="block w-full text-center py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg text-white font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        회원가입
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
