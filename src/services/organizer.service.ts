import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { AuthService } from './auth.service';

export interface OrganizerEventSummary {
  id: string;
  title: string;
  status: string;
  thumbnailUrl: string;
  city: string;
  neighborhood: string;
  startDateTime: string | null;
  totalRevenue: number;
  platformFee: number;
  organizerPayout: number;
  totalOrders: number;
  totalTicketsSold: number;
}

export interface OrganizerTierStats {
  id: string;
  name: string;
  price: number;
  totalCapacity: number;
  soldCount: number;
  remaining: number;
  revenue: number;
}

export interface OrganizerEventAnalytics {
  listing: any;
  revenue: {
    gross: number;
    platformFee: number;
    organizerPayout: number;
    totalOrders: number;
  };
  attendance: {
    totalTicketsIssued: number;
    checkedIn: number;
    checkInRate: number;
  };
  tiers: OrganizerTierStats[];
  salesByDay: { date: string; orders: number; revenue: number }[];
}

export interface OrganizerOrderItem {
  tierName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrganizerOrder {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  commission: number;
  organizerAmount: number;
  status: string;
  paidAt: string | null;
  items: OrganizerOrderItem[];
}

export interface OrganizerAttendee {
  ticketCode: string;
  tierName: string;
  attendeeName: string | null;
  attendeeEmail: string | null;
  attendeePhone: string | null;
  isUsed: boolean;
  checkedInAt: string | null;
}

export class OrganizerService {
  // ─── Auth ────────────────────────────────────────────────────────────────────

  static async requestMagicLink(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check this email has at least one listing
    const listing = await prisma.listing.findFirst({
      where: { submitterEmail: normalizedEmail },
    });
    if (!listing) {
      // Return silently to avoid email enumeration
      return;
    }

    // Invalidate existing unused tokens for this email
    await prisma.organizerMagicToken.updateMany({
      where: { email: normalizedEmail, usedAt: null },
      data: { usedAt: new Date() }, // mark as used (invalidated)
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.organizerMagicToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    // Import email service and send
    const { EmailService } = await import('./email.service');
    await EmailService.sendOrganizerMagicLinkEmail(normalizedEmail, token);
  }

  static async verifyMagicLink(token: string): Promise<{ token: string; organizerEmail: string }> {
    const record = await prisma.organizerMagicToken.findUnique({ where: { token } });

    if (!record || record.usedAt !== null) {
      throw new BadRequestError('This magic link is invalid or has already been used.');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestError('This magic link has expired. Please request a new one.');
    }

    // Mark token as used
    await prisma.organizerMagicToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    const jwt = AuthService.generateOrganizerToken(record.email);
    return { token: jwt, organizerEmail: record.email };
  }

  // ─── Events ───────────────────────────────────────────────────────────────────

  static async getEvents(organizerEmail: string): Promise<OrganizerEventSummary[]> {
    const listings = await prisma.listing.findMany({
      where: { submitterEmail: organizerEmail },
      include: {
        eventDetails: true,
        ticketOrders: {
          where: { status: 'PAID' },
          select: { totalAmount: true, commission: true, organizerAmount: true },
        },
        ticketTiers: { select: { soldCount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return listings.map((l) => {
      const totalRevenue = l.ticketOrders.reduce((s, o) => s + o.totalAmount, 0);
      const platformFee = l.ticketOrders.reduce((s, o) => s + o.commission, 0);
      const organizerPayout = l.ticketOrders.reduce((s, o) => s + o.organizerAmount, 0);
      const totalTicketsSold = l.ticketTiers.reduce((s, t) => s + t.soldCount, 0);

      return {
        id: l.id,
        title: l.title,
        status: l.status,
        thumbnailUrl: l.thumbnailUrl,
        city: l.city,
        neighborhood: l.neighborhood,
        startDateTime: l.eventDetails?.startDateTime?.toISOString() ?? null,
        totalRevenue,
        platformFee,
        organizerPayout,
        totalOrders: l.ticketOrders.length,
        totalTicketsSold,
      };
    });
  }

  static async getEventAnalytics(listingId: string, organizerEmail: string): Promise<OrganizerEventAnalytics> {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        eventDetails: true,
        ticketTiers: true,
        images: { orderBy: { sortOrder: 'asc' } },
        ticketOrders: {
          where: { status: 'PAID' },
          select: { totalAmount: true, commission: true, organizerAmount: true, paidAt: true },
        },
      },
    });

    if (!listing) throw new NotFoundError('Listing not found');
    if (listing.submitterEmail !== organizerEmail) throw new ForbiddenError('Access denied');

    const paidOrders = listing.ticketOrders;
    const gross = paidOrders.reduce((s, o) => s + o.totalAmount, 0);
    const platformFee = paidOrders.reduce((s, o) => s + o.commission, 0);
    const organizerPayout = paidOrders.reduce((s, o) => s + o.organizerAmount, 0);

    // Ticket issuance and check-in
    const tickets = await prisma.ticket.findMany({
      where: { order: { listingId } },
      select: { isUsed: true },
    });
    const totalTicketsIssued = tickets.length;
    const checkedIn = tickets.filter((t) => t.isUsed).length;
    const checkInRate = totalTicketsIssued > 0 ? Math.round((checkedIn / totalTicketsIssued) * 100) : 0;

    // Tier stats
    const tiers: OrganizerTierStats[] = listing.ticketTiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      totalCapacity: t.totalCapacity,
      soldCount: t.soldCount,
      remaining: t.totalCapacity - t.soldCount,
      revenue: t.soldCount * t.price,
    }));

    // Sales by day
    const dayMap = new Map<string, { orders: number; revenue: number }>();
    for (const o of paidOrders) {
      if (!o.paidAt) continue;
      const day = o.paidAt.toISOString().split('T')[0];
      const existing = dayMap.get(day) ?? { orders: 0, revenue: 0 };
      dayMap.set(day, { orders: existing.orders + 1, revenue: existing.revenue + o.totalAmount });
    }
    const salesByDay = Array.from(dayMap.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Build safe listing response (omit sensitive admin fields)
    const safeListing = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      status: listing.status,
      listingType: listing.listingType,
      thumbnailUrl: listing.thumbnailUrl,
      images: listing.images,
      city: listing.city,
      neighborhood: listing.neighborhood,
      address: listing.address,
      contactPhone: listing.contactPhone,
      contactEmail: listing.contactEmail,
      externalLink: listing.externalLink,
      rejectionReason: listing.rejectionReason,
      adminNotes: listing.adminNotes,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      eventDetails: listing.eventDetails
        ? {
            startDateTime: listing.eventDetails.startDateTime,
            endDateTime: listing.eventDetails.endDateTime,
            isRecurring: listing.eventDetails.isRecurring,
          }
        : null,
      ticketTiers: listing.ticketTiers.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        price: t.price,
        totalCapacity: t.totalCapacity,
        soldCount: t.soldCount,
        isSoldOut: t.soldCount >= t.totalCapacity,
      })),
    };

