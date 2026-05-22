import { useState, useEffect } from 'react';
import { Movie } from '../data/mockMovies';

export const useHistory = () => {
  const [history, setHistory] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('movie_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('movie_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (movie: Movie) => {
    setHistory(prev => {
      const filtered = prev.filter(m => m.id !== movie.id);
      return [movie, ...filtered].slice(0, 20); // Keep last 20
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, clearHistory };
};
