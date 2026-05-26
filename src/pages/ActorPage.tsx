import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Star, Film, Globe, AlertCircle, Loader2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { searchMovies } from '../services/api';

// ─── TMDB Constants ──────────────────────────────────────────────────────────
const TMDB_API_KEY = '92734d838a135ec9fcf9f1f255bb08a4';
const TMDB_BASE    = 'https://api.themoviedb.org/3';
const TMDB_IMG     = 'https://image.tmdb.org/t/p/w500';
const TMDB_POSTER  = 'https://image.tmdb.org/t/p/w342';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TmdbActor {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  popularity: number;
  also_known_as: string[];
}

interface TmdbCredit {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  release_date: string;
  character: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const ActorSkeleton = () => (
  <div className="min-h-screen bg-dark animate-pulse">
    <div className="h-64 bg-dark-light" />
    <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-20 relative z-10">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-48 h-64 md:w-56 md:h-80 bg-gray-700/50 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-4 pt-4">
          <div className="h-10 w-2/3 bg-gray-700/50 rounded-lg" />
          <div className="h-5 w-1/4 bg-gray-700/50 rounded-lg" />
          <div className="space-y-2 mt-4">
            {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-700/50 rounded" style={{ width: `${90 - i * 5}%` }} />)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-gray-700/50 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

// ─── TMDB Movie Card ──────────────────────────────────────────────────────────
interface TmdbMovieCardProps {
  credit: TmdbCredit;
  isResolving: boolean;   // This specific card is being resolved
  isDisabled: boolean;    // Another card is resolving — block interaction
  onClickResolve: (credit: TmdbCredit) => void;
}

const TmdbMovieCard = ({ credit, isResolving, isDisabled, onClickResolve }: TmdbMovieCardProps) => {
  const [hovered, setHovered] = useState(false);

  const year = credit.release_date ? credit.release_date.slice(0, 4) : '—';
  const score = credit.vote_average ? Math.round(credit.vote_average * 10) : null;

  return (
    <motion.div
      className={`group relative rounded-xl overflow-hidden bg-dark-light border border-white/5 flex flex-col transition-opacity ${
        isDisabled && !isResolving ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
      }`}
      whileHover={isDisabled ? {} : { scale: 1.04, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !isDisabled && onClickResolve(credit)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {credit.poster_path ? (
          <img
            src={`${TMDB_POSTER}${credit.poster_path}`}
            alt={credit.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-light text-gray-600">
            <Film className="w-10 h-10" />
          </div>
        )}

        {/* Score badge */}
        {score !== null && (
          <div className={`absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded ${score >= 70 ? 'bg-green-500/90 text-white' : score >= 50 ? 'bg-yellow-500/90 text-black' : 'bg-red-500/90 text-white'}`}>
            {score}%
          </div>
        )}

        {/* ── Resolving Spinner Overlay ──────────────────────────────────── */}
        {isResolving && (
          <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-white text-xs font-medium">Đang tìm phim...</span>
          </div>
        )}

        {/* Hover overlay (hidden while resolving) */}
        {!isResolving && (
          <div className={`absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-white text-xs font-medium px-2 text-center leading-tight">Xem phim trên StreamAx</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <p className="text-white text-sm font-semibold line-clamp-2 leading-tight mb-1">{credit.title}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-gray-500 text-xs">{year}</span>
          {credit.character && (
            <span className="text-primary text-[10px] truncate max-w-[70%] text-right italic">
              {credit.character}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const ActorPage = () => {
  const { actorName } = useParams<{ actorName: string }>();
  const navigate = useNavigate();

  const [actor, setActor] = useState<TmdbActor | null>(null);
  const [credits, setCredits] = useState<TmdbCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'year'>('popularity');

  // ── Background Resolver ─────────────────────────────────────────────────────
  const [resolvingMovieId, setResolvingMovieId] = useState<number | null>(null);

  const handleMovieClick = useCallback(async (movie: TmdbCredit) => {
    if (resolvingMovieId !== null) return; // Already resolving another card
    setResolvingMovieId(movie.id);

    try {
      // ── Attempt 1: Search by Vietnamese/localized title ─────────────────
      const localResult = await searchMovies({ keyword: movie.title });
      if (localResult.movies.length > 0) {
        const slug = localResult.movies[0].slug || localResult.movies[0].id;
        navigate(`/phim/${slug}`);
        setResolvingMovieId(null);
        return;
      }

      // ── Attempt 2: Search by original/international title ───────────────
      if (movie.original_title && movie.original_title !== movie.title) {
        const origResult = await searchMovies({ keyword: movie.original_title });
        if (origResult.movies.length > 0) {
          const slug = origResult.movies[0].slug || origResult.movies[0].id;
          navigate(`/phim/${slug}`);
          setResolvingMovieId(null);
          return;
        }
      }

      // ── Both attempts failed ───────────────────────────────────────────
      toast.error('Phim này hiện chưa có trên hệ thống StreamAx.', {
        icon: '😔',
        duration: 4000,
      });
    } catch {
      toast.error('Lỗi kết nối khi tìm kiếm phim.', {
        icon: '⚠️',
        duration: 3000,
      });
    } finally {
      setResolvingMovieId(null);
    }
  }, [resolvingMovieId, navigate]);

  useEffect(() => {
    if (!actorName) return;
    window.scrollTo(0, 0);

    const fetchActor = async () => {
      setLoading(true);
      setError(null);

      try {
        const decodedName = decodeURIComponent(actorName);

        // ── Step 1: Search for person by name ──────────────────────────────
        const searchRes = await fetch(
          `${TMDB_BASE}/search/person?query=${encodeURIComponent(decodedName)}&api_key=${TMDB_API_KEY}&language=vi`
        );
        if (!searchRes.ok) throw new Error('Không thể kết nối TMDB API');

        const searchData = await searchRes.json();
        if (!searchData.results?.length) {
          throw new Error(`Không tìm thấy diễn viên "${decodedName}" trên TMDB`);
        }

        const personId = searchData.results[0].id;

        // ── Step 2: Fetch person details + credits in parallel ─────────────
        const [detailRes, creditsRes] = await Promise.all([
          fetch(`${TMDB_BASE}/person/${personId}?api_key=${TMDB_API_KEY}&language=vi`),
          fetch(`${TMDB_BASE}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=vi`),
        ]);

        if (!detailRes.ok || !creditsRes.ok) throw new Error('Không thể tải thông tin diễn viên');

        const detailData: TmdbActor = await detailRes.json();
        const creditsData = await creditsRes.json();

        setActor(detailData);

        // Filter out movies without posters or with very low vote counts for quality
        const filteredCredits: TmdbCredit[] = (creditsData.cast || [])
          .filter((c: TmdbCredit) => c.poster_path && c.title)
          .sort((a: TmdbCredit, b: TmdbCredit) => b.popularity - a.popularity);

        setCredits(filteredCredits);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchActor();
  }, [actorName]);

  // Sort credits
  const sortedCredits = [...credits].sort((a, b) => {
    if (sortBy === 'year') {
      return (b.release_date || '').localeCompare(a.release_date || '');
    }
    return b.popularity - a.popularity;
  });

  // Biography truncation
  const BIO_LIMIT = 400;
  const bioNeedsTruncation = (actor?.biography?.length ?? 0) > BIO_LIMIT;
  const displayBio = actor?.biography
    ? showFullBio || !bioNeedsTruncation
      ? actor.biography
      : actor.biography.slice(0, BIO_LIMIT) + '…'
    : null;

  if (loading) return <ActorSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-6 px-4 text-center pt-16">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Không tìm thấy diễn viên</h2>
        <p className="text-gray-400 max-w-md">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover px-6 py-3 rounded-lg text-white font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    );
  }

  if (!actor) return null;

  const knownName = actor.also_known_as?.[0];

  return (
    <div className="min-h-screen bg-dark">

      {/* ─── Hero Background Blur ────────────────────────────────────────────── */}
      <div className="relative h-72 md:h-80 overflow-hidden">
        {actor.profile_path ? (
          <>
            {/* Blurred full-width background */}
            <img
              src={`${TMDB_IMG}${actor.profile_path}`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top scale-110 blur-2xl opacity-30"
              aria-hidden
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-dark/60 to-dark" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-dark" />
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 md:left-12 z-20 flex items-center gap-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Quay lại</span>
        </button>
      </div>

      {/* ─── Actor Profile ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-40 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

          {/* Avatar */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="shrink-0"
          >
            <div className="w-44 h-60 md:w-56 md:h-80 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/60 bg-dark-light">
              {actor.profile_path ? (
                <img
                  src={`${TMDB_IMG}${actor.profile_path}`}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 bg-dark-light">
                  <Film className="w-16 h-16" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2 md:pt-8">
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-1 leading-tight">
                {actor.name}
              </h1>
              {knownName && knownName !== actor.name && (
                <p className="text-gray-400 text-base mb-3 italic">{knownName}</p>
              )}
            </motion.div>

            {/* Meta chips */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap items-center gap-2 mb-5">
              {actor.known_for_department && (
                <span className="flex items-center gap-1.5 bg-primary/15 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold">
                  <Star className="w-3 h-3" /> {actor.known_for_department}
                </span>
              )}
              {actor.birthday && (
                <span className="flex items-center gap-1.5 bg-white/5 text-gray-300 border border-white/10 px-3 py-1 rounded-full text-xs font-medium">
                  <Calendar className="w-3 h-3" />
                  {new Date(actor.birthday).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              )}
              {actor.place_of_birth && (
                <span className="flex items-center gap-1.5 bg-white/5 text-gray-300 border border-white/10 px-3 py-1 rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" /> {actor.place_of_birth}
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-white/5 text-gray-300 border border-white/10 px-3 py-1 rounded-full text-xs font-medium">
                <Film className="w-3 h-3" /> {credits.length} phim
              </span>
            </motion.div>

            {/* Biography */}
            {displayBio ? (
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tiểu sử</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {displayBio}
                </p>
                {bioNeedsTruncation && (
                  <button
                    onClick={() => setShowFullBio(v => !v)}
                    className="mt-2 text-primary text-sm hover:underline font-medium focus:outline-none"
                  >
                    {showFullBio ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <p className="text-gray-500 italic text-sm">Chưa có tiểu sử cho diễn viên này.</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* ─── Filmography ────────────────────────────────────────────────────── */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-16 pb-16"
        >
          {/* Section header + sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <Film className="w-5 h-5 text-primary" />
              Phim đã tham gia
              <span className="text-sm font-normal text-gray-400">({sortedCredits.length})</span>
            </h2>

            {/* Sort toggle */}
            <div className="flex items-center gap-1 bg-dark-light border border-white/10 rounded-lg p-1">
              {(['popularity', 'year'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    sortBy === opt
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {opt === 'popularity' ? 'Phổ biến' : 'Mới nhất'}
                </button>
              ))}
            </div>
          </div>

          {/* TMDB → KKPhim bridge notice */}
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-6">
            <Film className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-blue-300 text-xs leading-relaxed">
              Nhấn vào phim bất kỳ — hệ thống sẽ tự động tìm và chuyển bạn đến trang xem phim trên StreamAx.
            </p>
          </div>

          {sortedCredits.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedCredits.map((credit, idx) => (
                <motion.div
                  key={`${credit.id}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.4, ease: 'easeOut' }}
                >
                  <TmdbMovieCard
                    credit={credit}
                    isResolving={resolvingMovieId === credit.id}
                    isDisabled={resolvingMovieId !== null}
                    onClickResolve={handleMovieClick}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Film className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500">Chưa có dữ liệu phim cho diễn viên này.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
