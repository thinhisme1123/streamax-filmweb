import { useState, useRef, useEffect } from 'react';
import { Play, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppMovie } from '../types/movie';
import { FavoriteButton } from './FavoriteButton';
import { getMovieDetail } from '../services/api';
import { twMerge } from 'tailwind-merge';

function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

interface MovieCardProps {
  movie: AppMovie;
  className?: string;
}

export const MovieCard = ({ movie, className }: MovieCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadTrailer, setShouldLoadTrailer] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(movie.videoUrl || null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);

    // Critical Hover Delay (Debounce)
    // Only execute API fetch and render video after 700ms of continuous hover
    hoverTimerRef.current = setTimeout(async () => {
      setShouldLoadTrailer(true);

      // Fetch trailer dynamically if not cached
      if (!trailerUrl) {
        try {
          const detail = await getMovieDetail(movie.slug);
          if (detail.trailerUrl) {
            setTrailerUrl(detail.trailerUrl);
          }
        } catch (err) {
          // Ignore fetch errors during hover
        }
      }
    }, 700);
  };

  const handleMouseLeave = () => {
    // Important Cleanup on Leave
    setIsHovered(false);
    setShouldLoadTrailer(false);
    setIsReady(false);
    
    // Immediately clear the timeout to prevent loading if user already moved away
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const youtubeId = getYouTubeId(trailerUrl);
  // Construct embed URL if youtubeId is valid
  const embedUrl = youtubeId 
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&loop=1&playlist=${youtubeId}` 
    : null;

  return (
    <motion.div
      className={twMerge("relative w-64 h-36 md:w-72 md:h-40 rounded-md overflow-hidden shrink-0 cursor-pointer group bg-dark-light", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: shouldLoadTrailer ? 1.1 : 1,
        zIndex: shouldLoadTrailer ? 50 : 1,
        y: shouldLoadTrailer ? -10 : 0
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Poster Image (Base Layer) - Remains visible until video is ready */}
      <img
        src={movie.thumbnailUrl || movie.posterUrl}
        alt={movie.title}
        className="w-full h-full object-cover rounded-md absolute inset-0 z-0"
      />

      {/* Video Player (Overlay Layer) - Only rendered when shouldLoadTrailer is true and valid URL exists */}
      {shouldLoadTrailer && embedUrl && (
        <div 
          className="absolute inset-0 z-0 bg-black transition-opacity duration-700 pointer-events-none"
          style={{ opacity: isReady ? 1 : 0 }}
        >
          <iframe
            src={embedUrl}
            allow="autoplay; encrypted-media"
            className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            onLoad={() => setIsReady(true)}
            frameBorder="0"
          />
        </div>
      )}

      {/* Top Right Action - Favorite */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <FavoriteButton
          movie={movie}
          className="p-1.5 bg-black/50 rounded-full hover:bg-black/80 backdrop-blur-sm"
          iconClassName="w-5 h-5"
        />
      </div>

      {/* Hover Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end z-10 pointer-events-auto transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <h4 className="font-bold text-white mb-2 line-clamp-1 drop-shadow-md">{movie.title}</h4>

        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/phim/${movie.slug || movie.id}`); }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-300 transition shadow-lg"
          >
            <Play className="w-4 h-4 fill-black text-black ml-1" />
          </button>

          <div className="flex-grow"></div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/phim/${movie.slug || movie.id}`); }}
            className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-white hover:bg-white/20 transition shadow-lg bg-black/30 backdrop-blur-sm"
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-200 mb-1 drop-shadow-md">
          <span className="text-green-400">{movie.matchScore}% Match</span>
          <span className="border border-gray-400 px-1 bg-black/30">{movie.maturityRating}</span>
          <span>{movie.duration}</span>
        </div>
        <div className="text-xs text-gray-300 drop-shadow-md line-clamp-1">
          {movie.genre}
        </div>
      </div>
    </motion.div>
  );
};
