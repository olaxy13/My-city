import { prisma } from '../config/prisma';
import { EmailService } from './email.service';
import { ModerationActionResponse } from '../models/admin.dto';
import { ListingStatus } from '../models/common.dto';
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  InvalidStateTransitionError,
} from '../utils/errors';

export class ModerationService {
  /**
   * Approve a pending listing (pending -> approved)
   */
  static async approveListing(listingId: string): Promise<ModerationActionResponse> {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError(`Listing with ID ${listingId} was not found`);
    }

    if (listing.status !== 'pending') {
      throw new InvalidStateTransitionError(
        `Cannot approve listing in status '${listing.status}'. Only 'pending' listings can be approved.`
      );
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'approved',
        rejectionReason: null,
        isPublished: true,
      },
    });

    // Fire async notification email
    EmailService.sendListingApprovedEmail(
      updated.submitterEmail,
      updated.submitterName,
      updated.title,
      updated.id
    ).catch((err) => console.error('Failed to send approval email:', err));

    return {
      id: updated.id,
      title: updated.title,
      status: updated.status as ListingStatus,
      isPublished: updated.isPublished,
      rejectionReason: updated.rejectionReason,
      adminNotes: updated.adminNotes,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Reject a pending listing with a mandatory reason (pending -> rejected)
   */
  static async rejectListing(listingId: string, rejectionReason: string): Promise<ModerationActionResponse> {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new BadRequestError('Rejection reason is required');
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError(`Listing with ID ${listingId} was not found`);
    }

    if (listing.status !== 'pending') {
      throw new InvalidStateTransitionError(
        `Cannot reject listing in status '${listing.status}'. Only 'pending' listings can be rejected.`
      );
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        isPublished: false,
      },
    });

    // Fire async rejection email
    EmailService.sendListingRejectedEmail(
      updated.submitterEmail,
      updated.submitterName,
      updated.title,
      updated.rejectionReason!
    ).catch((err) => console.error('Failed to send rejection email:', err));

    return {
      id: updated.id,
      title: updated.title,
      status: updated.status as ListingStatus,
      isPublished: updated.isPublished,
      rejectionReason: updated.rejectionReason,
      adminNotes: updated.adminNotes,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Request changes on a pending listing with admin feedback notes (pending -> needs_changes)
   */
  static async requestChanges(listingId: string, adminNotes: string): Promise<ModerationActionResponse> {
    if (!adminNotes || !adminNotes.trim()) {
      throw new BadRequestError('Admin feedback notes explaining requested changes are required');
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError(`Listing with ID ${listingId} was not found`);
    }

    if (listing.status !== 'pending') {
      throw new InvalidStateTransitionError(
        `Cannot request changes for listing in status '${listing.status}'. Only 'pending' listings can receive changes requested.`
      );
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'needs_changes',
        adminNotes: adminNotes.trim(),
      },
    });

    // Fire async feedback email with secure editToken link
    EmailService.sendChangesRequestedEmail(
      updated.submitterEmail,
      updated.submitterName,
      updated.title,
      updated.adminNotes!,
      updated.id,
      updated.editToken || ''
    ).catch((err) => console.error('Failed to send changes requested email:', err));

    return {
      id: updated.id,
      title: updated.title,
      status: updated.status as ListingStatus,
      isPublished: updated.isPublished,
      rejectionReason: updated.rejectionReason,
      adminNotes: updated.adminNotes,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Resubmit a listing in 'needs_changes' status back to 'pending'
   */
  static async resubmitListing(listingId: string, editToken: string): Promise<ModerationActionResponse> {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundError(`Listing with ID ${listingId} was not found`);
    }

    if (listing.status !== 'needs_changes') {
      throw new InvalidStateTransitionError(
        `Cannot resubmit listing in status '${listing.status}'. Only 'needs_changes' listings can be resubmitted.`
      );
    }

    if (!listing.editToken || listing.editToken !== editToken) {
      throw new UnauthorizedError('Invalid or missing edit authorization token');
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'pending',
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      status: updated.status as ListingStatus,
      isPublished: updated.isPublished,
      rejectionReason: updated.rejectionReason,
      adminNotes: updated.adminNotes,
      updatedAt: updated.updatedAt,
    };
  }
}
