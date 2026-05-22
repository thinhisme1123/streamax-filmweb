import { useUserStore } from '../store/userStore';

export const useHistory = () => {
  const store = useUserStore();
  
  return {
    history: store.history,
    isLoading: store.isLoading,
    addToHistory: store.addToHistory,
    clearHistory: store.clearUserData // fallback
  };
};
