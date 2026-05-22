import axios from 'axios';
import { ApiResponse, ApiDetailResponse, ApiListResponse, AppMovie, AppMovieDetail, AppCategory, MovieListResult, SearchParams, normalizeApiMovie, normalizeMovieDetail } from '../types/movie';

const api = axios.create({
  baseURL: 'https://phimapi.com',
  timeout: 10000,
});

export const getNewUpdatedMovies = async (page = 1): Promise<AppMovie[]> => {
  const response = await api.get<ApiResponse>(`/danh-sach/phim-moi-cap-nhat?page=${page}`);
  const data = response.data;
  if (!data.status) throw new Error("Failed to fetch newly updated movies");
  const items = data.items || [];
  return items.map(item => normalizeApiMovie(item, data.pathImage));
};

export const getMoviesList = async (type: string, page = 1): Promise<AppMovie[]> => {
  const response = await api.get<ApiResponse>(`/v1/api/danh-sach/${type}?page=${page}`);
  const data = response.data;
  if (!data.status || !data.data) throw new Error(`Failed to fetch movies for type ${type}`);
  const items = data.data.items || [];
  const imageDomain = data.data.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com';
  return items.map(item => normalizeApiMovie(item, imageDomain));
};

export const getMovieDetail = async (slug: string): Promise<AppMovieDetail> => {
  const response = await api.get<ApiDetailResponse>(`/phim/${slug}`);
  const data = response.data;
  if (!data.status || !data.movie) throw new Error(`Failed to fetch movie detail for: ${slug}`);
  return normalizeMovieDetail(data);
};

// Helper: normalize paginated list responses
const normalizePaginatedResponse = (response: { data: ApiListResponse }): MovieListResult => {
  const d = response.data.data;
  const imageDomain = d.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com';
  const movies = (d.items || []).map(item => normalizeApiMovie(item, imageDomain));
  const p = d.params.pagination;
  return {
    movies,
    pagination: {
      currentPage: p.currentPage,
      totalPages: p.totalPages,
      totalItems: p.totalItems,
      hasMore: p.currentPage < p.totalPages,
    },
  };
};

export const searchMovies = async (params: SearchParams): Promise<MovieListResult> => {
  // Filter out falsy values to avoid sending empty params
  const cleanParams: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = value;
    }
  }

  const response = await api.get<ApiListResponse>(`/v1/api/tim-kiem`, {
    params: cleanParams,
  });
  
  if (!response.data.status) {
    throw new Error('Search failed: ' + (response.data.msg || 'Unknown error'));
  }
  
  return normalizePaginatedResponse(response);
};

export const getCategories = async (): Promise<AppCategory[]> => {
  const response = await api.get<AppCategory[]>('/the-loai');
  return response.data;
};

export const getCountries = async (): Promise<AppCategory[]> => {
  const response = await api.get<AppCategory[]>('/quoc-gia');
  return response.data;
};

export const getCategoryMovies = async (slug: string, page = 1): Promise<MovieListResult> => {
  const response = await api.get<ApiListResponse>(`/v1/api/the-loai/${slug}`, { params: { page } });
  if (!response.data.status) throw new Error(`Failed to fetch category: ${slug}`);
  return normalizePaginatedResponse(response);
};

export const getCountryMovies = async (slug: string, page = 1): Promise<MovieListResult> => {
  const response = await api.get<ApiListResponse>(`/v1/api/quoc-gia/${slug}`, { params: { page } });
  if (!response.data.status) throw new Error(`Failed to fetch country: ${slug}`);
  return normalizePaginatedResponse(response);
};

