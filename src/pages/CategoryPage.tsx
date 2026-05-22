import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Globe, ChevronRight } from 'lucide-react';
import { MovieGrid, MovieGridSkeleton } from '../components/MovieGrid';
import { getCategoryMovies, getCountryMovies, getCategories, getCountries } from '../services/api';
import { AppMovie, AppCategory, PaginationInfo } from '../types/movie';

const DEFAULT_PAGINATION: PaginationInfo = {
  currentPage: 0,
  totalPages: 0,
  totalItems: 0,
  hasMore: false,
};

export const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const isCountry = location.pathname.startsWith('/country/');

  const [movies, setMovies] = useState<AppMovie[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [taxonomy, setTaxonomy] = useState<AppCategory[]>([]);
  const [currentName, setCurrentName] = useState('');

  const loaderRef = useRef<HTMLDivElement>(null);

  // Load taxonomy sidebar
  useEffect(() => {
    const loader = isCountry ? getCountries() : getCategories();
    loader.then(data => {
      setTaxonomy(data);
      const current = data.find(c => c.slug === slug);
      if (current) setCurrentName(current.name);
    }).catch(() => {});
  }, [isCountry]);

  // Update name when slug changes
  useEffect(() => {
    const current = taxonomy.find(c => c.slug === slug);
    if (current) setCurrentName(current.name);
  }, [slug, taxonomy]);

  const fetchMovies = useCallback(async (currentSlug: string, page: number, reset: boolean) => {
    if (!currentSlug) return;
    try {
      if (reset) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const fetcher = isCountry ? getCountryMovies : getCategoryMovies;
      const result = await fetcher(currentSlug, page);

      setMovies(prev => reset ? result.movies : [...prev, ...result.movies]);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách phim.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [isCountry]);

  // Reset and fetch when slug changes
  useEffect(() => {
    if (!slug) return;
    window.scrollTo(0, 0);
    setMovies([]);
    setPagination(DEFAULT_PAGINATION);
    fetchMovies(slug, 1, true);
  }, [slug, fetchMovies]);

  // Infinite scroll
  useEffect(() => {
    if (!pagination.hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !isLoadingMore) {
          fetchMovies(slug!, pagination.currentPage + 1, false);
        }
      },
      { threshold: 0.1 }
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [pagination, isLoadingMore, isLoading, slug, fetchMovies]);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Hero bar */}
      <div className="relative h-36 md:h-48 overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-dark to-dark" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark" />
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-12 flex items-end pb-6">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Link to="/" className="hover:text-white transition">Trang chủ</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/search" className="hover:text-white transition">
                {isCountry ? 'Quốc gia' : 'Thể loại'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">{currentName || slug}</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-4xl font-bold text-white flex items-center gap-3"
            >
              {isCountry ? (
                <Globe className="w-7 h-7 text-primary" />
              ) : (
                <Tag className="w-7 h-7 text-primary" />
              )}
              {currentName || slug}
              {!isLoading && pagination.totalItems > 0 && (
                <span className="text-lg font-normal text-gray-400">
                  ({pagination.totalItems.toLocaleString()} phim)
                </span>
              )}
            </motion.h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                {isCountry ? <Globe className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
                {isCountry ? 'Quốc Gia' : 'Thể Loại'}
              </h3>
              <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide pr-2">
                {taxonomy.map((item) => (
                  <Link
                    key={item._id}
                    to={isCountry ? `/country/${item.slug}` : `/category/${item.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      item.slug === slug
                        ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/30'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile horizontal filter */}
            <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {taxonomy.map((item) => (
                <Link
                  key={item._id}
                  to={isCountry ? `/country/${item.slug}` : `/category/${item.slug}`}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all ${
                    item.slug === slug
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {error ? (
              <div className="text-center py-20">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button
                  onClick={() => fetchMovies(slug!, 1, true)}
                  className="px-6 py-3 bg-primary/80 hover:bg-primary rounded-lg text-white transition"
                >
                  Thử lại
                </button>
              </div>
            ) : isLoading ? (
              <MovieGridSkeleton count={20} />
            ) : (
              <>
                <MovieGrid movies={movies} emptyMessage="Không có phim nào trong danh mục này." />

                {/* Infinite scroll trigger */}
                {pagination.hasMore && (
                  <div ref={loaderRef} className="mt-8">
                    {isLoadingMore && <MovieGridSkeleton count={6} />}
                  </div>
                )}

                {!pagination.hasMore && movies.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-500 text-sm mt-10"
                  >
                    Đã hiển thị tất cả {movies.length} phim
                  </motion.p>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
