import { useEffect } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { MovieCarousel } from '../components/MovieCarousel';
import { useMovies } from '../hooks/useMovies';
import { HeroBannerSkeleton } from '../components/Skeletons';

export const Home = () => {
  // Ensure we start at the top when navigating
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { heroMovies, newMovies, tvSeries, animations, loading, error } = useMovies();

  // Find a hero movie with a poster if possible, otherwise use the first one
  const featuredMovie = heroMovies.find(m => m.posterUrl) || heroMovies[0];

  if (error) {
    return (
      <div className="pt-32 pb-20 text-center min-h-[80vh] flex items-center justify-center">
        <div className="bg-red-900/50 p-6 rounded-lg text-white max-w-md">
          <h2 className="text-xl font-bold mb-2">Error Loading Movies</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {loading ? <HeroBannerSkeleton /> : featuredMovie && <HeroBanner movie={featuredMovie} />}
      
      <div className="-mt-24 md:-mt-32 relative z-20 space-y-8">
        <MovieCarousel title="Phim Mới Cập Nhật" movies={newMovies} isLoading={loading} />
        <MovieCarousel title="Phim Bộ Mới" movies={tvSeries} isLoading={loading} />
        <MovieCarousel title="Hoạt Hình" movies={animations} isLoading={loading} />
      </div>
    </div>
  );
};
