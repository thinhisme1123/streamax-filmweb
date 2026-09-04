import { useState, useEffect } from 'react';
import { getMovieDetail } from '../services/api';
import { AppMovieDetail } from '../types/movie';

export const useMovieDetail = (slug: string | undefined) => {
  const [movie, setMovie] = useState<AppMovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('No movie slug provided');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovieDetail(slug);
        setMovie(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  return { movie, loading, error };
};
