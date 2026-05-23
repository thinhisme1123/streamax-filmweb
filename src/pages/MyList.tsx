import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MovieCard } from '../components/MovieCard';
import { useBookmarks } from '../hooks/useBookmarks';
import { Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const MyList = () => {
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-20 min-h-screen px-4 md:px-12 bg-dark">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
          Danh sách của tôi
        </h1>

        {bookmarks.length > 0 ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-4"
          >
            {bookmarks.map(movie => (
              <motion.div key={movie.slug} variants={item} className="w-full flex justify-center">
                <MovieCard 
                  movie={{ 
                    slug: movie.slug, 
                    title: movie.title, 
                    name: movie.title, 
                    posterUrl: movie.poster_url,
                    thumbnailUrl: movie.poster_url 
                  } as any}
                  className="w-full md:w-full h-auto md:h-auto aspect-video" 
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center py-32 bg-white/5 rounded-2xl border border-white/10"
          >
            <div className="w-20 h-20 bg-dark-light rounded-full flex items-center justify-center mb-6">
              <Film className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Danh sách trống</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Bạn chưa thêm bộ phim nào vào danh sách. Hãy khám phá và thêm những bộ phim yêu thích để xem sau nhé!
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors"
            >
              Khám phá phim
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
