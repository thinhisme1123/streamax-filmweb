import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('movie_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('movie_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('movie_user');
    }
  }, [user]);

  const login = (email: string) => {
    setUser({ name: email.split('@')[0], email });
  };

  const logout = () => {
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
};
