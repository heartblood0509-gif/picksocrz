'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getAllProducts, updateProduct, deleteProduct } from '@/lib/firebase/firestore';
import { Product } from '@/lib/types';
import { staticProducts } from '@/lib/data/products';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [useStaticData, setUseStaticData] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getAllProducts();
        if (fetchedProducts.length === 0) {
          // Use static data if no products in Firestore
          setProducts(staticProducts as unknown as Product[]);
          setUseStaticData(true);
        } else {
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback to static data
        setProducts(staticProducts as unknown as Product[]);
        setUseStaticData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.nameKo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    if (useStaticData) {
      alert('정적 데이터를 사용 중입니다. Firebase 연결 후 변경 가능합니다.');
      return;
    }

    try {
      await updateProduct(productId, { isActive: !currentStatus });
      setProducts(products.map(p =>
        p.id === productId ? { ...p, isActive: !currentStatus } : p
      ));
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('상품 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (useStaticData) {
      alert('정적 데이터를 사용 중입니다. Firebase 연결 후 삭제 가능합니다.');
      return;
    }

    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setSelectedProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">상품 관리</h1>
          <p className="text-gray-400">
            총 {products.length}개의 상품
            {useStaticData && (
              <span className="ml-2 text-amber-400">(정적 데이터)</span>
            )}
          </p>
        </div>
        <button
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          + 새 상품 등록
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
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
            placeholder="상품명으로 검색..."
            className="w-full md:w-96 pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
          />
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-gray-400">데이터를 불러오는 중...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-400">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src={product.images.main}
                    alt={product.nameKo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.isActive ? '판매중' : '비활성'}
                    </span>
                    {product.isFeatured && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                        BEST
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white text-2xl font-bold">
                      ₩{formatPrice(product.price)}
                    </p>
                    {product.originalPrice && (
                      <p className="text-gray-400 line-through text-sm">
                        ₩{formatPrice(product.originalPrice)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                      {product.name}
                    </span>
                    <span className="px-2 py-1 bg-white/10 text-gray-300 rounded text-xs">
                      {product.duration.nights}박 {product.duration.days}일
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-2">{product.nameKo}</h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.descriptionKo}
                  </p>

                  {/* Destinations */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.destinations.slice(0, 3).map((dest) => (
                      <span key={dest} className="text-gray-500 text-xs">
                        {dest}
                      </span>
                    ))}
                    {product.destinations.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{product.destinations.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm hover:bg-white/10 transition-colors"
                    >
                      상세 보기
                    </button>
                    <button
                      onClick={() => handleToggleActive(product.id, product.isActive)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        product.isActive
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      {product.isActive ? '비활성화' : '활성화'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">상품 상세</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image
                  src={selectedProduct.images.main}
                  alt={selectedProduct.nameKo}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">영문명</p>
                  <p className="text-white font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">한글명</p>
                  <p className="text-white font-medium">{selectedProduct.nameKo}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-gray-400 text-sm mb-1">상품 설명</p>
                <p className="text-white">{selectedProduct.descriptionKo}</p>
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">판매가</p>
                  <p className="text-cyan-400 font-bold text-xl">₩{formatPrice(selectedProduct.price)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">정가</p>
                  <p className="text-white">
                    {selectedProduct.originalPrice
                      ? `₩${formatPrice(selectedProduct.originalPrice)}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">기간</p>
                  <p className="text-white">
                    {selectedProduct.duration.nights}박 {selectedProduct.duration.days}일
                  </p>
                </div>
              </div>

              {/* Destinations */}
              <div>
                <p className="text-gray-400 text-sm mb-2">여행지</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.destinations.map((dest) => (
                    <span key={dest} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                      {dest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <p className="text-gray-400 text-sm mb-2">포함 사항</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProduct.featuresKo.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${selectedProduct.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-white">{selectedProduct.isActive ? '판매중' : '비활성'}</span>
                </div>
                {selectedProduct.isFeatured && (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                    BEST SELLER
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                수정하기
              </button>
              <button
                onClick={() => handleDeleteProduct(selectedProduct.id)}
                className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
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
