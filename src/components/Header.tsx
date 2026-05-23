import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User, LogOut, X, Film, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { searchMovies } from '../services/api';
import { AppMovie } from '../types/movie';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickResults, setQuickResults] = useState<AppMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const debouncedQuery = useDebounce(searchQuery, 500);

  // Close search when route changes
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowDropdown(false);
  }, [location.pathname]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for quick results
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setQuickResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchQuick = async () => {
      try {
        setIsSearching(true);
        const result = await searchMovies({ keyword: debouncedQuery, page: 1, limit: 10 });
        setQuickResults(result.movies.slice(0, 6));
        setShowDropdown(true);
      } catch {
        setQuickResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchQuick();
  }, [debouncedQuery]);

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowDropdown(false);
    setQuickResults([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      handleSearchClose();
    }
  };

  const handleResultClick = (slug: string) => {
    navigate(`/phim/${slug}`);
    handleSearchClose();
  };

  const CATEGORIES = [
    { name: 'Hành Động', slug: 'hanh-dong' },
    { name: 'Tình Cảm', slug: 'tinh-cam' },
    { name: 'Hài Hước', slug: 'hai-huoc' },
    { name: 'Cổ Trang', slug: 'co-trang' },
    { name: 'Tâm Lý', slug: 'tam-ly-tinh-cam' },
    { name: 'Hình Sự', slug: 'hinh-su' },
    { name: 'Chiến Tranh', slug: 'chien-tranh' },
    { name: 'Thể Thao', slug: 'the-thao' },
    { name: 'Khoa Học', slug: 'khoa-hoc' },
    { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  ];

  const COUNTRIES = [
    { name: 'Hàn Quốc', slug: 'han-quoc' },
    { name: 'Trung Quốc', slug: 'trung-quoc' },
    { name: 'Âu Mỹ', slug: 'au-my' },
    { name: 'Việt Nam', slug: 'viet-nam' },
    { name: 'Nhật Bản', slug: 'nhat-ban' },
    { name: 'Thái Lan', slug: 'thai-lan' },
    { name: 'Ấn Độ', slug: 'an-do' },
  ];

  const YEARS = Array.from({ length: 15 }, (_, i) => 2024 - i);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-dark/95 backdrop-blur-sm shadow-lg shadow-black/20' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-primary text-2xl md:text-3xl font-black uppercase tracking-widest hover:text-primary-hover transition">
            StreaMax
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={`hover:text-white transition ${location.pathname === '/' ? 'text-white' : 'text-gray-300'}`}>
              Trang Chủ
            </Link>
            <Link to="/danh-sach/phim-le" className={`hover:text-white transition ${location.pathname.includes('/phim-le') ? 'text-white' : 'text-gray-300'}`}>
              Phim Lẻ
            </Link>
            <Link to="/danh-sach/phim-bo" className={`hover:text-white transition ${location.pathname.includes('/phim-bo') ? 'text-white' : 'text-gray-300'}`}>
              Phim Bộ
            </Link>

            {/* Thể Loại Dropdown */}
            <div className="relative group py-2">
              <button className={`flex items-center gap-1 hover:text-white transition ${location.pathname.includes('/the-loai') ? 'text-white' : 'text-gray-300'}`}>
                Thể Loại <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute top-full left-0 w-[400px] pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="bg-dark-light/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <Link key={cat.slug} to={`/the-loai/${cat.slug}`} className="px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Quốc Gia Dropdown */}
            <div className="relative group py-2">
              <button className={`flex items-center gap-1 hover:text-white transition ${location.pathname.includes('/quoc-gia') ? 'text-white' : 'text-gray-300'}`}>
                Quốc Gia <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute top-full left-0 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="bg-dark-light/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl grid grid-cols-2 gap-2">
                  {COUNTRIES.map(country => (
                    <Link key={country.slug} to={`/quoc-gia/${country.slug}`} className="px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      {country.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Năm Dropdown */}
            <div className="relative group py-2">
              <button className={`flex items-center gap-1 hover:text-white transition ${location.pathname.includes('/nam') ? 'text-white' : 'text-gray-300'}`}>
                Năm <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute top-full left-0 w-72 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="bg-dark-light/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl grid grid-cols-3 gap-2">
                  {YEARS.map(year => (
                    <Link key={year} to={`/nam/${year}`} className="px-3 py-2 text-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm">
                      {year}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.form
                  key="search-form"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex items-center bg-black/80 border border-white/20 rounded-md overflow-hidden">
                    <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Tên phim, diễn viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white px-3 py-2 text-sm outline-none w-56 md:w-72 placeholder-gray-500"
                    />
                    {isSearching && (
                      <div className="w-4 h-4 border-2 border-primary/60 border-t-transparent rounded-full animate-spin mr-3" />
                    )}
                    {searchQuery && !isSearching && (
                      <button
                        type="button"
                        onClick={() => { setSearchQuery(''); setShowDropdown(false); inputRef.current?.focus(); }}
                        className="mr-2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchClose}
                    className="text-gray-400 hover:text-white transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleSearchOpen}
                  className="p-1.5 hover:text-primary transition-colors"
                >
                  <Search className="w-5 h-5 text-white" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Quick Results Dropdown */}
            <AnimatePresence>
              {showDropdown && quickResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                >
                  <div className="px-3 pt-3 pb-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Kết quả nhanh
                  </div>
                  {quickResults.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => handleResultClick(movie.slug || movie.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-10 h-14 rounded-md overflow-hidden shrink-0 bg-dark-light">
                        <img
                          src={movie.thumbnailUrl || movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                          {movie.title}
                        </p>
                        <p className="text-gray-400 text-xs line-clamp-1">{movie.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {movie.year > 0 && <span className="text-gray-500 text-xs">{movie.year}</span>}
                          {movie.quality && (
                            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">{movie.quality}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit as any}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm text-primary hover:bg-primary/10 transition-colors border-t border-white/5"
                  >
                    <Film className="w-4 h-4" />
                    Xem tất cả kết quả cho "{searchQuery}"
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bell */}
          <button className="hidden md:block p-1 hover:text-primary transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </button>

          {/* User menu */}
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/40 transition-all">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="absolute right-0 top-full mt-2 w-52 bg-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 overflow-hidden">
              {user ? (
                <>
                  <div className="px-4 py-2.5 border-b border-white/10 text-sm text-gray-300">
                    👋 {user.email.split('@')[0]}
                  </div>
                  <Link to="/mylist" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
                    <Film className="w-4 h-4 text-gray-400" /> Danh sách của tôi
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-red-400"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link to="/auth" className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
