import { ListingType, ListingStatus, CategoryEnum } from './common.dto';

export interface ListingImageResponse {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface EventDetailsDto {
  startDateTime: string | Date;
  endDateTime?: string | Date | null;
  isRecurring?: boolean;
}

export interface RestaurantDetailsDto {
  cuisineType: string;
  priceRange?: string | null;
  operatingHours?: string | null;
  menuLink?: string | null;
  cacNumber?: string | null;
  licenseNumber?: string | null;
}

export interface FacilityDetailsDto {
  facilityCategory: string;
  emergencyContact?: string | null;
  operatingHours?: string | null;
  cacNumber?: string | null;
  licenseNumber?: string | null;
}

export interface ListingDetailResponse {
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
  contactPhone?: string | null; // Used for WhatsApp chat / customer care
  contactEmail?: string | null;
  externalLink?: string | null; // Used for tickets purchase / external website
  status: ListingStatus;
  isFeatured: boolean;
  featuredOrder?: number | null;
  isPublished: boolean;
  eventDetails?: EventDetailsDto | null;
  restaurantDetails?: RestaurantDetailsDto | null;
  facilityDetails?: FacilityDetailsDto | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CountdownSliderItem {
  id: string;
  listingType: 'event';
  title: string;
  thumbnailUrl: string;
  city: string;
  neighborhood: string;
  category: CategoryEnum;
  categoryLabel: string;
  isFeatured: boolean;
  featuredOrder?: number | null;
  startDateTime: string | Date;
  endDateTime?: string | Date | null;
}
