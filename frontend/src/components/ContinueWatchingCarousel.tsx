import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WatchHistoryItem } from '../store/userStore';

interface ContinueWatchingCarouselProps {
  history: WatchHistoryItem[];
}

export const ContinueWatchingCarousel = ({ history }: ContinueWatchingCarouselProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!history || history.length === 0) return null;

  return (
    <div className="relative z-20 space-y-2 group/carousel px-4 md:px-12 mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white transition">
        Tiếp tục xem
      </h2>
      
      <div className="relative">
        <ChevronLeft 
          className="absolute top-0 bottom-0 left-0 z-40 m-auto h-full w-10 md:w-14 cursor-pointer opacity-0 transition group-hover/carousel:opacity-100 hover:scale-125 bg-gradient-to-r from-black/80 to-transparent text-white" 
          onClick={() => handleScroll('left')}
        />
        
        <div 
          ref={rowRef}
          className="flex items-center gap-4 overflow-x-scroll scrollbar-hide py-4 px-1"
        >
          {history.map((item) => {
            const percentage = item.totalDuration ? Math.min((item.currentTime / item.totalDuration) * 100, 100) : item.progressPercentage;
            
            return (
              <motion.div 
                key={item.movieSlug + (item.episodeSlug || '')}
                className="relative w-64 h-36 md:w-72 md:h-40 rounded-md overflow-hidden shrink-0 cursor-pointer group"
                whileHover={{ scale: 1.05, zIndex: 10 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  if (item.episodeSlug) {
                    navigate(`/xem-phim/${item.movieSlug}/${item.episodeSlug}`);
                  } else {
                    navigate(`/phim/${item.movieSlug}`, { state: { autoPlayEpisode: item.currentEpisode } });
                  }
                }}
              >
                <img 
                  src={item.poster_url} 
                  alt={item.movieTitle} 
                  className="w-full h-full object-cover rounded-md"
                />
                
                {/* Overlay with Play Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <Play className="w-12 h-12 text-white opacity-80" />
                </div>
  
                {/* Progress Bar & Episode Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pt-6 pb-2">
                   <h4 className="font-bold text-white text-sm line-clamp-1">{item.movieTitle}</h4>
                   <p className="text-xs text-gray-300 mb-2">{item.currentEpisode}</p>
                   
                   <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                      <div 
                         className="h-full bg-primary" 
                         style={{ width: `${percentage}%` }}
                      />
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <ChevronRight 
          className="absolute top-0 bottom-0 right-0 z-40 m-auto h-full w-10 md:w-14 cursor-pointer opacity-0 transition group-hover/carousel:opacity-100 hover:scale-125 bg-gradient-to-l from-black/80 to-transparent text-white" 
          onClick={() => handleScroll('right')}
        />
      </div>
    </div>
  );
};
