import { useEffect } from 'react';
import { MovieCard } from '../components/MovieCard';
import { useBookmarks } from '../hooks/useBookmarks';

export const MyList = () => {
  const { bookmarks } = useBookmarks();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-20 min-h-screen px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">My List</h1>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-4">
            {bookmarks.map(movie => (
              <div key={movie.slug} className="w-full aspect-video">
                <MovieCard movie={{ slug: movie.slug, title: movie.title, name: movie.title, posterUrl: movie.poster_url } as any} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">
            <p className="text-xl">Your list is empty.</p>
            <p className="mt-2 text-sm">Add movies to your list to easily find them later.</p>
          </div>
        )}
      </div>
    </div>
  );
};
