import { ListingType, CategoryEnum } from './common.dto';
import { EventDetailsDto, RestaurantDetailsDto, FacilityDetailsDto } from './listing.dto';

export interface CreateSubmissionDto {
  listingType: ListingType;
  title: string;
  description: string;
  category: CategoryEnum;
  city?: string;
  neighborhood: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  thumbnailUrl: string;
  galleryImageUrls?: string[];
  legalDocumentUrls?: string[]; // Mandatory for restaurants & facilities (CAC docs, licenses)

  contactPhone?: string; // WhatsApp / Customer care
  contactEmail?: string;
  externalLink?: string; // Tickets / reservation site

  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;

  // Type-specific payloads
  eventDetails?: EventDetailsDto;
  restaurantDetails?: RestaurantDetailsDto;
  facilityDetails?: FacilityDetailsDto;
}

export interface ResubmitListingDto {
  title?: string;
  description?: string;
  category?: CategoryEnum;
  city?: string;
  neighborhood?: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  legalDocumentUrls?: string[];

  contactPhone?: string;
  contactEmail?: string;
  externalLink?: string;

  submitterName?: string;
  submitterPhone?: string;

  eventDetails?: EventDetailsDto;
  restaurantDetails?: RestaurantDetailsDto;
  facilityDetails?: FacilityDetailsDto;
}

export interface SubmissionResponseData {
  id: string;
  title: string;
  listingType: ListingType;
  status: string;
  editToken?: string;
}
