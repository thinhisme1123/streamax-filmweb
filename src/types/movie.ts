export interface ApiMovieItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  thumb_url: string;
  poster_url: string;
  year?: number;
  category?: { id: string; name: string; slug: string }[];
  country?: { id: string; name: string; slug: string }[];
  episode_current?: string;
  quality?: string;
  lang?: string;
  time?: string;
  type?: string;
}

export interface ApiResponse {
  status: boolean;
  pathImage?: string;
  items?: ApiMovieItem[];
  data?: {
    APP_DOMAIN_CDN_IMAGE?: string;
    items?: ApiMovieItem[];
  };
}

// === Paginated list/search API response ===
export interface ApiPagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface ApiListData {
  items: ApiMovieItem[];
  params: {
    pagination: ApiPagination;
  };
  APP_DOMAIN_CDN_IMAGE: string;
  titlePage?: string;
}

export interface ApiListResponse {
  status: boolean;
  msg: string;
  data: ApiListData;
}

// === Taxonomy types ===
export interface AppCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

export interface MovieListResult {
  movies: AppMovie[];
  pagination: PaginationInfo;
}

export interface SearchParams {
  keyword: string;
  page?: number;
  sort_field?: string;
  sort_type?: string;
  sort_lang?: string;
  category?: string;
  country?: string;
  year?: string;
  limit?: number;
}


// === Detail API Types ===


export interface ApiEpisode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface ApiEpisodeServer {
  server_name: string;
  server_data: ApiEpisode[];
}

export interface ApiMovieDetail {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  poster_url: string;
  thumb_url: string;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  year: number;
  actor: string[];
  director: string[];
  category: { id: string; name: string; slug: string }[];
  country: { id: string; name: string; slug: string }[];
}

export interface ApiDetailResponse {
  status: boolean;
  msg: string;
  movie: ApiMovieDetail;
  episodes: ApiEpisodeServer[];
}

// === App-level types ===

export interface AppMovie {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  posterUrl: string;
  videoUrl: string;
  genre: string;
  duration: string;
  year: number;
  matchScore: number;
  maturityRating: string;
  // Optional enriched fields from list APIs
  quality?: string;
  episodeCurrent?: string;
  language?: string;
}

export interface AppMovieDetail {
  id: string;
  title: string;
  slug: string;
  originalTitle: string;
  synopsis: string;
  type: string;
  status: string;
  posterUrl: string;
  thumbnailUrl: string;
  trailerUrl: string;
  duration: string;
  episodeCurrent: string;
  episodeTotal: string;
  quality: string;
  language: string;
  year: number;
  cast: string[];
  director: string[];
  genres: { name: string; slug: string }[];
  countries: { name: string; slug: string }[];
  episodes: AppEpisodeServer[];
}

export interface AppEpisodeServer {
  serverName: string;
  episodes: AppEpisode[];
}

export interface AppEpisode {
  name: string;
  slug: string;
  filename: string;
  linkEmbed: string;
  linkM3u8: string;
}

export const normalizeApiMovie = (item: ApiMovieItem, imageDomain: string = ''): AppMovie => {
  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return imageDomain ? `${imageDomain}/${url}` : url;
  };

  return {
    id: item._id,
    title: item.name,
    slug: item.slug,
    description: item.origin_name || "Mô tả đang được cập nhật...",
    thumbnailUrl: getFullUrl(item.thumb_url),
    posterUrl: getFullUrl(item.poster_url),
    videoUrl: "",
    genre: item.category?.[0]?.name || "N/A",
    duration: item.time || "N/A",
    year: item.year || new Date().getFullYear(),
    matchScore: Math.floor(Math.random() * (99 - 85) + 85),
    maturityRating: "13+",
    quality: item.quality,
    episodeCurrent: item.episode_current,
    language: item.lang,
  };
};

export const normalizeMovieDetail = (data: ApiDetailResponse): AppMovieDetail => {
  const movie = data.movie;

  // Strip HTML tags from content
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').trim();
  };

  return {
    id: movie._id,
    title: movie.name,
    slug: movie.slug,
    originalTitle: movie.origin_name,
    synopsis: stripHtml(movie.content),
    type: movie.type,
    status: movie.status,
    posterUrl: movie.poster_url,
    thumbnailUrl: movie.thumb_url,
    trailerUrl: movie.trailer_url || '',
    duration: movie.time || 'N/A',
    episodeCurrent: movie.episode_current,
    episodeTotal: movie.episode_total,
    quality: movie.quality,
    language: movie.lang,
    year: movie.year,
    cast: movie.actor || [],
    director: movie.director || [],
    genres: movie.category?.map(c => ({ name: c.name, slug: c.slug })) || [],
    countries: movie.country?.map(c => ({ name: c.name, slug: c.slug })) || [],
    episodes: data.episodes?.map(server => ({
      serverName: server.server_name,
      episodes: server.server_data?.map(ep => ({
        name: ep.name,
        slug: ep.slug,
        filename: ep.filename,
        linkEmbed: ep.link_embed,
        linkM3u8: ep.link_m3u8,
      })) || [],
    })) || [],
  };
};
