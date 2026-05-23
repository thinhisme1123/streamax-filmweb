import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag, Globe, Calendar, ListVideo } from 'lucide-react';
import { MovieGrid, MovieGridSkeleton } from '../components/MovieGrid';
import { getCategoryMovies, getCountryMovies, getListMoviesPaginated, getYearMovies } from '../services/api';
import { AppMovie, PaginationInfo } from '../types/movie';

const DEFAULT_PAGINATION: PaginationInfo = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasMore: false,
};

export const MovieListPage = () => {
  const { type, slug, year } = useParams<{ type?: string; slug?: string; year?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse page from query string (e.g. ?page=2)
  const searchParams = new URLSearchParams(location.search);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [movies, setMovies] = useState<AppMovie[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the route type
  const isList = location.pathname.startsWith('/danh-sach/');
  const isCountry = location.pathname.startsWith('/quoc-gia/');
  const isCategory = location.pathname.startsWith('/the-loai/');
  const isYear = location.pathname.startsWith('/nam/');

  // Identify parameter
  const currentParam = type || slug || year || '';

  const getTitle = () => {
    if (isList) {
      if (type === 'phim-le') return 'Phim Lẻ';
      if (type === 'phim-bo') return 'Phim Bộ';
      if (type === 'hoat-hinh') return 'Hoạt Hình';
      if (type === 'tv-shows') return 'TV Shows';
      return 'Danh sách phim';
    }
    if (isCountry) return 'Quốc Gia';
    if (isCategory) return 'Thể Loại';
    if (isYear) return `Phim Năm ${year}`;
    return 'Danh sách phim';
  };

  const getIcon = () => {
    if (isList) return <ListVideo className="w-7 h-7 text-primary" />;
    if (isCountry) return <Globe className="w-7 h-7 text-primary" />;
    if (isCategory) return <Tag className="w-7 h-7 text-primary" />;
    if (isYear) return <Calendar className="w-7 h-7 text-primary" />;
    return <ListVideo className="w-7 h-7 text-primary" />;
  };

  const fetchMovies = async (param: string, page: number) => {
    if (!param) return;
    try {
      setIsLoading(true);
      setError(null);
      let result;

      if (isList) result = await getListMoviesPaginated(param, page);
      else if (isCountry) result = await getCountryMovies(param, page);
      else if (isCategory) result = await getCategoryMovies(param, page);
      else if (isYear) result = await getYearMovies(param, page);

      if (result) {
        setMovies(result.movies);
        setPagination(result.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách phim.');
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchMovies(currentParam, pageParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParam, pageParam, location.pathname]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      navigate(`${location.pathname}?page=${newPage}`);
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const maxPagesToShow = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > pagination.totalPages) {
      endPage = pagination.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition ${
            i === pagination.currentPage
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12 mb-8">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {startPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)} className="w-10 h-10 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 transition">1</button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {pages}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="text-gray-500">...</span>}
            <button onClick={() => handlePageChange(pagination.totalPages)} className="w-10 h-10 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 transition">{pagination.totalPages}</button>
          </>
        )}

        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Hero bar */}
      <div className="relative h-36 md:h-48 overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-dark to-dark" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark" />
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-12 flex items-end pb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-4xl font-bold text-white flex items-center gap-3 capitalize"
            >
              {getIcon()}
              {getTitle()}
              {!isList && !isYear && currentParam && (
                <span className="text-gray-300 capitalize"> - {currentParam.replace(/-/g, ' ')}</span>
              )}
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
        {error ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => fetchMovies(currentParam, pageParam)}
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
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};
