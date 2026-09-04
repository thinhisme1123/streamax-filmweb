import { useEffect } from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { MovieRow } from '../components/MovieRow';
import { ContinueWatchingCarousel } from '../components/ContinueWatchingCarousel';
import { useMovies } from '../hooks/useMovies';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';

export const Home = () => {
  // Ensure we start at the top when navigating
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { heroMovies, newMovies, tvSeries, animations, vietsubMovies, thuyetMinhMovies, longTiengMovies, loading, error } = useMovies();
  const { history } = useUserStore();
  const { isAuthenticated } = useAuthStore();

  // Pick the top 5 movies for the Hero Slider
  const heroSliderMovies = heroMovies.slice(0, 5);

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
    <div className="bg-dark min-h-screen pb-20">
      {/* ===== HERO SLIDER ===== */}
      {loading ? (
        <HeroSliderSkeleton />
      ) : (
        heroSliderMovies.length > 0 && <HeroSlider movies={heroSliderMovies} />
      )}

      {/* ===== CONTENT ROWS ===== */}
      <div className="-mt-20 md:-mt-28 relative z-20 space-y-2">
        {/* Continue Watching (authenticated only) */}
        {isAuthenticated && history.length > 0 && (
          <ContinueWatchingCarousel history={history} />
        )}

        {/* Latest Updated Movies */}
        <MovieRow
          title="Phim Mới Cập Nhật"
          movies={newMovies}
          viewAllLink="/danh-sach/phim-le"
          isLoading={loading}
        />

        {/* TV Series */}
        <MovieRow
          title="Phim Bộ Mới"
          movies={tvSeries}
          viewAllLink="/danh-sach/phim-bo"
          isLoading={loading}
        />

        {/* Anime / Animation */}
        <MovieRow
          title="Hoạt Hình - Anime"
          movies={animations}
          viewAllLink="/danh-sach/hoat-hinh"
          isLoading={loading}
        />

        {/* Phim Vietsub */}
        <MovieRow
          title="PHIM VIETSUB MỚI"
          movies={vietsubMovies}
          viewAllLink="/danh-sach/phim-vietsub"
          isLoading={loading}
        />

        {/* Phim Thuyet Minh */}
        <MovieRow
          title="PHIM THUYẾT MINH"
          movies={thuyetMinhMovies}
          viewAllLink="/danh-sach/phim-thuyet-minh"
          isLoading={loading}
        />

        {/* Phim Long Tieng */}
        <MovieRow
          title="PHIM LỒNG TIẾNG"
          movies={longTiengMovies}
          viewAllLink="/danh-sach/phim-long-tieng"
          isLoading={loading}
        />
      </div>
    </div>
  );
};

// Skeleton for the hero slider area during loading
const HeroSliderSkeleton = () => (
  <div className="relative w-full h-[75vh] md:h-[85vh] bg-dark overflow-hidden">
    <div className="absolute inset-0 bg-dark-light animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-transparent to-transparent" />

    <div className="absolute bottom-24 md:bottom-32 left-0 z-20 max-w-7xl mx-auto px-4 md:px-12 w-full">
      <div className="max-w-2xl space-y-5">
        <div className="flex gap-3">
          <div className="h-6 w-14 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-6 w-12 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse" />
        </div>
        <div className="h-12 md:h-16 w-3/4 bg-gray-700/50 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-700/50 rounded animate-pulse" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-12 w-36 bg-gray-700/50 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-gray-700/50 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>

    {/* Dot skeleton */}
    <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="w-2.5 h-2.5 bg-gray-700/50 rounded-full animate-pulse" />
      ))}
    </div>
  </div>
);
