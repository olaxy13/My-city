import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import {
  startOfDay,
  endOfDay,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns';
import { prisma } from '../config/prisma';
import { ListingType, ListingStatus, CategoryEnum, PaginationMeta } from '../models/common.dto';
import {
  ListingDetailResponse,
  CountdownSliderItem,
} from '../models/listing.dto';
import { CreateSubmissionDto, ResubmitListingDto, SubmissionResponseData } from '../models/submission.dto';
import { EmailService } from './email.service';
import { getCategoryLabel } from '../utils/categories';
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ValidationError,
} from '../utils/errors';

export interface ListingFilterParams {
  category?: CategoryEnum;
  city?: string;
  neighborhood?: string;
  type?: ListingType;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ListingService {
  /**
   * Helper to parse date presets (e.g. 'today', 'tomorrow', 'this-weekend', 'this-week', 'this-month')
   * or explicit ISO dates.
   */
  private static parseDateFilter(preset?: string, startDate?: string, endDate?: string) {
    const now = new Date();

    if (preset) {
      const lower = preset.toLowerCase();
      if (lower === 'today') {
        return { gte: startOfDay(now), lte: endOfDay(now) };
      }
      if (lower === 'tomorrow') {
        const tomorrow = addDays(now, 1);
        return { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) };
      }
      if (lower === 'this-weekend' || lower === 'weekend') {
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const friday = addDays(startOfWeek(now, { weekStartsOn: 1 }), 4);
        friday.setHours(17, 0, 0, 0);
        return { gte: friday, lte: weekEnd };
      }
      if (lower === 'this-week') {
        return { gte: startOfDay(now), lte: endOfWeek(now, { weekStartsOn: 1 }) };
      }
      if (lower === 'this-month') {
        return { gte: startOfDay(now), lte: endOfMonth(now) };
      }
      try {
        const parsed = parseISO(preset);
        if (!isNaN(parsed.getTime())) {
          return { gte: startOfDay(parsed), lte: endOfDay(parsed) };
        }
      } catch {
        // ignore invalid preset fallback
      }
    }

    if (startDate && endDate) {
      return { gte: startOfDay(parseISO(startDate)), lte: endOfDay(parseISO(endDate)) };
    }
    if (startDate) {
      return { gte: startOfDay(parseISO(startDate)) };
    }
    if (endDate) {
      return { lte: endOfDay(parseISO(endDate)) };
    }

    return undefined;
  }

