import { Heart } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { AppMovie } from '../types/movie';
import { FavoriteMovie } from '../store/userStore';
import { twMerge } from 'tailwind-merge';

interface FavoriteButtonProps {
  movie: AppMovie | FavoriteMovie | any; // To accept various movie formats currently used
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export const FavoriteButton = ({ movie, className, iconClassName, children }: FavoriteButtonProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  
  const slug = movie.slug || movie.id;
  const bookmarked = isBookmarked(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark(movie);
  };

  return (
    <button 
      onClick={handleClick}
      className={twMerge(
        "flex items-center justify-center transition-all duration-300",
        className
      )}
      title={bookmarked ? "Xoá khỏi danh sách" : "Thêm vào danh sách"}
    >
      <Heart 
        className={twMerge(
          "transition-colors duration-300",
          bookmarked ? "fill-red-500 text-red-500" : "text-white group-hover:text-red-500",
          iconClassName
        )} 
      />
      {children && <span className="ml-2">{children}</span>}
    </button>
  );
};
