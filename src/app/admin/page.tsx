'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllOrders, getAllUsers, getAllProducts } from '@/lib/firebase/firestore';
import { Order, User, Product } from '@/lib/types';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getStatusBadge = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return { label: '대기중', className: 'bg-yellow-500/20 text-yellow-400' };
    case 'confirmed':
      return { label: '확정', className: 'bg-green-500/20 text-green-400' };
    case 'cancelled':
      return { label: '취소됨', className: 'bg-red-500/20 text-red-400' };
    case 'completed':
      return { label: '완료', className: 'bg-blue-500/20 text-blue-400' };
    default:
      return { label: status, className: 'bg-gray-500/20 text-gray-400' };
  }
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeProducts: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orders, users, products] = await Promise.all([
          getAllOrders(),
          getAllUsers(),
          getAllProducts(),
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalRevenue = orders
          .filter(o => o.payment.status === 'completed')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const pendingOrders = orders.filter(o => o.status === 'pending').length;

        const todayOrders = orders.filter(o => {
          const orderDate = o.createdAt instanceof Date ? o.createdAt : o.createdAt.toDate();
          return orderDate >= today;
        }).length;

        const activeProducts = products.filter(p => p.isActive).length;

        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalUsers: users.length,
          activeProducts,
          pendingOrders,
          todayOrders,
        });

        setRecentOrders(orders.slice(0, 5));
        setRecentUsers(users.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">대시보드</h1>
        <p className="text-gray-400">PICKSO Cruise 관리자 대시보드에 오신 것을 환영합니다.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">₩{formatPrice(stats.totalRevenue)}</p>
          <p className="text-gray-400 text-sm">총 매출</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
          <p className="text-gray-400 text-sm">총 주문</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          <p className="text-gray-400 text-sm">총 회원</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{stats.activeProducts}</p>
          <p className="text-gray-400 text-sm">활성 상품</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
          <p className="text-gray-400 text-sm">대기 주문</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{stats.todayOrders}</p>
          <p className="text-gray-400 text-sm">오늘 주문</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Link
          href="/admin/orders"
          className="group bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">주문 관리</h3>
              <p className="text-gray-400 text-sm">주문 현황을 확인하고 관리하세요</p>
            </div>
            <svg className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="group bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">회원 관리</h3>
              <p className="text-gray-400 text-sm">회원 정보를 확인하고 관리하세요</p>
            </div>
            <svg className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="group bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5 hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">상품 관리</h3>
              <p className="text-gray-400 text-sm">크루즈 상품을 등록하고 관리하세요</p>
            </div>
            <svg className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">최근 주문</h2>
            <Link
              href="/admin/orders"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              전체 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-400 py-8">주문이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const orderDate = order.createdAt instanceof Date
                  ? order.createdAt
                  : order.createdAt.toDate();

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{order.productName}</p>
                        <p className="text-gray-400 text-xs">{formatDate(orderDate)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">₩{formatPrice(order.totalAmount)}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">최근 가입 회원</h2>
            <Link
              href="/admin/users"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              전체 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-center text-gray-400 py-8">가입한 회원이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => {
                const joinDate = user.createdAt instanceof Date
                  ? user.createdAt
                  : user.createdAt.toDate();

                return (
                  <div
                    key={user.uid}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user.displayName || '사용자'}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.role === 'admin' ? '관리자' : '일반회원'}
                      </span>
                      <p className="text-gray-500 text-xs mt-1">{formatDate(joinDate)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
