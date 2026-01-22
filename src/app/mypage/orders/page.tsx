'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
// Orders are fetched via API endpoint
import { Order } from '@/lib/types';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
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

const getPaymentStatusBadge = (status: Order['payment']['status']) => {
  switch (status) {
    case 'pending':
      return { label: '결제 대기', className: 'bg-yellow-500/20 text-yellow-400' };
    case 'completed':
      return { label: '결제 완료', className: 'bg-green-500/20 text-green-400' };
    case 'failed':
      return { label: '결제 실패', className: 'bg-red-500/20 text-red-400' };
    case 'refunded':
      return { label: '환불됨', className: 'bg-gray-500/20 text-gray-400' };
    default:
      return { label: status, className: 'bg-gray-500/20 text-gray-400' };
  }
};

export default function OrdersPage() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [allOrdersDebug, setAllOrdersDebug] = useState<string>('');

  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) {
      setDebugInfo('인증 로딩 중...');
      return;
    }

    const fetchOrders = async () => {
      // Use firebaseUser.uid as primary source
      const userId = firebaseUser?.uid || user?.uid;
      const userEmail = firebaseUser?.email || user?.email;

      setDebugInfo(`내 userId: ${userId || 'none'}, email: ${userEmail || 'none'}`);

      if (!userId) {
        setLoading(false);
        setDebugInfo('로그인이 필요합니다');
        return;
      }

      try {
        setError(null);
        console.log('Fetching orders for userId:', userId, 'email:', userEmail);

        // Use API endpoint to fetch orders (bypasses client-side security rules)
        const response = await fetch(`/api/orders/user?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(userEmail || '')}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders');
        }

        console.log('Orders fetched via API:', data);
        setOrders(data.orders || []);
        setDebugInfo(`내 주문 ${data.count}건 (userId: ${userId})`);
        setAllOrdersDebug('');
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err instanceof Error ? err.message : '주문 내역을 불러오는데 실패했습니다.');
        setDebugInfo(`에러: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.uid, user?.email, firebaseUser?.uid, firebaseUser?.email, authLoading]);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">주문 내역</h1>
        <p className="text-gray-400">크루즈 예약 및 결제 내역을 확인하세요.</p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {[
          { value: 'all', label: '전체' },
          { value: 'pending', label: '대기중' },
          { value: 'confirmed', label: '확정' },
          { value: 'completed', label: '완료' },
          { value: 'cancelled', label: '취소됨' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === item.value
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </motion.div>

      {/* Debug Info - 개발 중에만 표시 */}
      {(debugInfo || allOrdersDebug) && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-xs space-y-1">
          <div>디버그: {debugInfo}</div>
          {allOrdersDebug && <div className="text-yellow-400">{allOrdersDebug}</div>}
        </div>
      )}

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="text-red-400">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
            >
              다시 시도
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400">
              {filter === 'all' ? '주문 내역이 없습니다.' : `${filter === 'pending' ? '대기중인' : filter === 'confirmed' ? '확정된' : filter === 'completed' ? '완료된' : '취소된'} 주문이 없습니다.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const statusBadge = getStatusBadge(order.status);
              const paymentBadge = getPaymentStatusBadge(order.payment?.status || 'pending');

              // Safely parse date
              let orderDate: Date;
              if (order.createdAt instanceof Date) {
                orderDate = order.createdAt;
              } else if (order.createdAt && typeof order.createdAt.toDate === 'function') {
                orderDate = order.createdAt.toDate();
              } else {
                orderDate = new Date();
              }

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">주문번호</p>
                      <p className="text-white font-mono">{order.orderNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentBadge.className}`}>
                        {paymentBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1">{order.productName}</h3>
                        <div className="space-y-1 text-sm text-gray-400">
                          <p>인원: {order.quantity}명</p>
                          <p>주문일: {formatDate(orderDate)}</p>
                          {order.travelDate && (
                            <p>여행일: {formatDate(
                              order.travelDate instanceof Date
                                ? order.travelDate
                                : order.travelDate.toDate()
                            )}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">결제 금액</p>
                        <p className="text-xl font-bold text-cyan-400">₩{formatPrice(order.totalAmount)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="px-4 pb-4 flex flex-wrap gap-2">
                    {order.status === 'confirmed' && (
                      <button className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-colors">
                        예약 상세 보기
                      </button>
                    )}
                    {order.status === 'pending' && order.payment.status === 'pending' && (
                      <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                        결제하기
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button className="px-4 py-2 bg-white/5 border border-white/10 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
                        예약 취소
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <button className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition-colors">
                        리뷰 작성
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
