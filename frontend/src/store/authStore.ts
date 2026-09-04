import { create } from 'zustand';
import { backendApi } from '../services/backendApi';

export interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  init: () => {
    const savedUser = localStorage.getItem('movie_user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      set({ user: JSON.parse(savedUser), isAuthenticated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      if (!password) {
        // Fallback for old mock login
        const dummyUser = { id: 'dummy', email };
        set({ user: dummyUser, isAuthenticated: true, isLoading: false });
        localStorage.setItem('movie_user', JSON.stringify(dummyUser));
        return true;
      }
      const res = await backendApi.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('movie_user', JSON.stringify(res.data.user));
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Đăng nhập thất bại',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      if (!password) throw new Error('Password is required');
      const res = await backendApi.post('/auth/register', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('movie_user', JSON.stringify(res.data.user));
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Đăng ký thất bại',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('movie_user');
    set({ user: null, isAuthenticated: false });
  },
}));

// Initialize auth store
useAuthStore.getState().init();
