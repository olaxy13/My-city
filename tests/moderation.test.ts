import { ModerationService } from '../src/services/moderation.service';
import { prisma } from '../src/config/prisma';
import { InvalidStateTransitionError, BadRequestError, UnauthorizedError } from '../src/utils/errors';

// Mock prisma
jest.mock('../src/config/prisma', () => ({
  prisma: {
    listing: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock EmailService
jest.mock('../src/services/email.service', () => ({
  EmailService: {
    sendListingApprovedEmail: jest.fn().mockResolvedValue(true),
    sendListingRejectedEmail: jest.fn().mockResolvedValue(true),
    sendChangesRequestedEmail: jest.fn().mockResolvedValue(true),
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
});
