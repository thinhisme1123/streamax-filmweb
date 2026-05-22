import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-dark shadow-md' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-primary text-2xl md:text-3xl font-bold uppercase tracking-wider">
            StreaMax
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <Link to="/search" className="hover:text-primary transition">Movies</Link>
            <Link to="/mylist" className="hover:text-primary transition">My List</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <form onSubmit={handleSearch} className="relative flex items-center">
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Titles, people, genres"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="absolute right-8 bg-black/80 border border-white/20 text-white px-3 py-1 text-sm outline-none w-48 md:w-64 transition-all duration-300"
                autoFocus
                onBlur={() => !searchQuery && setIsSearchOpen(false)}
              />
            )}
            <button type="button" onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-1">
              <Search className="w-5 h-5 text-white hover:text-gray-300" />
            </button>
          </form>

          <button className="hidden md:block">
            <Bell className="w-5 h-5 text-white hover:text-gray-300" />
          </button>

          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-black border border-white/10 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-white/10 text-sm text-gray-300">
                    {user.name}
                  </div>
                  <Link to="/mylist" className="block px-4 py-2 text-sm hover:bg-white/10">My List</Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="block px-4 py-2 text-sm hover:bg-white/10">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
