import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { searchMovies, mockMovies, getAllGenres } from '../data/mockMovies';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  const genres = ['All', ...getAllGenres()];

  let results = query ? searchMovies(query) : mockMovies;
  
  if (selectedGenre !== 'All') {
    results = results.filter(m => m.genre === selectedGenre);
  }

  return (
    <div className="pt-24 pb-20 min-h-screen px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">
          {query ? `Search Results for "${query}"` : 'Browse Movies'}
        </h1>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                selectedGenre === genre 
                  ? 'bg-primary text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-4">
            {results.map(movie => (
              <div key={movie.id} className="w-full aspect-video">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">
            <p className="text-xl">No movies found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
