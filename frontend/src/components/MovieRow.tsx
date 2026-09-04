import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MovieCard } from './MovieCard';
import { AppMovie } from '../types/movie';

interface MovieRowProps {
  title: string;
  movies: AppMovie[];
  viewAllLink?: string;
  isLoading?: boolean;
}

// Skeleton for the entire row
const MovieRowSkeleton = () => (
  <div className="py-6 px-4 md:px-12">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 bg-gray-700/50 rounded-full animate-pulse" />
        <div className="h-7 w-48 bg-gray-700/50 rounded animate-pulse" />
      </div>
      <div className="h-5 w-24 bg-gray-700/50 rounded animate-pulse" />
    </div>
    <div className="flex gap-3 overflow-hidden px-4 md:px-12">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="w-64 h-36 md:w-72 md:h-40 shrink-0 bg-gray-700/30 rounded-md animate-pulse" />
      ))}
    </div>
  </div>
);

export const MovieRow = ({ title, movies, viewAllLink, isLoading }: MovieRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      const newPos = direction === 'left'
        ? rowRef.current.scrollLeft - scrollAmount
        : rowRef.current.scrollLeft + scrollAmount;
      rowRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
    }
  };

  if (isLoading) return <MovieRowSkeleton />;
  if (!movies.length) return null;

  return (
    <div className="py-4 md:py-6 relative group/row">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 md:px-12 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-primary rounded-full" />
          <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wide">
            {title}
          </h2>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors font-medium group/link"
          >
            Xem tất cả
            <ChevronRightIcon className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Scrollable Row */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-0 bottom-4 w-10 md:w-14 z-20 bg-gradient-to-r from-dark/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft className="w-7 h-7 text-white hover:scale-125 transition-transform" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pt-8 pb-12 -mt-8 -mb-8 px-4 md:px-12"
        >
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-4 w-10 md:w-14 z-20 bg-gradient-to-l from-dark/90 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight className="w-7 h-7 text-white hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
};
