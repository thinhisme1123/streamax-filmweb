import axios from 'axios';
import { ApiResponse, ApiDetailResponse, AppMovie, AppMovieDetail, normalizeApiMovie, normalizeMovieDetail } from '../types/movie';

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
