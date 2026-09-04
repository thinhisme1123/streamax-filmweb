import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppMovie } from '../types/movie';

interface HeroBannerProps {
  movie: AppMovie;
}

export const HeroBanner = ({ movie }: HeroBannerProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[80vh] w-full">
      <div className="absolute inset-0">
        <img
          src={movie.posterUrl || movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
      </div>

      <div className="relative h-full max-w-6xl mx-auto px-4 md:px-12 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {movie.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm md:text-base font-semibold text-gray-300 mb-6 drop-shadow">
            <span className="text-green-400">{movie.matchScore}% Match</span>
            <span>{movie.year}</span>
            <span className="border border-gray-400 px-1 py-0.5 text-xs">{movie.maturityRating}</span>
            <span>{movie.duration}</span>
            <span className="text-primary border border-primary px-2 rounded-full text-xs">{movie.genre}</span>
          </div>
          
          <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3 drop-shadow-md">
            {movie.description}
          </p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/phim/${movie.slug || movie.id}`)}
              className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-3 rounded font-bold hover:bg-gray-200 transition"
            >
              <Play className="w-6 h-6 fill-black" />
              Play
            </button>
            <button 
              onClick={() => navigate(`/phim/${movie.slug || movie.id}`)}
              className="flex items-center gap-2 bg-gray-500/50 text-white px-6 md:px-8 py-3 rounded font-bold hover:bg-gray-500/70 transition"
            >
              <Info className="w-6 h-6" />
              More Info
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
