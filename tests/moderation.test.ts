import { ModerationService } from '../src/services/moderation.service';
import { AdminService } from '../src/services/admin.service';
import { EmailService } from '../src/services/email.service';
import { prisma } from '../src/config/prisma';
import { InvalidStateTransitionError, BadRequestError, UnauthorizedError } from '../src/utils/errors';

// Mock prisma
jest.mock('../src/config/prisma', () => ({
  prisma: {
    listing: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    eventDetails: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock EmailService
jest.mock('../src/services/email.service', () => ({
  EmailService: {
    sendListingApprovedEmail: jest.fn().mockResolvedValue(true),
    sendListingRejectedEmail: jest.fn().mockResolvedValue(true),
    sendChangesRequestedEmail: jest.fn().mockResolvedValue(true),
    sendGatePinUpdatedEmail: jest.fn().mockResolvedValue(true),
  },
}));

describe('Moderation State Machine Transitions', () => {
  const testId1 = 'a0000000-0000-4000-a000-000000000001';
  const testId2 = 'a0000000-0000-4000-a000-000000000002';
  const testId3 = 'a0000000-0000-4000-a000-000000000003';
  const testId4 = 'a0000000-0000-4000-a000-000000000004';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Approve Transition (pending -> approved)', () => {
    it('should successfully approve a pending listing', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId1,
        title: 'Jazz Night',
        status: 'pending',
        submitterEmail: 'user@example.com',
        submitterName: 'John',
      });

      (prisma.listing.update as jest.Mock).mockResolvedValue({
        id: testId1,
        title: 'Jazz Night',
        status: 'approved',
        isPublished: true,
        rejectionReason: null,
        submitterEmail: 'user@example.com',
        submitterName: 'John',
      });

      const result = await ModerationService.approveListing(testId1);

      expect(result.status).toBe('approved');
      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: testId1 },
        data: {
          status: 'approved',
          rejectionReason: null,
          isPublished: true,
        },
      });
    });

    it('should throw InvalidStateTransitionError if listing is already approved', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId1,
        status: 'approved',
      });

      await expect(ModerationService.approveListing(testId1)).rejects.toThrow(
        InvalidStateTransitionError
      );
    });

    it('should throw InvalidStateTransitionError if listing is rejected', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId1,
        status: 'rejected',
      });

      await expect(ModerationService.approveListing(testId1)).rejects.toThrow(
        InvalidStateTransitionError
      );
    });

    it('should preserve existing saved 6-digit gate PIN when approving an event listing', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId1,
        title: 'Tech Fest',
        status: 'pending',
        listingType: 'event',
        submitterEmail: 'organizer@example.com',
        submitterName: 'Jane Organizer',
        eventDetails: {
          checkInPin: '482910',
        },
      });

      (prisma.listing.update as jest.Mock).mockResolvedValue({
        id: testId1,
        title: 'Tech Fest',
        status: 'approved',
        isPublished: true,
        rejectionReason: null,
        submitterEmail: 'organizer@example.com',
        submitterName: 'Jane Organizer',
        listingType: 'event',
      });

      const result = await ModerationService.approveListing(testId1);

      expect(result.status).toBe('approved');
      // Should NOT overwrite the existing PIN
      expect(prisma.eventDetails.update).not.toHaveBeenCalled();
      // Email should include the existing saved gate PIN
      expect(EmailService.sendListingApprovedEmail).toHaveBeenCalledWith(
        'organizer@example.com',
        'Jane Organizer',
        'Tech Fest',
        testId1,
        'event',
        '482910'
      );
    });

    it('should generate a fresh 6-digit gate PIN when approving an event listing with no saved PIN', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId1,
        title: 'New Concert',
        status: 'pending',
        listingType: 'event',
        submitterEmail: 'concert@example.com',
        submitterName: 'Dave Concert',
        eventDetails: {
          checkInPin: null,
        },
      });

      (prisma.listing.update as jest.Mock).mockResolvedValue({
        id: testId1,
        title: 'New Concert',
        status: 'approved',
        isPublished: true,
        rejectionReason: null,
        submitterEmail: 'concert@example.com',
        submitterName: 'Dave Concert',
        listingType: 'event',
      });

      await ModerationService.approveListing(testId1);

      // Should save a newly generated 6-digit PIN
      expect(prisma.eventDetails.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { listingId: testId1 },
          data: expect.objectContaining({
            checkInPin: expect.stringMatching(/^\d{6}$/),
          }),
        })
      );
      expect(EmailService.sendListingApprovedEmail).toHaveBeenCalledWith(
        'concert@example.com',
        'Dave Concert',
        'New Concert',
        testId1,
        'event',
        expect.stringMatching(/^\d{6}$/)
      );
    });
  });

  describe('Reject Transition (pending -> rejected)', () => {
    it('should reject a pending listing with valid rejection reason', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId2,
        title: 'Incomplete Listing',
        status: 'pending',
        submitterEmail: 'user@example.com',
        submitterName: 'Alice',
      });

      (prisma.listing.update as jest.Mock).mockResolvedValue({
        id: testId2,
        title: 'Incomplete Listing',
        status: 'rejected',
        rejectionReason: 'Blurry thumbnail image',
        isPublished: false,
        submitterEmail: 'user@example.com',
        submitterName: 'Alice',
      });

      const result = await ModerationService.rejectListing(testId2, 'Blurry thumbnail image');

      expect(result.status).toBe('rejected');
      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: testId2 },
        data: {
          status: 'rejected',
          rejectionReason: 'Blurry thumbnail image',
          isPublished: false,
        },
      });
    });

    it('should throw BadRequestError if rejection reason is empty', async () => {
      await expect(ModerationService.rejectListing(testId2, '')).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('Request Changes Transition (pending -> needs_changes)', () => {
    it('should transition to needs_changes with admin notes and editToken link', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId3,
        title: 'Tech Meetup',
        status: 'pending',
        editToken: 'secure-token-123',
        submitterEmail: 'organizer@example.com',
        submitterName: 'Bob',
      });

      (prisma.listing.update as jest.Mock).mockResolvedValue({
        id: testId3,
        title: 'Tech Meetup',
        status: 'needs_changes',
        adminNotes: 'Please specify the exact hall/room number in the address.',
        editToken: 'secure-token-123',
        submitterEmail: 'organizer@example.com',
        submitterName: 'Bob',
      });

      const result = await ModerationService.requestChanges(
        testId3,
        'Please specify the exact hall/room number in the address.'
      );

      expect(result.status).toBe('needs_changes');
      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: testId3 },
        data: {
          status: 'needs_changes',
          adminNotes: 'Please specify the exact hall/room number in the address.',
        },
      });
    });

    it('should throw BadRequestError if adminNotes are missing', async () => {
      await expect(ModerationService.requestChanges(testId3, '  ')).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('Resubmit Transition (needs_changes -> pending)', () => {
    it('should allow resubmission with valid editToken', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId4,
        status: 'needs_changes',
        editToken: 'valid-token-xyz',
      });

      (prisma.listing.update as jest.Mock).mockResolvedValue({
        id: testId4,
        status: 'pending',
      });

      const result = await ModerationService.resubmitListing(testId4, 'valid-token-xyz');
      expect(result.status).toBe('pending');
    });

    it('should block resubmission with invalid editToken', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: testId4,
        status: 'needs_changes',
        editToken: 'valid-token-xyz',
      });

      await expect(ModerationService.resubmitListing(testId4, 'wrong-token')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('Gate PIN Regeneration & Admin Commission Updates', () => {
    const eventListingId = 'b0000000-0000-4000-a000-000000000001';

    it('should automatically email submitter when gate PIN is regenerated and saved', async () => {
      (prisma.eventDetails.findUnique as jest.Mock).mockResolvedValue({
        listingId: eventListingId,
        checkInPin: '111111',
        commissionType: 'PERCENTAGE',
        commissionValue: 10,
        subaccountCode: null,
        listing: {
          id: eventListingId,
          title: 'Afrobeat Festival',
          submitterEmail: 'afro@example.com',
          submitterName: 'Femi Kuti',
        },
      });

      (prisma.eventDetails.update as jest.Mock).mockResolvedValue({
        listingId: eventListingId,
        checkInPin: '999888',
        commissionType: 'PERCENTAGE',
        commissionValue: 10,
        subaccountCode: null,
      });

      await AdminService.updateEventCommission(eventListingId, {
        commissionType: 'PERCENTAGE',
        commissionValue: 10,
        checkInPin: '999888',
      });

      expect(prisma.eventDetails.update).toHaveBeenCalledWith({
        where: { listingId: eventListingId },
        data: expect.objectContaining({
          checkInPin: '999888',
        }),
      });

      expect(EmailService.sendGatePinUpdatedEmail).toHaveBeenCalledWith(
        'afro@example.com',
        'Femi Kuti',
        'Afrobeat Festival',
        eventListingId,
        '999888'
      );
    });

    it('should not email submitter if gate PIN was not changed', async () => {
      (prisma.eventDetails.findUnique as jest.Mock).mockResolvedValue({
        listingId: eventListingId,
        checkInPin: '999888',
        commissionType: 'PERCENTAGE',
        commissionValue: 10,
        subaccountCode: null,
        listing: {
          id: eventListingId,
          title: 'Afrobeat Festival',
          submitterEmail: 'afro@example.com',
          submitterName: 'Femi Kuti',
        },
      });

      (prisma.eventDetails.update as jest.Mock).mockResolvedValue({
        listingId: eventListingId,
        checkInPin: '999888',
        commissionType: 'PERCENTAGE',
        commissionValue: 15,
        subaccountCode: null,
      });

      await AdminService.updateEventCommission(eventListingId, {
        commissionType: 'PERCENTAGE',
        commissionValue: 15,
        checkInPin: '999888', // same PIN
      });

      expect(EmailService.sendGatePinUpdatedEmail).not.toHaveBeenCalled();
    });
  });
});
