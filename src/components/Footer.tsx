import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-dark text-gray-400 py-12 px-4 md:px-12 border-t border-white/10 mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">StreaMax</h3>
          <p className="text-sm">Premium cinematic experience at your fingertips.</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/search" className="hover:text-white transition">Movies</Link></li>
            <li><Link to="/search?q=series" className="hover:text-white transition">TV Series</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/mylist" className="hover:text-white transition">My List</Link></li>
            <li><Link to="/auth" className="hover:text-white transition">Sign In</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Cookie Preferences</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 text-sm text-center">
        &copy; {new Date().getFullYear()} StreaMax. All rights reserved.
      </div>
    </footer>
  );
};
