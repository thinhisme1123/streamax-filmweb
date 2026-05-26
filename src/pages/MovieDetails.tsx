import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
<<<<<<< HEAD
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Star, Clock, Globe, Film, Users, Clapperboard, MonitorPlay, ChevronDown, ChevronUp } from 'lucide-react';
=======
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowLeft, Star, Clock, Globe, Film, Users, Clapperboard, MonitorPlay, ChevronDown, ChevronUp, MessageSquare, Send, UserCircle } from 'lucide-react';
>>>>>>> 85ccd1d (feat: implement user profile management with watch history and password security features)
import { v4 as uuidv4 } from 'uuid';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { useBookmarks } from '../hooks/useBookmarks';
import { AppEpisode } from '../types/movie';
import { FavoriteButton } from '../components/FavoriteButton';
import { useAuthStore } from '../store/authStore';
import { backendApi } from '../services/backendApi';
import toast from 'react-hot-toast';

interface AppComment {
  _id: string;
  user: { email: string };
  movieSlug: string;
  rating: number;
  text: string;
  createdAt: string;
}

// Detail page skeleton
const DetailSkeleton = () => (
  <div className="min-h-screen bg-dark">
    <div className="relative h-[50vh] w-full bg-dark-light animate-pulse" />
    <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-32 relative z-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-64 h-96 bg-gray-700/50 rounded-xl animate-pulse shrink-0" />
        <div className="flex-1 space-y-4 pt-4">
          <div className="h-10 w-3/4 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-6 w-1/2 bg-gray-700/50 rounded animate-pulse" />
          <div className="flex gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-8 w-20 bg-gray-700/50 rounded-full animate-pulse" />)}
          </div>
          <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-gray-700/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// Fade-in variants for Framer Motion
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export const MovieDetails = () => {
  const { movieSlug } = useParams<{ movieSlug: string }>();
  const navigate = useNavigate();
  const { movie, loading, error } = useMovieDetail(movieSlug || '');
  const { isBookmarked } = useBookmarks();

  const [activeServer, setActiveServer] = useState(0);
  const [showAllCast, setShowAllCast] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const CHUNK_SIZE = 100;

  // Comments state
  const [comments, setComments] = useState<AppComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(10);
  const [hoverRating, setHoverRating] = useState(0);

  const currentServer = movie?.episodes ? movie.episodes[activeServer] : null;

  const episodeChunks = useMemo(() => {
    if (!currentServer || !currentServer.episodes) return [];
    const chunks = [];
    const allEpisodes = currentServer.episodes;
    for (let i = 0; i < allEpisodes.length; i += CHUNK_SIZE) {
      chunks.push(allEpisodes.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }, [currentServer]);

  useEffect(() => {
    setActiveChunkIndex(0);
  }, [activeServer]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieSlug]);

  // Auto-play episode if passed from Continue Watching
  useEffect(() => {
    if (movie && movie.episodes && location.state?.autoPlayEpisode) {
      for (const server of movie.episodes) {
        if (!server.episodes) continue;
        const episode = server.episodes.find(ep => ep.name === location.state.autoPlayEpisode);
        if (episode) {
<<<<<<< HEAD
          navigate(`/xem-phim/${movie.slug}/${episode.slug}`);
          // Clean up state so a refresh doesn't trigger it again
          window.history.replaceState({}, document.title);
          
=======
          // Clean up state so a refresh doesn't trigger it again
          window.history.replaceState({}, document.title);
          
          const serverIndex = movie.episodes.indexOf(server);
          navigate(`/xem-phim/${movie.slug}/${episode.slug}?server=${serverIndex}`);
>>>>>>> 85ccd1d (feat: implement user profile management with watch history and password security features)
          break;
        }
      }
    }
  }, [movie, location.state, navigate]);

  useEffect(() => {
    if (movie) {
      backendApi.get(`/comments/${movie.slug}`)
        .then(res => setComments(res.data || []))
        .catch(err => {
          console.error('Failed to fetch comments', err);
          setComments([]);
        });
    }
  }, [movie]);

  if (loading) return <DetailSkeleton />;

  if (error || !movie) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen flex items-center justify-center bg-dark">
        <div className="bg-red-900/30 border border-red-500/30 backdrop-blur-sm p-8 rounded-2xl text-white max-w-md">
          <h2 className="text-2xl font-bold mb-3">Không tìm thấy phim</h2>
          <p className="text-gray-300 mb-6">{error || 'Phim không tồn tại hoặc đã bị xoá.'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(movie.id);
  const displayCast = showAllCast ? (movie.cast || []) : (movie.cast || []).slice(0, 6);

  const handlePlayEpisode = (episode: AppEpisode) => {
<<<<<<< HEAD
    navigate(`/xem-phim/${movie.slug}/${episode.slug}`);
=======
    if (movie) {
      navigate(`/xem-phim/${movie.slug}/${episode.slug}?server=${activeServer}`);
    }
>>>>>>> 85ccd1d (feat: implement user profile management with watch history and password security features)
  };

  const handlePlayFirst = () => {
    if (movie?.episodes?.length > 0 && movie.episodes[0].episodes?.length > 0) {
      navigate(`/xem-phim/${movie.slug}/${movie.episodes[0].episodes[0].slug}?server=0`);
    }
  };

  const handleCreateWatchParty = () => {
    if (!movie) return;
    const roomId = uuidv4();
    let firstEpisodeSlug = '';
    if (movie?.episodes?.length > 0 && movie.episodes[0].episodes?.length > 0) {
      firstEpisodeSlug = movie.episodes[0].episodes[0].slug;
    }
    navigate(`/watch-party/${roomId}?movieSlug=${movie.slug}&episodeSlug=${firstEpisodeSlug}`);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }
    if (!commentText.trim() || !movie) return;

    try {
      const res = await backendApi.post('/comments', {
        movieSlug: movie.slug,
        rating,
        text: commentText
      });
      setComments([res.data, ...comments]);
      setCommentText('');
      setRating(10);
      toast.success('Bình luận thành công');
    } catch (error) {
      toast.error('Lỗi khi đăng bình luận');
    }
  };

  return (
    <div className="min-h-screen bg-dark pb-20">
      {/* ===== BACKDROP ===== */}
      <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={movie.thumbnailUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover blur-sm scale-105"
          />
          {/* 80% black overlay */}
          <div className="absolute inset-0 bg-black/80" />
          {/* Bottom gradient blend into page */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
          {/* Left gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent" />
        </div>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate(-1)}
          className="absolute top-24 left-4 md:left-12 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Quay lại</span>
        </motion.button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-64 md:-mt-80 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">

          {/* --- Poster (left) --- */}
          <motion.div
            custom={0}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="shrink-0 mx-auto md:mx-0"
          >
            <div className="relative group">
              <img
                src={movie.posterUrl || movie.thumbnailUrl}
                alt={movie.title}
                className="w-56 md:w-72 rounded-xl shadow-2xl shadow-black/60 border border-white/5 object-cover"
                style={{ aspectRatio: '2/3' }}
              />
              {/* Quality badge */}
              <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-md">
                {movie.quality}
              </div>
              {/* Play overlay on hover */}
              <button
                onClick={handlePlayFirst}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center shadow-xl">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </button>
            </div>
          </motion.div>

          {/* --- Info (right) --- */}
          <div className="flex-1 text-white min-w-0">
            <motion.h1
              custom={1}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-3xl md:text-5xl font-bold mb-2 leading-tight"
            >
              {movie.title}
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="text-base md:text-lg text-gray-400 italic mb-5"
            >
              {movie.originalTitle}
            </motion.p>

            {/* Metadata chips */}
            <motion.div
              custom={3}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <span className="flex items-center gap-1.5 bg-primary/15 text-primary border border-primary/30 px-3 py-1.5 rounded-full text-sm font-medium">
                <Star className="w-3.5 h-3.5" /> {movie.year}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm text-gray-300">
                <Clock className="w-3.5 h-3.5" /> {movie.duration}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm text-gray-300">
                <Globe className="w-3.5 h-3.5" /> {movie.language}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm text-gray-300">
                <MonitorPlay className="w-3.5 h-3.5" /> {movie.episodeCurrent}
              </span>
              {movie.genres.map(g => (
                <span key={g.slug} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm text-gray-300">
                  {g.name}
                </span>
              ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div
              custom={4}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              <button
                onClick={handlePlayFirst}
                className="flex items-center gap-2.5 bg-primary hover:bg-primary-hover px-7 py-3.5 rounded-lg font-bold text-white transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-white" /> Xem Phim
              </button>
              <button
                onClick={handleCreateWatchParty}
                className="flex items-center gap-2.5 bg-purple-600 hover:bg-purple-700 px-7 py-3.5 rounded-lg font-bold text-white transition-all hover:shadow-lg hover:shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Users className="w-5 h-5" /> Tạo phòng xem chung
              </button>
              <FavoriteButton
                movie={{
                  id: movie.id,
                  title: movie.title,
                  slug: movie.slug,
                  description: movie.synopsis,
                  thumbnailUrl: movie.thumbnailUrl,
                  posterUrl: movie.posterUrl,
                  videoUrl: '',
                  genre: movie.genres.map(g => g.name).join(', '),
                  duration: movie.duration,
                  year: movie.year,
                  matchScore: 95,
                  maturityRating: '13+',
                }}
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/10 px-7 py-3.5 rounded-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] group"
                iconClassName="w-5 h-5"
              >
                {bookmarked ? 'Đã Lưu' : 'Lưu Phim'}
              </FavoriteButton>
            </motion.div>

            {/* Synopsis */}
            <motion.div
              custom={5}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-primary" /> Nội dung phim
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                {movie.synopsis || 'Nội dung đang được cập nhật...'}
              </p>
            </motion.div>

            {/* Cast & Director */}
            <motion.div
              custom={6}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {/* Director */}
              {movie?.director?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Clapperboard className="w-3.5 h-3.5" /> Đạo diễn
                  </h4>
                  <p className="text-gray-200">{movie.director.join(', ')}</p>
                </div>
              )}

              {/* Country */}
              {movie?.countries?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Quốc gia
                  </h4>
                  <p className="text-gray-200">{movie.countries.map(c => c.name).join(', ')}</p>
                </div>
              )}
            </motion.div>

            {/* Cast */}
            {movie?.cast?.length > 0 && (
              <motion.div
                custom={7}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
              >
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Diễn viên
                </h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(displayCast || []).map((actor, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(`/dien-vien/${encodeURIComponent(actor)}`)}
                      className="bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 px-3 py-1.5 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                    >
                      {actor}
                    </button>
                  ))}
                </div>
                {movie.cast.length > 6 && (
                  <button
                    onClick={() => setShowAllCast(!showAllCast)}
                    className="text-primary text-sm hover:underline flex items-center gap-1 mt-1"
                  >
                    {showAllCast ? <><ChevronUp className="w-3.5 h-3.5" /> Thu gọn</> : <><ChevronDown className="w-3.5 h-3.5" /> Xem thêm ({movie.cast.length - 6})</>}
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ===== EPISODES ===== */}
      {movie?.episodes?.length > 0 && (
        <motion.div
          custom={8}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 md:px-12 mt-12"
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MonitorPlay className="w-5 h-5 text-primary" />
            Danh sách tập phim
            <span className="text-sm font-normal text-gray-400">
              ({movie.episodeCurrent} / {movie.episodeTotal} tập)
            </span>
          </h3>

          {/* Server tabs */}
          {movie.episodes.length > 1 && (
            <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap gap-2 mb-6 pb-2 scrollbar-hide">
              {(movie.episodes || []).map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveServer(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeServer === idx
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {server.serverName}
                </button>
              ))}
            </div>
          )}

          {/* Chunk tabs */}
          {episodeChunks.length > 1 && (
            <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap gap-2 mb-6 pb-2 scrollbar-hide">
              {episodeChunks.map((chunk, index) => {
                const start = index * CHUNK_SIZE + 1;
                const end = start + chunk.length - 1;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveChunkIndex(index)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeChunkIndex === index
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {start}-{end}
                  </button>
                );
              })}
            </div>
          )}

          {/* Episode grid */}
          {currentServer && episodeChunks[activeChunkIndex] && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
<<<<<<< HEAD
              {currentServer.episodes.map((ep) => {
=======
              {(episodeChunks[activeChunkIndex] || []).map((ep) => {
>>>>>>> 85ccd1d (feat: implement user profile management with watch history and password security features)
                return (
                  <button
                    key={ep.slug}
                    onClick={() => handlePlayEpisode(ep)}
<<<<<<< HEAD
                    className={`relative px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group overflow-hidden bg-white/5 text-gray-300 border border-white/10 hover:bg-primary/20 hover:border-primary/50 hover:text-white`}
=======
                    className="relative px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group overflow-hidden bg-white/5 text-gray-300 border border-white/10 hover:bg-primary/20 hover:border-primary/50 hover:text-white"
>>>>>>> 85ccd1d (feat: implement user profile management with watch history and password security features)
                  >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    <div className="relative flex items-center justify-center gap-1.5">
                      <span className="truncate">{ep.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ===== COMMENTS & RATING ===== */}
      {movie && (
        <motion.div
          custom={9}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 md:px-12 mt-16"
        >
          <div className="bg-dark-light rounded-2xl p-6 md:p-8 border border-white/5">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              Đánh giá & Bình luận
              <span className="text-sm font-normal text-gray-400">({comments.length})</span>
            </h3>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-10 bg-black/20 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-300 text-sm font-medium mr-2">Đánh giá:</span>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${(hoverRating || rating) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                      />
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim này..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="absolute bottom-3 right-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-white p-2.5 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-10 text-center bg-black/20 p-8 rounded-xl border border-white/5">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">Bạn cần đăng nhập để tham gia bình luận và đánh giá phim</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Đăng nhập để bình luận
                </button>
              </div>
            )}

            {/* Comment List */}
            <div className="space-y-4">
              {(comments || []).length > 0 ? (
                (comments || []).map((comment) => (
                  <div key={comment._id} className="bg-black/20 p-5 rounded-xl border border-white/5 flex gap-4">
                    <UserCircle className="w-10 h-10 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-medium truncate pr-4">
                          {comment.user.email.split('@')[0]}
                        </h4>
                        <span className="text-xs text-gray-500 shrink-0">
                          {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < comment.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`}
                          />
                        ))}
                        <span className="text-yellow-500 text-xs font-bold ml-1">{comment.rating}/10</span>
                      </div>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Chưa có bình luận nào. Hãy là người đầu tiên đánh giá phim này!
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
