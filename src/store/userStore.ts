import { create } from 'zustand';
import { backendApi } from '../services/backendApi';
import { AppMovie } from '../types/movie';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

export interface FavoriteMovie {
  slug: string;
  title: string;
  poster_url: string;
}

export interface WatchHistoryItem {
  movieSlug: string;
  movieTitle: string;
  poster_url: string;
  currentEpisode: string;
  progressPercentage: number;
  lastWatchedAt: string;
}

interface UserState {
  favorites: FavoriteMovie[];
  history: WatchHistoryItem[];
  isLoading: boolean;
  fetchUserData: () => Promise<void>;
  toggleBookmark: (movie: AppMovie | FavoriteMovie) => Promise<void>;
  addToHistory: (movie: AppMovie, episodeName: string, progress?: number) => Promise<void>;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  favorites: [],
  history: [],
  isLoading: false,

  fetchUserData: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    set({ isLoading: true });
    try {
      const res = await backendApi.get('/user/profile');
      set({
        favorites: res.data.favorites || [],
        history: res.data.watchHistory || [],
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleBookmark: async (movie) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    const slug = (movie as AppMovie).slug || (movie as FavoriteMovie).slug || (movie as any).id;
    const title = movie.title || (movie as any).name;
    const poster_url = (movie as AppMovie).posterUrl || (movie as FavoriteMovie).poster_url;

    // Optimistic update
    const currentFavorites = get().favorites;
    const isBookmarked = currentFavorites.some(m => m.slug === slug);
    
    set({
      favorites: isBookmarked
        ? currentFavorites.filter(m => m.slug !== slug)
        : [...currentFavorites, { slug, title, poster_url }]
    });

    try {
      await backendApi.post('/user/favorites', { slug, title, poster_url });
      toast.success(isBookmarked ? 'Đã xoá khỏi Danh sách của tôi' : 'Đã thêm vào Danh sách của tôi');
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      // Revert on failure
      get().fetchUserData();
    }
  },

  addToHistory: async (movie, episodeName, progress = 0) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    const movieSlug = movie.slug;
    const movieTitle = movie.title || (movie as any).name;
    const poster_url = movie.posterUrl || (movie as any).poster_url;

    // Optimistic update
    const currentHistory = get().history;
    const filtered = currentHistory.filter(m => m.movieSlug !== movieSlug);
    set({
      history: [{
        movieSlug,
        movieTitle,
        poster_url,
        currentEpisode: episodeName,
        progressPercentage: progress,
        lastWatchedAt: new Date().toISOString()
      }, ...filtered].slice(0, 50)
    });

    try {
      await backendApi.post('/user/history', {
        movieSlug,
        movieTitle,
        poster_url,
        currentEpisode: episodeName,
        progressPercentage: progress
      });
    } catch (error) {
      console.error('Failed to add to history:', error);
      get().fetchUserData();
    }
  },

  clearUserData: () => {
    set({ favorites: [], history: [] });
  }
}));

// Listen to auth changes
useAuthStore.subscribe((state, prevState) => {
  if (state.isAuthenticated && !prevState.isAuthenticated) {
    useUserStore.getState().fetchUserData();
  } else if (!state.isAuthenticated && prevState.isAuthenticated) {
    useUserStore.getState().clearUserData();
  }
});

// Initial fetch if already authenticated
if (useAuthStore.getState().isAuthenticated) {
  useUserStore.getState().fetchUserData();
}
