import { useState, useEffect } from 'react';
import { getNewUpdatedMovies, getMoviesList } from '../services/api';
import { AppMovie } from '../types/movie';

export const useMovies = () => {
  const [heroMovies, setHeroMovies] = useState<AppMovie[]>([]);
  const [newMovies, setNewMovies] = useState<AppMovie[]>([]);
  const [tvSeries, setTvSeries] = useState<AppMovie[]>([]);
  const [animations, setAnimations] = useState<AppMovie[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [hero, movies, series, anims] = await Promise.all([
          getNewUpdatedMovies(1),
          getMoviesList('phim-le', 1),
          getMoviesList('phim-bo', 1),
          getMoviesList('hoat-hinh', 1)
        ]);

        setHeroMovies(hero);
        setNewMovies(movies);
        setTvSeries(series);
        setAnimations(anims);
      } catch (err: any) {
        setError(err.message || "Something went wrong fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { heroMovies, newMovies, tvSeries, animations, loading, error };
};
