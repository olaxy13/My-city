export type ListingType = 'event' | 'restaurant' | 'facility';
export type ListingStatus = 'pending' | 'needs_changes' | 'approved' | 'rejected';
export type AdminRole = 'admin' | 'super_admin';

export type CategoryEnum =
  | 'music'
  | 'food_drink'
  | 'sports'
  | 'comedy'
  | 'arts_culture'
  | 'nightlife'
  | 'religious'
  | 'education'
  | 'lifestyle'
  | 'wellness';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface CityResponse {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
  listingCount?: number;
  neighborhoods?: string[];
}
