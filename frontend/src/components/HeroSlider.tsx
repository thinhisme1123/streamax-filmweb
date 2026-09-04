import { useState, useEffect, useCallback } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppMovie } from '../types/movie';

interface HeroSliderProps {
  movies: AppMovie[];
}

export const HeroSlider = ({ movies }: HeroSliderProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const goTo = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext]);

  if (!movies.length) return null;

  const current = movies[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-30%' : '30%',
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden bg-dark select-none">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <img
            src={current.posterUrl || current.thumbnailUrl}
            alt={current.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays (always on top of images) */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/30 to-transparent z-10 pointer-events-none" />
      {/* Top vignette for header blend */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-dark/60 to-transparent z-10 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="max-w-2xl"
            >
              {/* Quality & Year badges */}
              <div className="flex items-center gap-3 mb-4">
                {current.quality && (
                  <span className="bg-primary/90 text-white text-xs font-bold px-2.5 py-1 rounded">
                    {current.quality}
                  </span>
                )}
                <span className="bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded border border-white/20">
                  {current.year}
                </span>
                {current.episodeCurrent && (
                  <span className="bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded border border-white/20">
                    {current.episodeCurrent}
                  </span>
                )}
                <span className="text-primary text-xs font-semibold border border-primary/40 px-2.5 py-1 rounded">
                  {current.genre}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
                {current.title}
              </h1>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-300 mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl drop-shadow">
                {current.description}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/phim/${current.slug || current.id}`)}
                  className="flex items-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-7 py-3 rounded-lg font-bold transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.03] active:scale-[0.97]"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Xem Ngay
                </button>
                <button
                  onClick={() => navigate(`/phim/${current.slug || current.id}`)}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-7 py-3 rounded-lg font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
                >
                  <Info className="w-5 h-5" />
                  Chi Tiết
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Left/Right Arrow Buttons */}
      <button
        onClick={goPrev}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 h-2.5 bg-primary shadow-lg shadow-primary/40'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-24 right-4 md:right-12 z-30 text-white/50 text-xs font-medium tracking-wider">
        <span className="text-white font-bold text-sm">{String(currentIndex + 1).padStart(2, '0')}</span>
        <span className="mx-1">/</span>
        <span>{String(movies.length).padStart(2, '0')}</span>
      </div>
    </div>
  );
};
