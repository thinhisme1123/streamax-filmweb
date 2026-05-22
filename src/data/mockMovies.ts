import { AppMovie } from '../types/movie';

export type Movie = AppMovie;

export const mockMovies: Movie[] = [
  {
    id: "1",
    title: "Cosmic Vanguard",
    slug: "cosmic-vanguard",
    description: "In a distant future, a rogue squad of space fighters must stop a galactic empire from obtaining an ancient weapon.",
    thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1494&auto=format&fit=crop",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1494&auto=format&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    genre: "Sci-Fi",
    duration: "2h 15m",
    year: 2025,
    matchScore: 98,
    maturityRating: "13+"
  },
  {
    id: "2",
    title: "Shadows of the City",
    slug: "shadows-of-the-city",
    description: "A seasoned detective teams up with a street-smart informant to take down a massive criminal syndicate.",
    thumbnailUrl: "https://images.unsplash.com/photo-1573455492815-461719273111?q=80&w=1469&auto=format&fit=crop",
    posterUrl: "https://images.unsplash.com/photo-1573455492815-461719273111?q=80&w=1469&auto=format&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    genre: "Action",
    duration: "1h 50m",
    year: 2024,
    matchScore: 95,
    maturityRating: "16+"
  },
  {
    id: "3",
    title: "The Last Laugh",
    slug: "the-last-laugh",
    description: "A struggling comedian finds unexpected success after a video of his disastrous set goes viral.",
    thumbnailUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1470&auto=format&fit=crop",
    posterUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1470&auto=format&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    genre: "Comedy",
    duration: "1h 40m",
    year: 2023,
    matchScore: 88,
    maturityRating: "13+"
  },
  {
    id: "4",
    title: "Silent Depths",
    slug: "silent-depths",
    description: "A deep-sea exploration team encounters a terrifying, undiscovered species.",
    thumbnailUrl: "https://images.unsplash.com/photo-1620662668580-c116c274719d?q=80&w=1470&auto=format&fit=crop",
    posterUrl: "https://images.unsplash.com/photo-1620662668580-c116c274719d?q=80&w=1470&auto=format&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    genre: "Horror",
    duration: "1h 55m",
    year: 2025,
    matchScore: 92,
    maturityRating: "18+"
  },
  {
    id: "5",
    title: "Neon Dreams",
    slug: "neon-dreams",
    description: "In a cyberpunk metropolis, a hacker uncovers a conspiracy that goes all the way to the top.",
    thumbnailUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1470&auto=format&fit=crop",
    posterUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1470&auto=format&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    genre: "Sci-Fi",
    duration: "2h 05m",
    year: 2024,
    matchScore: 97,
    maturityRating: "16+"
  },
  {
    id: "6",
    title: "The Grand Adventure",
    slug: "the-grand-adventure",
    description: "An animated epic about a group of unlikely animal heroes on a quest to save their forest.",
    thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1494&auto=format&fit=crop",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1494&auto=format&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    genre: "Family",
    duration: "1h 35m",
    year: 2023,
    matchScore: 94,
    maturityRating: "All"
  },
  {
    id: "7",
    title: "Steel Hearts",
    slug: "steel-hearts",
    description: "A dramatic retelling of a historical battle from the perspective of two opposing commanders.",
    thumbnailUrl: "https://images.unsplash.com/photo-1573455492815-461719273111?q=80&w=1469&auto=format&fit=crop",
    posterUrl: "https://images.unsplash.com/photo-1573455492815-461719273111?q=80&w=1469&auto=format&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    genre: "Drama",
    duration: "2h 30m",
    year: 2022,
    matchScore: 89,
    maturityRating: "16+"
  },
  {
    id: "8",
    title: "Love in Paris",
    slug: "love-in-paris",
    description: "Two strangers find connection and romance during a magical weekend in Paris.",
    thumbnailUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1470&auto=format&fit=crop",
    posterUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1470&auto=format&fit=crop",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    genre: "Romance",
    duration: "1h 45m",
    year: 2024,
    matchScore: 91,
    maturityRating: "13+"
  }
];

export const getMoviesByGenre = (genre: string) => {
  return mockMovies.filter(movie => movie.genre.toLowerCase() === genre.toLowerCase());
};

export const getAllGenres = () => {
  const genres = new Set(mockMovies.map(movie => movie.genre));
  return Array.from(genres);
};

export const searchMovies = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return mockMovies.filter(movie => 
    movie.title.toLowerCase().includes(lowerQuery) || 
    movie.description.toLowerCase().includes(lowerQuery) ||
    movie.genre.toLowerCase().includes(lowerQuery)
  );
};

export const getMovieById = (id: string) => {
  return mockMovies.find(movie => movie.id === id);
};
