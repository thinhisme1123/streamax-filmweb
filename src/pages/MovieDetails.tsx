import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, ArrowLeft, Star, Clock, Globe, Film, Users, Clapperboard, MonitorPlay, ChevronDown, ChevronUp } from 'lucide-react';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { useBookmarks } from '../hooks/useBookmarks';
import { VideoPlayer } from '../components/VideoPlayer';
import { AppEpisode } from '../types/movie';
import { FavoriteButton } from '../components/FavoriteButton';

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
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const { movie, loading, error } = useMovieDetail(slug);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [selectedEpisode, setSelectedEpisode] = useState<AppEpisode | null>(null);
  const [activeServer, setActiveServer] = useState(0);
  const [showAllCast, setShowAllCast] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Auto-play episode if passed from Continue Watching
  useEffect(() => {
    if (movie && location.state?.autoPlayEpisode) {
      for (const server of movie.episodes) {
        const episode = server.episodes.find(ep => ep.name === location.state.autoPlayEpisode);
        if (episode) {
          setActiveServer(movie.episodes.indexOf(server));
          setSelectedEpisode(episode);
          // Clean up state so a refresh doesn't trigger it again
          window.history.replaceState({}, document.title);
          
          setTimeout(() => {
            document.getElementById('video-player-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 500);
          break;
        }
      }
    }
  }, [movie, location.state]);

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
  const displayCast = showAllCast ? movie.cast : movie.cast.slice(0, 6);
  const currentServer = movie.episodes[activeServer];

  const handlePlayEpisode = (episode: AppEpisode) => {
    setSelectedEpisode(episode);
    // Scroll to player smoothly
    setTimeout(() => {
      document.getElementById('video-player-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePlayFirst = () => {
    if (movie.episodes.length > 0 && movie.episodes[0].episodes.length > 0) {
      handlePlayEpisode(movie.episodes[0].episodes[0]);
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
              {movie.director.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Clapperboard className="w-3.5 h-3.5" /> Đạo diễn
                  </h4>
                  <p className="text-gray-200">{movie.director.join(', ')}</p>
                </div>
              )}

              {/* Country */}
              {movie.countries.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Quốc gia
                  </h4>
                  <p className="text-gray-200">{movie.countries.map(c => c.name).join(', ')}</p>
                </div>
              )}
            </motion.div>

            {/* Cast */}
            {movie.cast.length > 0 && (
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
                  {displayCast.map((actor, idx) => (
                    <span
                      key={idx}
                      className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm text-gray-300"
                    >
                      {actor}
                    </span>
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

      {/* ===== VIDEO PLAYER ===== */}
      <AnimatePresence>
        {selectedEpisode && (
          <div id="video-player-section" className="max-w-7xl mx-auto px-4 md:px-12 mt-12">
            <VideoPlayer
              linkEmbed={selectedEpisode.linkEmbed}
              linkM3u8={selectedEpisode.linkM3u8}
              title={`${movie.title} - ${selectedEpisode.name}`}
              movie={movie}
              episodeName={selectedEpisode.name}
              onClose={() => setSelectedEpisode(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ===== EPISODES ===== */}
      {movie.episodes.length > 0 && (
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
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {movie.episodes.map((server, idx) => (
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

          {/* Episode grid */}
          {currentServer && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
              {currentServer.episodes.map((ep) => {
                const isActive = selectedEpisode?.slug === ep.slug;
                return (
                  <button
                    key={ep.slug}
                    onClick={() => handlePlayEpisode(ep)}
                    className={`relative px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group overflow-hidden ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-[1.02]'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-primary/20 hover:border-primary/50 hover:text-white'
                    }`}
                  >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    <div className="relative flex items-center justify-center gap-1.5">
                      {isActive && <Play className="w-3 h-3 fill-white" />}
                      <span className="truncate">{ep.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
