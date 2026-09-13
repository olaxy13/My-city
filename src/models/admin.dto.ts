import { ListingType, ListingStatus, CategoryEnum } from './common.dto';
import {
  ListingImageResponse,
  EventDetailsDto,
  RestaurantDetailsDto,
  FacilityDetailsDto,
} from './listing.dto';

export interface AdminListingDetailResponse {
  id: string;
  listingType: ListingType;
  title: string;
  description: string;
  category: CategoryEnum;
  categoryLabel: string;
  city: string;
  neighborhood: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  thumbnailUrl: string;
  images: ListingImageResponse[];
  legalDocumentUrls?: string[];
  contactPhone?: string | null;
  contactEmail?: string | null;
  externalLink?: string | null;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  editToken?: string | null;
  status: ListingStatus;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  isFeatured: boolean;
  featuredOrder?: number | null;
  isPublished: boolean;
  eventDetails?: EventDetailsDto | null;
  restaurantDetails?: RestaurantDetailsDto | null;
  facilityDetails?: FacilityDetailsDto | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ModerationActionResponse {
  id: string;
  title: string;
  status: ListingStatus;
  isPublished: boolean;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  updatedAt: string | Date;
}

export interface RejectListingDto {
  rejectionReason: string;
}

export interface RequestChangesDto {
  adminNotes: string;
}

export interface FeatureListingDto {
  isFeatured: boolean;
  featuredOrder?: number;
}

export interface ReorderFeaturedDto {
  orderedIds: string[];
}

export interface PublishStatusDto {
  isPublished: boolean;
}