  /**
   * Public Browse & Search (approved & published listings)
   */
  static async getPublicListings(params: ListingFilterParams): Promise<{ items: ListingDetailResponse[]; pagination: PaginationMeta }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      status: 'approved',
      isPublished: true,
    };

    if (params.category) {
      where.category = params.category;
    }

    if (params.city) {
      where.city = {
        contains: params.city,
        mode: 'insensitive',
      };
    }

    if (params.neighborhood) {
      where.neighborhood = {
        contains: params.neighborhood,
        mode: 'insensitive',
      };
    }

    if (params.type) {
      where.listingType = params.type;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { neighborhood: { contains: params.search, mode: 'insensitive' } },
        { address: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const dateFilter = this.parseDateFilter(params.date, params.startDate, params.endDate);
    if (dateFilter) {
      where.eventDetails = {
        startDateTime: dateFilter,
      };
    }

    const [total, items] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { featuredOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          eventDetails: true,
          restaurantDetails: true,
          facilityDetails: true,
        },
      }),
    ]);

    const formatted: ListingDetailResponse[] = items.map((item) => ({
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
      images: item.images,
      legalDocumentUrls: item.legalDocumentUrls,
      contactPhone: item.contactPhone,
      contactEmail: item.contactEmail,
      externalLink: item.externalLink,
      status: item.status as ListingStatus,
      isFeatured: item.isFeatured,
      featuredOrder: item.featuredOrder,
      isPublished: item.isPublished,
      eventDetails: item.eventDetails,
      restaurantDetails: item.restaurantDetails,
      facilityDetails: item.facilityDetails,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      items: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Public Single Listing Detail
   */
  static async getPublicListingById(id: string): Promise<ListingDetailResponse> {
    const item = await prisma.listing.findFirst({
      where: {
        id,
        status: 'approved',
        isPublished: true,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        eventDetails: true,
        restaurantDetails: true,
        facilityDetails: true,
      },
    });

    if (!item) {
      throw new NotFoundError(`Listing with ID ${id} was not found or is not currently active`);
    }

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
      images: item.images,
      legalDocumentUrls: item.legalDocumentUrls,
      contactPhone: item.contactPhone,
      contactEmail: item.contactEmail,
      externalLink: item.externalLink,
      status: item.status as ListingStatus,
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
   * Homepage Countdown Slider
   * Rule: Featured events first (sorted by featuredOrder ASC), then soonest upcoming non-featured events (by startDateTime ASC)
   */
  static async getUpcomingCountdownSlider(limit = 10, city?: string): Promise<CountdownSliderItem[]> {
    const now = new Date();

    const baseWhere: Prisma.ListingWhereInput = {
      listingType: 'event',
      status: 'approved',
      isPublished: true,
      eventDetails: {
        startDateTime: { gte: now },
      },
    };

    if (city) {
      baseWhere.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    // 1. Fetch featured upcoming events
    const featuredItems = await prisma.listing.findMany({
      where: {
        ...baseWhere,
        isFeatured: true,
      },
      take: limit,
      orderBy: [{ featuredOrder: 'asc' }, { eventDetails: { startDateTime: 'asc' } }],
      include: {
        eventDetails: true,
      },
    });

    const remainingSlots = Math.max(0, limit - featuredItems.length);

    // 2. Fetch automatic soonest upcoming non-featured events
    let automaticItems: typeof featuredItems = [];
    if (remainingSlots > 0) {
      const featuredIds = featuredItems.map((f) => f.id);
      automaticItems = await prisma.listing.findMany({
        where: {
          ...baseWhere,
          id: { notIn: featuredIds },
          isFeatured: false,
        },
        take: remainingSlots,
        orderBy: { eventDetails: { startDateTime: 'asc' } },
        include: {
          eventDetails: true,
        },
      });
    }

    const combined = [...featuredItems, ...automaticItems];

    return combined.map((item) => ({
      id: item.id,
      listingType: 'event' as const,
      title: item.title,
      thumbnailUrl: item.thumbnailUrl,
      city: item.city,
      neighborhood: item.neighborhood,
      category: item.category as CategoryEnum,
      categoryLabel: getCategoryLabel(item.category as CategoryEnum),
      isFeatured: item.isFeatured,
      featuredOrder: item.featuredOrder,
      startDateTime: item.eventDetails?.startDateTime || now,
      endDateTime: item.eventDetails?.endDateTime,
    }));
  }

  /**
   * Separated Type-Specific Detail Builders
   */
  private static buildEventDetailsCreate(dto: CreateSubmissionDto): Prisma.EventDetailsCreateNestedOneWithoutListingInput | undefined {
    if (dto.listingType !== 'event') return undefined;

    if (!dto.eventDetails?.startDateTime) {
      throw new BadRequestError('startDateTime is required for event listings');
    }

    return {
      create: {
        startDateTime: new Date(dto.eventDetails.startDateTime),
        endDateTime: dto.eventDetails.endDateTime ? new Date(dto.eventDetails.endDateTime) : null,
        isRecurring: dto.eventDetails.isRecurring || false,
      },
    };
  }

  private static buildRestaurantDetailsCreate(dto: CreateSubmissionDto): Prisma.RestaurantDetailsCreateNestedOneWithoutListingInput | undefined {
    if (dto.listingType !== 'restaurant') return undefined;

    if (!dto.restaurantDetails?.cuisineType?.trim()) {
      throw new BadRequestError('cuisineType is required for restaurant listings');
    }

    return {
      create: {
        cuisineType: dto.restaurantDetails.cuisineType.trim(),
        priceRange: dto.restaurantDetails.priceRange?.trim(),
        operatingHours: dto.restaurantDetails.operatingHours?.trim(),
        menuLink: dto.restaurantDetails.menuLink?.trim(),
        cacNumber: dto.restaurantDetails.cacNumber?.trim(),
        licenseNumber: dto.restaurantDetails.licenseNumber?.trim(),
      },
    };
  }

  private static buildFacilityDetailsCreate(dto: CreateSubmissionDto): Prisma.FacilityDetailsCreateNestedOneWithoutListingInput | undefined {
    if (dto.listingType !== 'facility') return undefined;

    if (!dto.facilityDetails?.facilityCategory?.trim()) {
      throw new BadRequestError('facilityCategory is required for facility listings');
    }

    return {
      create: {
        facilityCategory: dto.facilityDetails.facilityCategory.trim(),
        emergencyContact: dto.facilityDetails.emergencyContact?.trim(),
        operatingHours: dto.facilityDetails.operatingHours?.trim(),
        cacNumber: dto.facilityDetails.cacNumber?.trim(),
        licenseNumber: dto.facilityDetails.licenseNumber?.trim(),
      },
    };
  }

  /**
   * Public Listing Submission
   */
  static async createSubmission(dto: CreateSubmissionDto): Promise<SubmissionResponseData> {
    // Validate compulsory legal verification documents for restaurants and facilities
    if (
      (dto.listingType === 'restaurant' || dto.listingType === 'facility') &&
      (!dto.legalDocumentUrls || dto.legalDocumentUrls.length === 0)
    ) {
      throw new BadRequestError(
        `Legal verification document upload (e.g. CAC business registration, practice license) is compulsory for ${dto.listingType} listings.`
      );
    }

    const editToken = crypto.randomBytes(32).toString('hex');

    const created = await prisma.listing.create({
      data: {
        listingType: dto.listingType,
        title: dto.title.trim(),
        description: dto.description.trim(),
        category: dto.category,
        city: dto.city?.trim() || 'Abeokuta',
        neighborhood: dto.neighborhood.trim(),
        address: dto.address?.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        thumbnailUrl: dto.thumbnailUrl,
        legalDocumentUrls: dto.legalDocumentUrls || [],
        contactPhone: dto.contactPhone?.trim(),
        contactEmail: dto.contactEmail?.trim(),
        externalLink: dto.externalLink?.trim(),
        submitterName: dto.submitterName.trim(),
        submitterEmail: dto.submitterEmail.toLowerCase().trim(),
        submitterPhone: dto.submitterPhone.trim(),
        editToken,
        status: 'pending',
        images: dto.galleryImageUrls?.length
          ? {
              create: dto.galleryImageUrls.map((url, idx) => ({
                imageUrl: url,
                sortOrder: idx,
              })),
            }
          : undefined,
        eventDetails: this.buildEventDetailsCreate(dto),
        restaurantDetails: this.buildRestaurantDetailsCreate(dto),
        facilityDetails: this.buildFacilityDetailsCreate(dto),
      },
    });

    // Send confirmation email
    EmailService.sendSubmissionReceivedEmail(
      created.submitterEmail,
      created.submitterName,
      created.title
    ).catch((err) => console.error('Failed to send submission email:', err));

    return {
      id: created.id,
      title: created.title,
      listingType: created.listingType as ListingType,
      status: created.status,
      editToken: created.editToken || undefined,
    };
  }

  /**
   * Get Submission For Submitter Edit (requires editToken)
   */
  static async getSubmissionForEdit(id: string, editToken: string): Promise<ListingDetailResponse> {
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

    if (listing.editToken !== editToken) {
      throw new UnauthorizedError('Invalid or missing edit authorization token');
    }

    return {
      id: listing.id,
      listingType: listing.listingType as ListingType,
      title: listing.title,
      description: listing.description,
      category: listing.category as CategoryEnum,
      categoryLabel: getCategoryLabel(listing.category as CategoryEnum),
      city: listing.city,
      neighborhood: listing.neighborhood,
      address: listing.address,
      latitude: listing.latitude,
      longitude: listing.longitude,
      thumbnailUrl: listing.thumbnailUrl,
      images: listing.images,
      legalDocumentUrls: listing.legalDocumentUrls,
      contactPhone: listing.contactPhone,
      contactEmail: listing.contactEmail,
      externalLink: listing.externalLink,
      status: listing.status as ListingStatus,
      isFeatured: listing.isFeatured,
      featuredOrder: listing.featuredOrder,
      isPublished: listing.isPublished,
      eventDetails: listing.eventDetails,
      restaurantDetails: listing.restaurantDetails,
      facilityDetails: listing.facilityDetails,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }

  /**
   * Update & Resubmit Listing (needs_changes -> pending)
   */
  static async updateAndResubmit(id: string, editToken: string, dto: ResubmitListingDto): Promise<SubmissionResponseData> {
    const existing = await this.getSubmissionForEdit(id, editToken);

    if (existing.status !== 'needs_changes') {
      throw new ValidationError(`Listing is in '${existing.status}' status and cannot be edited via resubmission.`);
    }

    // Update gallery images if provided
    if (dto.galleryImageUrls) {
      await prisma.listingImage.deleteMany({ where: { listingId: id } });
      if (dto.galleryImageUrls.length > 0) {
        await prisma.listingImage.createMany({
          data: dto.galleryImageUrls.map((url, idx) => ({
            listingId: id,
            imageUrl: url,
            sortOrder: idx,
          })),
        });
      }
    }

    // Type-specific updates
    if (existing.listingType === 'event') {
      if (dto.eventDetails?.startDateTime) {
        await prisma.eventDetails.upsert({
          where: { listingId: id },
          create: {
            listingId: id,
            startDateTime: new Date(dto.eventDetails.startDateTime),
            endDateTime: dto.eventDetails.endDateTime ? new Date(dto.eventDetails.endDateTime) : null,
            isRecurring: dto.eventDetails.isRecurring || false,
          },
          update: {
            startDateTime: new Date(dto.eventDetails.startDateTime),
            endDateTime: dto.eventDetails.endDateTime ? new Date(dto.eventDetails.endDateTime) : null,
            isRecurring: dto.eventDetails.isRecurring || false,
          },
        });
      }
    } else if (existing.listingType === 'restaurant') {
      if (dto.restaurantDetails?.cuisineType) {
        await prisma.restaurantDetails.upsert({
          where: { listingId: id },
          create: {
            listingId: id,
            cuisineType: dto.restaurantDetails.cuisineType.trim(),
            priceRange: dto.restaurantDetails.priceRange?.trim(),
            operatingHours: dto.restaurantDetails.operatingHours?.trim(),
            menuLink: dto.restaurantDetails.menuLink?.trim(),
            cacNumber: dto.restaurantDetails.cacNumber?.trim(),
            licenseNumber: dto.restaurantDetails.licenseNumber?.trim(),
          },
          update: {
            cuisineType: dto.restaurantDetails.cuisineType.trim(),
            priceRange: dto.restaurantDetails.priceRange?.trim(),
            operatingHours: dto.restaurantDetails.operatingHours?.trim(),
            menuLink: dto.restaurantDetails.menuLink?.trim(),
            cacNumber: dto.restaurantDetails.cacNumber?.trim(),
            licenseNumber: dto.restaurantDetails.licenseNumber?.trim(),
          },
        });
      }
    } else if (existing.listingType === 'facility') {
      if (dto.facilityDetails?.facilityCategory) {
        await prisma.facilityDetails.upsert({
          where: { listingId: id },
          create: {
            listingId: id,
            facilityCategory: dto.facilityDetails.facilityCategory.trim(),
            emergencyContact: dto.facilityDetails.emergencyContact?.trim(),
            operatingHours: dto.facilityDetails.operatingHours?.trim(),
            cacNumber: dto.facilityDetails.cacNumber?.trim(),
            licenseNumber: dto.facilityDetails.licenseNumber?.trim(),
          },
          update: {
            facilityCategory: dto.facilityDetails.facilityCategory.trim(),
            emergencyContact: dto.facilityDetails.emergencyContact?.trim(),
            operatingHours: dto.facilityDetails.operatingHours?.trim(),
            cacNumber: dto.facilityDetails.cacNumber?.trim(),
            licenseNumber: dto.facilityDetails.licenseNumber?.trim(),
          },
        });
      }
    }

    // Update listing core fields and set status back to pending
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        description: dto.description !== undefined ? dto.description.trim() : undefined,
        category: dto.category !== undefined ? dto.category : undefined,
        city: dto.city !== undefined ? dto.city.trim() : undefined,
        neighborhood: dto.neighborhood !== undefined ? dto.neighborhood.trim() : undefined,
        address: dto.address !== undefined ? dto.address?.trim() : undefined,
        latitude: dto.latitude !== undefined ? dto.latitude : undefined,
        longitude: dto.longitude !== undefined ? dto.longitude : undefined,
        thumbnailUrl: dto.thumbnailUrl !== undefined ? dto.thumbnailUrl : undefined,
        legalDocumentUrls: dto.legalDocumentUrls !== undefined ? dto.legalDocumentUrls : undefined,
        contactPhone: dto.contactPhone !== undefined ? dto.contactPhone?.trim() : undefined,
        contactEmail: dto.contactEmail !== undefined ? dto.contactEmail?.trim() : undefined,
        externalLink: dto.externalLink !== undefined ? dto.externalLink?.trim() : undefined,
        submitterName: dto.submitterName !== undefined ? dto.submitterName.trim() : undefined,
        submitterPhone: dto.submitterPhone !== undefined ? dto.submitterPhone.trim() : undefined,
        status: 'pending',
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      listingType: updated.listingType as ListingType,
      status: updated.status,
    };
  }
}
