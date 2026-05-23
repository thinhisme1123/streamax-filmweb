import { Play, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppMovie } from '../types/movie';
import { FavoriteButton } from './FavoriteButton';
import { twMerge } from 'tailwind-merge';

interface MovieCardProps {
  movie: AppMovie;
  className?: string;
}

export const MovieCard = ({ movie, className }: MovieCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className={twMerge("relative w-64 h-36 md:w-72 md:h-40 rounded-md overflow-hidden shrink-0 cursor-pointer group", className)}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.3 }}
    >
      <img 
        src={movie.thumbnailUrl || movie.posterUrl} 
        alt={movie.title} 
        className="w-full h-full object-cover rounded-md"
      />
      
      {/* Top Right Action - Favorite */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <FavoriteButton 
          movie={movie} 
          className="p-1.5 bg-black/50 rounded-full hover:bg-black/80 backdrop-blur-sm" 
          iconClassName="w-5 h-5" 
        />
      </div>
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-dark/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end shadow-2xl z-10">
        <h4 className="font-bold text-white mb-2 line-clamp-1">{movie.title}</h4>
        
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={() => navigate(`/phim/${movie.slug || movie.id}`)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-300 transition"
          >
            <Play className="w-4 h-4 fill-black text-black ml-1" />
          </button>
          
          <div className="flex-grow"></div>
          <button 
            onClick={() => navigate(`/phim/${movie.slug || movie.id}`)}
            className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition"
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-1">
          <span className="text-green-400">{movie.matchScore}% Match</span>
          <span className="border border-gray-400 px-1">{movie.maturityRating}</span>
          <span>{movie.duration}</span>
        </div>
        <div className="text-xs text-gray-400">
          {movie.genre}
        </div>
      </div>
    </motion.div>
  );
};
