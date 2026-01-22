'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
import { updateUserProfile } from '@/lib/firebase/firestore';

export default function ProfilePage() {
  const { user, firebaseUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
      });

      setMessage({ type: 'success', text: '프로필이 성공적으로 업데이트되었습니다.' });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: '프로필 업데이트에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '-';
    const d = date instanceof Date ? date : date.toDate();
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">프로필 설정</h1>
        <p className="text-gray-400">계정 정보를 확인하고 수정하세요.</p>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Profile Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.displayName || '사용자'}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user?.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {user?.role === 'admin' ? '관리자' : '일반회원'}
                </span>
                {firebaseUser?.emailVerified && (
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    이메일 인증됨
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">이름</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                  placeholder="이름을 입력하세요"
                />
              ) : (
                <p className="text-white">{user?.displayName || '-'}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">이메일</label>
              <p className="text-white">{user?.email}</p>
              <p className="text-gray-500 text-xs mt-1">이메일은 변경할 수 없습니다.</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">전화번호</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                  placeholder="010-0000-0000"
                />
              ) : (
                <p className="text-white">{user?.phoneNumber || '-'}</p>
              )}
            </div>

            {/* Created At */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">가입일</label>
              <p className="text-white">{formatDate(user?.createdAt)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? '저장 중...' : '저장하기'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      displayName: user?.displayName || '',
                      phoneNumber: user?.phoneNumber || '',
                    });
                  }}
                  className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                프로필 수정
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">보안 설정</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">비밀번호 변경</p>
              <p className="text-gray-400 text-sm">정기적으로 비밀번호를 변경하세요.</p>
            </div>
            <button className="px-4 py-2 border border-white/20 text-white rounded-lg text-sm hover:bg-white/10 transition-colors">
              변경하기
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">이메일 인증</p>
              <p className="text-gray-400 text-sm">
                {firebaseUser?.emailVerified
                  ? '이메일이 인증되었습니다.'
                  : '이메일 인증을 완료해주세요.'}
              </p>
            </div>
            {!firebaseUser?.emailVerified && (
              <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors">
                인증 메일 발송
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-red-400 mb-4">위험 구역</h3>

        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl">
          <div>
            <p className="text-white font-medium">계정 삭제</p>
            <p className="text-gray-400 text-sm">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
          </div>
          <button className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
            계정 삭제
          </button>
        </div>
      </motion.div>
    </div>
  );
}
