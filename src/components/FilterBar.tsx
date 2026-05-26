import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown } from 'lucide-react';
import { getCategories, getCountries } from '../services/api';
import { AppCategory } from '../types/movie';

export const FilterBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [countries, setCountries] = useState<AppCategory[]>([]);

  // Get current year down to 1990
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [cats, counts] = await Promise.all([getCategories(), getCountries()]);
        setCategories(cats);
        setCountries(counts);
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };
    fetchFilters();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    // We create a new URLSearchParams object to avoid issues
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    newParams.delete('page'); // Reset page to 1 when filters change
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('country');
    newParams.delete('year');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const hasFilters = searchParams.has('category') || searchParams.has('country') || searchParams.has('year');

  return (
    <div className="bg-dark-light border border-white/5 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 text-gray-300 font-medium md:mr-4 shrink-0">
        <Filter className="w-5 h-5 text-primary" />
        <span>Lọc Phim</span>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={searchParams.get('category') || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:border-primary/50 transition-colors cursor-pointer"
          >
            <option value="" className="bg-dark">Tất cả thể loại</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug} className="bg-dark">{c.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Country Dropdown */}
        <div className="relative">
          <select
            value={searchParams.get('country') || ''}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:border-primary/50 transition-colors cursor-pointer"
          >
            <option value="" className="bg-dark">Tất cả quốc gia</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug} className="bg-dark">{c.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Year Dropdown */}
        <div className="relative">
          <select
            value={searchParams.get('year') || ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:border-primary/50 transition-colors cursor-pointer"
          >
            <option value="" className="bg-dark">Tất cả năm</option>
            {years.map((y) => (
              <option key={y} value={y.toString()} className="bg-dark">{y}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-4 py-2.5 rounded-lg transition-all shrink-0 w-full md:w-auto justify-center"
        >
          <X className="w-4 h-4" />
          <span>Xóa lọc</span>
        </button>
      )}
    </div>
  );
};
