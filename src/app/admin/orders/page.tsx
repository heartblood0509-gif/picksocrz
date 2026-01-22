'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllOrders, updateOrderStatus } from '@/lib/firebase/firestore';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getAllOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const totalRevenue = orders
    .filter(o => o.payment.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">주문 관리</h1>
          <p className="text-gray-400">
            총 {orders.length}건의 주문 / 매출 ₩{formatPrice(totalRevenue)}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {orders.filter(o => o.status === 'pending').length}
          </p>
          <p className="text-gray-400 text-sm">대기중</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {orders.filter(o => o.status === 'confirmed').length}
          </p>
          <p className="text-gray-400 text-sm">확정</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {orders.filter(o => o.status === 'completed').length}
          </p>
          <p className="text-gray-400 text-sm">완료</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {orders.filter(o => o.status === 'cancelled').length}
          </p>
          <p className="text-gray-400 text-sm">취소</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="주문번호 또는 상품명으로 검색..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { value: 'all', label: '전체' },
            { value: 'pending', label: '대기중' },
            { value: 'confirmed', label: '확정' },
            { value: 'completed', label: '완료' },
            { value: 'cancelled', label: '취소' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value as typeof statusFilter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === item.value
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-400">데이터를 불러오는 중...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400">
              {searchQuery ? '검색 결과가 없습니다.' : '주문이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">주문번호</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">상품</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">금액</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">상태</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">결제</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">주문일</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium text-sm">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const statusBadge = getStatusBadge(order.status);
                  const paymentBadge = getPaymentStatusBadge(order.payment.status);
                  const orderDate = order.createdAt instanceof Date
                    ? order.createdAt
                    : order.createdAt.toDate();

                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="text-white font-mono text-sm">{order.orderNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-white font-medium">{order.productName}</p>
                          <p className="text-gray-400 text-sm">{order.quantity}명</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-cyan-400 font-bold">₩{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${paymentBadge.className}`}>
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-sm">
                        {formatDate(orderDate)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="상세 보기"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a1a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">주문 상세</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">주문번호</p>
                <p className="text-white font-mono">{selectedOrder.orderNumber}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">상품</p>
                <p className="text-white font-medium">{selectedOrder.productName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">인원</p>
                  <p className="text-white">{selectedOrder.quantity}명</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">금액</p>
                  <p className="text-cyan-400 font-bold">₩{formatPrice(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">주문 상태</p>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => {
                    const badge = getStatusBadge(status);
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedOrder.id, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedOrder.status === status
                            ? badge.className + ' ring-2 ring-white/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {badge.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">결제 상태</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  getPaymentStatusBadge(selectedOrder.payment.status).className
                }`}>
                  {getPaymentStatusBadge(selectedOrder.payment.status).label}
                </span>
              </div>

              {selectedOrder.payment.tossPaymentKey && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">결제 키</p>
                  <p className="text-white font-mono text-sm break-all">
                    {selectedOrder.payment.tossPaymentKey}
                  </p>
                </div>
              )}

              <div>
                <p className="text-gray-400 text-sm mb-1">주문일</p>
                <p className="text-white">
                  {formatDate(
                    selectedOrder.createdAt instanceof Date
                      ? selectedOrder.createdAt
                      : selectedOrder.createdAt.toDate()
                  )}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
