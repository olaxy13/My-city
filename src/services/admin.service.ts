import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ListingStatus, ListingType, CategoryEnum } from '../models/common.dto';
import { AdminListingDetailResponse } from '../models/admin.dto';
import { getCategoryLabel } from '../utils/categories';
import { NotFoundError } from '../utils/errors';

export interface AdminListingFilterParams {
  status?: ListingStatus;
  type?: ListingType;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AdminService {
  private static formatAdminListing(item: any): AdminListingDetailResponse {
    return {
      id: item.id,
      listingType: item.listingType as ListingType,
      title: item.title,
      description: item.description,
      category: item.category as CategoryEnum,
      categoryLabel: getCategoryLabel(item.category as CategoryEnum),
      city: item.city,
      neighborhood: item.neighborhood,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      thumbnailUrl: item.thumbnailUrl,
      images: item.images || [],
      legalDocumentUrls: item.legalDocumentUrls || [],
      contactPhone: item.contactPhone,
      contactEmail: item.contactEmail,
      externalLink: item.externalLink,
      submitterName: item.submitterName,
      submitterEmail: item.submitterEmail,
      submitterPhone: item.submitterPhone,
      editToken: item.editToken,
      status: item.status as ListingStatus,
      rejectionReason: item.rejectionReason,
      adminNotes: item.adminNotes,
      isFeatured: item.isFeatured,
      featuredOrder: item.featuredOrder,
      isPublished: item.isPublished,
      eventDetails: item.eventDetails,
      restaurantDetails: item.restaurantDetails,
      facilityDetails: item.facilityDetails,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  /**
   * Get all listings for moderation queue and admin management with filters
   */
  static async getAdminListings(params: AdminListingFilterParams): Promise<{
    items: AdminListingDetailResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.type) where.listingType = params.type;
    if (params.city) {
      where.city = { contains: params.city, mode: 'insensitive' };
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { submitterName: { contains: params.search, mode: 'insensitive' } },
        { submitterEmail: { contains: params.search, mode: 'insensitive' } },
        { neighborhood: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          eventDetails: true,
          restaurantDetails: true,
          facilityDetails: true,
        },
      }),
    ]);

    return {
      items: items.map((item) => this.formatAdminListing(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get full listing details by ID for admin review
   */
  static async getAdminListingById(id: string): Promise<AdminListingDetailResponse> {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        eventDetails: true,
        restaurantDetails: true,
        facilityDetails: true,
      },
    });

    if (!listing) {
      throw new NotFoundError(`Listing with ID ${id} was not found`);
    }

    return this.formatAdminListing(listing);
  }

  /**
   * Feature / Unfeature Listing
   */
  static async setFeatured(id: string, isFeatured: boolean, featuredOrder = 0): Promise<AdminListingDetailResponse> {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        eventDetails: true,
        restaurantDetails: true,
        facilityDetails: true,
      },
    });

    if (!listing) {
      throw new NotFoundError(`Listing with ID ${id} was not found`);
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        isFeatured,
        featuredOrder: isFeatured ? featuredOrder : 0,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        eventDetails: true,
        restaurantDetails: true,
        facilityDetails: true,
      },
    });

    return this.formatAdminListing(updated);
  }

  /**
   * Bulk Reorder Featured Listings
   */
  static async reorderFeatured(orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) =>
      prisma.listing.update({
        where: { id },
        data: {
          isFeatured: true,
          featuredOrder: index + 1,
        },
      })
    );

    await prisma.$transaction(updates);
  }

  /**
   * Toggle Publish Status
   */
  static async setPublishStatus(id: string, isPublished: boolean): Promise<AdminListingDetailResponse> {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        eventDetails: true,
        restaurantDetails: true,
        facilityDetails: true,
      },
    });

    if (!listing) {
      throw new NotFoundError(`Listing with ID ${id} was not found`);
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: { isPublished },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        eventDetails: true,
        restaurantDetails: true,
        facilityDetails: true,
      },
    });

    return this.formatAdminListing(updated);
  }
}
