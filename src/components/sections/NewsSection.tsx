'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  thumbnail: string | null;
}

interface NewsResponse {
  success: boolean;
  articles: NewsItem[];
  lastUpdated: string;
  error?: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNews = useCallback(async () => {
    try {
      const response = await fetch('/api/news');
      const data: NewsResponse = await response.json();
      setNews(data.articles);
      setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString('ko-KR'));
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();

    // Auto-refresh every hour (3600000ms)
    const interval = setInterval(fetchNews, 3600000);

    return () => clearInterval(interval);
  }, [fetchNews]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <section className="relative py-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-white">크루즈 뉴스</h2>
              <p className="text-sm text-gray-400">최신 크루즈 여행 소식</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            마지막 업데이트: {lastUpdated}
          </div>
        </motion.div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
            >
              {/* Thumbnail */}
              <div className="relative h-40 overflow-hidden">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-900/50 to-blue-900/50 flex items-center justify-center">
                    <svg className="w-12 h-12 text-cyan-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent" />

                {/* Date badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs text-gray-300">
                  {formatDate(item.pubDate)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {item.description}
                </p>

                {/* Read more indicator */}
                <div className="mt-3 flex items-center text-cyan-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>자세히 보기</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Refresh indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          <span className="inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            1시간마다 자동 업데이트
          </span>
        </motion.div>
      </div>
    </section>
  );
}
