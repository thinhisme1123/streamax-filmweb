import { useState, useEffect } from 'react';
import { Movie } from '../data/mockMovies';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('movie_bookmarks');
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
    localStorage.setItem('movie_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (movie: Movie) => {
    setBookmarks(prev => {
      if (!prev.find(m => m.id === movie.id)) {
        return [...prev, movie];
      }
      return prev;
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(m => m.id !== id));
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some(m => m.id === id);
  };

  const toggleBookmark = (movie: Movie) => {
    if (isBookmarked(movie.id)) {
      removeBookmark(movie.id);
    } else {
      addBookmark(movie);
    }
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
};
