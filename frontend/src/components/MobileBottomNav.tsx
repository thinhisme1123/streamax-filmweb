import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Search } from 'lucide-react';

export const MobileBottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { name: 'Trang Chủ', path: '/', icon: Home, match: (p: string) => p === '/' },
    { name: 'Phim Lẻ', path: '/danh-sach/phim-le', icon: Film, match: (p: string) => p.includes('/phim-le') },
    { name: 'Phim Bộ', path: '/danh-sach/phim-bo', icon: Tv, match: (p: string) => p.includes('/phim-bo') },
    { name: 'Tìm Kiếm', path: '/search', icon: Search, match: (p: string) => p.includes('/search') },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black/90 backdrop-blur border-t border-gray-800 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.match(path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