    return {
      listing: safeListing,
      revenue: { gross, platformFee, organizerPayout, totalOrders: paidOrders.length },
      attendance: { totalTicketsIssued, checkedIn, checkInRate },
      tiers,
      salesByDay,
    };
  }

  static async getOrders(
    listingId: string,
    organizerEmail: string,
    page = 1,
    limit = 20
  ): Promise<{ data: OrganizerOrder[]; pagination: any }> {
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { submitterEmail: true } });
    if (!listing) throw new NotFoundError('Listing not found');
    if (listing.submitterEmail !== organizerEmail) throw new ForbiddenError('Access denied');

    const skip = (page - 1) * limit;
    const [total, orders] = await Promise.all([
      prisma.ticketOrder.count({ where: { listingId, status: 'PAID' } }),
      prisma.ticketOrder.findMany({
        where: { listingId, status: 'PAID' },
        include: {
          items: { include: { tier: { select: { name: true } } } },
        },
        orderBy: { paidAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const data: OrganizerOrder[] = orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      totalAmount: o.totalAmount,
      commission: o.commission,
      organizerAmount: o.organizerAmount,
      status: o.status,
      paidAt: o.paidAt?.toISOString() ?? null,
      items: o.items.map((i) => ({
        tierName: i.tier.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
      })),
    }));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getAttendees(listingId: string, organizerEmail: string): Promise<OrganizerAttendee[]> {
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { submitterEmail: true } });
    if (!listing) throw new NotFoundError('Listing not found');
    if (listing.submitterEmail !== organizerEmail) throw new ForbiddenError('Access denied');

    const tickets = await prisma.ticket.findMany({
      where: { order: { listingId } },
      include: { tier: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return tickets.map((t) => ({
      ticketCode: t.ticketCode,
      tierName: t.tier.name,
      attendeeName: t.attendeeName,
      attendeeEmail: t.attendeeEmail,
      attendeePhone: t.attendeePhone,
      isUsed: t.isUsed,
      checkedInAt: t.checkedInAt?.toISOString() ?? null,
    }));
  }

  // ─── Settings ─────────────────────────────────────────────────────────────────

  static async getSettings(email: string): Promise<{ notificationPreference: string }> {
    const settings = await prisma.organizerSettings.findUnique({ where: { email } });
    return { notificationPreference: settings?.notificationPreference ?? 'per_sale' };
  }

  static async updateSettings(
    email: string,
    notificationPreference: string
  ): Promise<{ notificationPreference: string }> {
    const valid = ['per_sale', 'daily_digest', 'weekly_digest'];
    if (!valid.includes(notificationPreference)) {
      throw new BadRequestError('Invalid notificationPreference. Must be per_sale, daily_digest, or weekly_digest');
    }

    const settings = await prisma.organizerSettings.upsert({
      where: { email },
      update: { notificationPreference },
      create: { email, notificationPreference },
    });
    return { notificationPreference: settings.notificationPreference };
  }

  // ─── Edit Listing ─────────────────────────────────────────────────────────────

  static async updateListing(
    listingId: string,
    organizerEmail: string,
    payload: Record<string, any>
  ): Promise<{ success: boolean; message: string; requiresReview: boolean }> {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { submitterEmail: true, status: true },
    });
    if (!listing) throw new NotFoundError('Listing not found');
    if (listing.submitterEmail !== organizerEmail) throw new ForbiddenError('Access denied');

    const SAFE_FIELDS_FOR_APPROVED = new Set([
      'description', 'thumbnailUrl', 'galleryImageUrls', 'contactPhone', 'contactEmail', 'externalLink',
    ]);

    const MAJOR_FIELDS = new Set([
      'title', 'startDateTime', 'endDateTime', 'address', 'city', 'neighborhood', 'latitude', 'longitude',
      'ticketTiers',
    ]);

    let requiresReview = false;

    if (listing.status === 'approved') {
      // Check if any major fields are being changed
      const changedKeys = Object.keys(payload);
      const hasMajorChange = changedKeys.some((k) => MAJOR_FIELDS.has(k));
      const hasIllegalChange = changedKeys.some((k) => !SAFE_FIELDS_FOR_APPROVED.has(k) && !MAJOR_FIELDS.has(k));

      if (hasIllegalChange) {
        throw new ForbiddenError('Some fields cannot be changed on an approved listing.');
      }

      if (hasMajorChange) {
        requiresReview = true;
      }

      // Filter to only safe fields for approved listings (unless major change triggers re-review)
      const allowedKeys = requiresReview
        ? [...SAFE_FIELDS_FOR_APPROVED, ...MAJOR_FIELDS]
        : [...SAFE_FIELDS_FOR_APPROVED];
      const filteredPayload: Record<string, any> = {};
      for (const key of changedKeys) {
        if (allowedKeys.some((k) => k === key)) {
          filteredPayload[key] = payload[key];
        }
      }
      payload = filteredPayload;
    }

    // Build the Prisma update data
    const updateData: any = {};
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.thumbnailUrl !== undefined) updateData.thumbnailUrl = payload.thumbnailUrl;
    if (payload.galleryImageUrls !== undefined) {
      // Replace gallery images
      updateData.images = {
        deleteMany: {},
        create: (payload.galleryImageUrls as string[]).map((url: string, i: number) => ({
          imageUrl: url,
          sortOrder: i,
        })),
      };
    }
    if (payload.contactPhone !== undefined) updateData.contactPhone = payload.contactPhone;
    if (payload.contactEmail !== undefined) updateData.contactEmail = payload.contactEmail;
    if (payload.externalLink !== undefined) updateData.externalLink = payload.externalLink;
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.address !== undefined) updateData.address = payload.address;
    if (payload.city !== undefined) updateData.city = payload.city;
    if (payload.neighborhood !== undefined) updateData.neighborhood = payload.neighborhood;
    if (payload.latitude !== undefined) updateData.latitude = payload.latitude;
    if (payload.longitude !== undefined) updateData.longitude = payload.longitude;

    // If status is pending or rejected — full edit, reset to pending
    if (listing.status === 'pending' || listing.status === 'rejected') {
      updateData.status = 'pending';
      updateData.rejectionReason = null;
    }

    // If approved + major change, set back to pending
    if (listing.status === 'approved' && requiresReview) {
      updateData.status = 'pending';
    }

    // Handle eventDetails sub-fields
    const eventUpdate: any = {};
    if (payload.startDateTime !== undefined) eventUpdate.startDateTime = new Date(payload.startDateTime);
    if (payload.endDateTime !== undefined) eventUpdate.endDateTime = payload.endDateTime ? new Date(payload.endDateTime) : null;
    if (Object.keys(eventUpdate).length > 0) {
      updateData.eventDetails = { update: eventUpdate };
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    const message =
      requiresReview
        ? 'Your changes have been submitted for admin review. The listing stays live while under review.'
        : listing.status === 'rejected'
        ? 'Your listing has been updated and re-submitted for review.'
        : 'Changes saved successfully.';

    return { success: true, message, requiresReview };
  }
}
