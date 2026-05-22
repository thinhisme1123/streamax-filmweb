import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { MovieGrid, MovieGridSkeleton } from '../components/MovieGrid';
import { Pagination } from '../components/Pagination';
import { searchMovies as apiSearch, getCategories, getCountries } from '../services/api';
import { AppMovie, AppCategory, PaginationInfo } from '../types/movie';

const DEFAULT_PAGINATION: PaginationInfo = {
  currentPage: 0,
  totalPages: 0,
  totalItems: 0,
  hasMore: false,
};

const YEARS = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract state from URL
  const keyword = searchParams.get('keyword') || searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const category = searchParams.get('category') || '';
  const country = searchParams.get('country') || '';
  const year = searchParams.get('year') || '';
  const sort = searchParams.get('sort') || ''; // We will split this into sort_field and sort_type
  const sortLang = searchParams.get('sort_lang') || '';

  const [movies, setMovies] = useState<AppMovie[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [countries, setCountries] = useState<AppCategory[]>([]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [localKeyword, setLocalKeyword] = useState(keyword);

  // Load taxonomy
  useEffect(() => {
    Promise.all([getCategories(), getCountries()])
      .then(([cats, ctrs]) => {
        setCategories(cats);
        setCountries(ctrs);
      })
      .catch(() => {});
  }, []);

  // Fetch search results when URL params change
  const fetchMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let sort_field = '';
      let sort_type = '';
      
      if (sort) {
        const parts = sort.split('-');
        if (parts.length === 2) {
          sort_field = parts[0];
          sort_type = parts[1];
        }
      }

      const result = await apiSearch({
        keyword,
        page,
        category,
        country,
        year,
        sort_field,
        sort_type,
        sort_lang: sortLang,
        limit: 24
      });

      setMovies(result.movies);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message || 'Không thể tìm kiếm. Vui lòng thử lại.');
      setMovies([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, page, category, country, year, sort, sortLang]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Even if keyword is empty, we might have filters
    if (keyword || category || country || year || sort || sortLang) {
       fetchMovies();
    } else {
       // Clear if no filters
       setMovies([]);
       setPagination(DEFAULT_PAGINATION);
    }
  }, [fetchMovies, keyword, category, country, year, sort, sortLang]);

  // Debounce local keyword input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localKeyword !== keyword) {
        updateFilter('keyword', localKeyword);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localKeyword, keyword]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when filter changes
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    // Keep 'q' if 'keyword' is updated to sync smoothly or just use keyword. We'll standardise on keyword
    if (key === 'keyword' && newParams.has('q')) {
        newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setLocalKeyword('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = keyword || category || country || year || sort || sortLang;

  return (
    <div className="pt-24 pb-20 min-h-screen px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Bar: Search Input and Toggle Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Tìm kiếm & Lọc Phim</h1>
            
            <div className="flex w-full md:w-auto gap-2">
                <div className="relative flex-1 md:w-80">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tên phim, diễn viên..."
                        value={localKeyword}
                        onChange={(e) => setLocalKeyword(e.target.value)}
                        className="w-full bg-dark-light border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                    />
                    {localKeyword && (
                        <button onClick={() => setLocalKeyword('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${showFilters || hasActiveFilters ? 'bg-primary text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Bộ lọc</span>
                </button>
            </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
            {(showFilters || hasActiveFilters) && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-8"
                >
                    <div className="bg-dark-light border border-white/5 p-5 rounded-xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            
                            {/* Category */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Thể Loại</label>
                                <select 
                                    value={category} 
                                    onChange={(e) => updateFilter('category', e.target.value)}
                                    className="bg-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none appearance-none"
                                >
                                    <option value="">Tất cả</option>
                                    {categories.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Country */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quốc Gia</label>
                                <select 
                                    value={country} 
                                    onChange={(e) => updateFilter('country', e.target.value)}
                                    className="bg-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none appearance-none"
                                >
                                    <option value="">Tất cả</option>
                                    {countries.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Year */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Năm</label>
                                <select 
                                    value={year} 
                                    onChange={(e) => updateFilter('year', e.target.value)}
                                    className="bg-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none appearance-none"
                                >
                                    <option value="">Tất cả</option>
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            {/* Sort */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sắp Xếp</label>
                                <select 
                                    value={sort} 
                                    onChange={(e) => updateFilter('sort', e.target.value)}
                                    className="bg-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none appearance-none"
                                >
                                    <option value="">Mặc định</option>
                                    <option value="modified.time-desc">Mới cập nhật</option>
                                    <option value="year-desc">Năm sản xuất (Mới nhất)</option>
                                    <option value="year-asc">Năm sản xuất (Cũ nhất)</option>
                                </select>
                            </div>

                            {/* Language */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ngôn Ngữ</label>
                                <select 
                                    value={sortLang} 
                                    onChange={(e) => updateFilter('sort_lang', e.target.value)}
                                    className="bg-dark border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none appearance-none"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="vietsub">Vietsub</option>
                                    <option value="thuyet-minh">Thuyết Minh</option>
                                    <option value="long-tieng">Lồng Tiếng</option>
                                </select>
                            </div>

                        </div>

                        <div className="flex justify-end border-t border-white/5 pt-4 mt-2">
                            <button 
                                onClick={handleResetFilters}
                                className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1.5"
                            >
                                <X className="w-4 h-4" /> Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Results Info */}
        {hasActiveFilters && !isLoading && !error && (
            <p className="text-gray-400 text-sm mb-6">
              {pagination.totalItems > 0
                ? `Tìm thấy ${pagination.totalItems.toLocaleString()} kết quả phù hợp`
                : `Không tìm thấy kết quả phù hợp`}
            </p>
        )}

        {/* Results */}
        {error ? (
          <div className="text-center py-16">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : isLoading ? (
          <MovieGridSkeleton count={24} />
        ) : hasActiveFilters ? (
          <>
             <MovieGrid movies={movies} emptyMessage={`Không tìm thấy phim phù hợp với bộ lọc.`} />
             <Pagination pagination={pagination} onPageChange={(p) => updateFilter('page', p.toString())} />
          </>
        ) : (
             <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                 <SearchIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                 <p className="text-gray-400 text-lg">Vui lòng nhập từ khóa hoặc chọn bộ lọc để tìm kiếm phim.</p>
             </div>
        )}
      </div>
    </div>
  );
};
