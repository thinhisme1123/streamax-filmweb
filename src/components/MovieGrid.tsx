import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { AppMovie } from '../types/movie';
import { useBookmarks } from '../hooks/useBookmarks';

interface MovieGridCardProps {
  movie: AppMovie;
  index: number;
}

const MovieGridCard = ({ movie, index }: MovieGridCardProps) => {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(movie.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.6), ease: 'easeOut' }}
      className="group relative rounded-lg overflow-hidden bg-dark-light cursor-pointer"
      onClick={() => navigate(`/phim/${movie.slug || movie.id}`)}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl || movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallback) {
              target.dataset.fallback = '1';
              target.src = movie.thumbnailUrl || 'https://via.placeholder.com/300x450/141414/666?text=No+Image';
            }
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />

        {/* Quality badge */}
        {movie.quality && (
          <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {movie.quality}
          </div>
        )}

        {/* Hover action buttons */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/phim/${movie.slug || movie.id}`); }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black py-2 rounded font-semibold text-xs hover:bg-gray-200 transition"
          >
            <Play className="w-3 h-3 fill-black" /> Xem phim
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleBookmark(movie); }}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/30 flex items-center justify-center hover:bg-white/20 transition shrink-0"
          >
            {bookmarked ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-white text-sm font-semibold line-clamp-1 mb-1">{movie.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {movie.year > 0 && <span>{movie.year}</span>}
          {movie.episodeCurrent && <span className="text-green-400 truncate">{movie.episodeCurrent}</span>}
          {!movie.episodeCurrent && movie.duration && movie.duration !== 'N/A' && (
            <span className="truncate">{movie.duration}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton for movie grid
export const MovieGridSkeleton = ({ count = 20 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-lg overflow-hidden bg-dark-light animate-pulse">
        <div className="aspect-[2/3] bg-gray-700/50" />
        <div className="p-2.5 space-y-2">
          <div className="h-4 bg-gray-700/50 rounded" />
          <div className="h-3 w-2/3 bg-gray-700/50 rounded" />
        </div>
      </div>
    ))}
  </div>
);

interface MovieGridProps {
  movies: AppMovie[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const MovieGrid = ({ movies, isLoading, emptyMessage = 'Không có phim nào.' }: MovieGridProps) => {
  if (isLoading && movies.length === 0) return <MovieGridSkeleton />;

  if (!isLoading && movies.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-xl">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie, index) => (
        <MovieGridCard key={`${movie.id}-${index}`} movie={movie} index={index} />
      ))}
      {isLoading && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="rounded-lg overflow-hidden bg-dark-light animate-pulse">
              <div className="aspect-[2/3] bg-gray-700/50" />
              <div className="p-2.5 space-y-2">
                <div className="h-4 bg-gray-700/50 rounded" />
                <div className="h-3 w-2/3 bg-gray-700/50 rounded" />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
