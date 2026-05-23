import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, MonitorPlay } from 'lucide-react';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { VideoPlayer } from '../components/VideoPlayer';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export const WatchMovie = () => {
  const { movieSlug, episodeSlug } = useParams<{ movieSlug: string; episodeSlug: string }>();
  const navigate = useNavigate();
  const { movie, loading, error } = useMovieDetail(movieSlug);

  const [activeServer, setActiveServer] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieSlug, episodeSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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

  const currentServer = movie.episodes[activeServer];
  const selectedEpisode = currentServer?.episodes.find((ep) => ep.slug === episodeSlug) || currentServer?.episodes[0];

  const handlePlayEpisode = (epSlug: string) => {
    navigate(`/xem-phim/${movieSlug}/${epSlug}`);
  };

  return (
    <div className="min-h-screen bg-dark pb-20 pt-20">
      {/* Top Bar with Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mb-6">
        <button
          onClick={() => navigate(`/phim/${movieSlug}`)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Quay lại thông tin phim</span>
        </button>
      </div>

      {/* Video Player */}
      <div className="w-full bg-black">
        <div className="max-w-7xl mx-auto">
          {selectedEpisode ? (
            <VideoPlayer
              linkEmbed={selectedEpisode.linkEmbed}
              linkM3u8={selectedEpisode.linkM3u8}
              title={`${movie.title} - ${selectedEpisode.name}`}
              movie={movie}
              episodeName={selectedEpisode.name}
              onClose={() => navigate(`/phim/${movieSlug}`)}
            />
          ) : (
             <div className="w-full aspect-video flex items-center justify-center bg-gray-900 text-white">
                Tập phim này không tồn tại hoặc lỗi.
             </div>
          )}
        </div>
      </div>

      {/* Movie Info Short */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-6 mb-8">
         <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h1>
         <p className="text-gray-400 text-sm">Đang xem: <span className="text-primary font-semibold">{selectedEpisode?.name}</span></p>
      </div>

      {/* Episode List */}
      {movie.episodes.length > 0 && (
        <motion.div
          custom={1}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 md:px-12 mt-8"
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MonitorPlay className="w-5 h-5 text-primary" />
            Chọn tập phim
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
                    onClick={() => handlePlayEpisode(ep.slug)}
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
