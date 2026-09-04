import { useUserStore } from '../store/userStore';

export const useBookmarks = () => {
  const store = useUserStore();
  
  return {
    bookmarks: store.favorites,
    isLoading: store.isLoading,
    isBookmarked: (slug: string) => store.favorites.some(m => m.slug === slug),
    toggleBookmark: store.toggleBookmark
  };
};
