import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Lock, History, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { backendApi } from '../services/backendApi';

export const Profile = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'security'>('history');
  const { history, removeFromHistory } = useUserStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);
    try {
      await backendApi.put('/user/profile/password', {
        currentPassword,
        newPassword
      });
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayMovie = (movieSlug: string, episodeSlug: string, currentEpisode: string) => {
    if (episodeSlug) {
      navigate(`/xem-phim/${movieSlug}/${episodeSlug}`);
    } else {
      navigate(`/phim/${movieSlug}`, { state: { autoPlayEpisode: currentEpisode } });
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12 px-4 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Tài khoản của tôi</h1>
        <p className="text-gray-400 mb-8">{user?.email}</p>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-4 px-6 font-medium transition-colors relative ${
              activeTab === 'history' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-5 h-5" />
            Lịch sử xem
            {activeTab === 'history' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 py-4 px-6 font-medium transition-colors relative ${
              activeTab === 'security' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-5 h-5" />
            Bảo mật
            {activeTab === 'security' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    Bạn chưa xem bộ phim nào gần đây.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {history.map((item) => {
                        const percentage = item.totalDuration 
                          ? Math.min((item.currentTime / item.totalDuration) * 100, 100) 
                          : item.progressPercentage;

                        return (
                          <motion.div
                            key={item.movieSlug}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 rounded-lg overflow-hidden relative group"
                          >
                            <div className="relative aspect-video cursor-pointer" onClick={() => handlePlayMovie(item.movieSlug, item.episodeSlug, item.currentEpisode)}>
                              <img src={item.poster_url} alt={item.movieTitle} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-12 h-12 text-white opacity-80" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                            
                            <div className="p-4 flex items-start justify-between gap-4">
                              <div className="flex-1 cursor-pointer" onClick={() => handlePlayMovie(item.movieSlug, item.episodeSlug, item.currentEpisode)}>
                                <h3 className="font-bold text-white text-sm line-clamp-1">{item.movieTitle}</h3>
                                <p className="text-xs text-gray-400 mt-1">{item.currentEpisode}</p>
                              </div>
                              <button
                                onClick={() => removeFromHistory(item.movieSlug)}
                                className="p-2 text-gray-500 hover:text-primary hover:bg-white/5 rounded-full transition-colors"
                                title="Xoá khỏi lịch sử"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md"
              >
                <h2 className="text-xl font-bold text-white mb-6">Đổi mật khẩu</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
