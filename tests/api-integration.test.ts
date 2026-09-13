import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';
import { AuthService } from '../src/services/auth.service';

// Mock prisma for integration tests
jest.mock('../src/config/prisma', () => ({
  prisma: {
    listing: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    adminUser: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

describe('API Integration End-to-End Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health & Root Endpoints', () => {
    it('GET /health should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('GET / should return 200 with API metadata', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('City Discovery Platform API');
      expect(res.body.documentation).toBe('/docs');
    });
  });

  describe('Public Categories Endpoint', () => {
    it('GET /api/v1/categories should return active category taxonomy', async () => {
      (prisma.listing.groupBy as jest.Mock).mockResolvedValue([
        { category: 'music', _count: { id: 3 } },
        { category: 'food_drink', _count: { id: 7 } },
      ]);

      const res = await request(app).get('/api/v1/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(10); // 10 official Enum categories

      const musicCat = res.body.data.find((c: any) => c.slug === 'music');
      expect(musicCat).toBeDefined();
      expect(musicCat.name).toBe('Music & Concerts');
      expect(musicCat.listingCount).toBe(3);
    });
  });

  describe('Media Upload Signature Endpoint', () => {
    it('GET /api/v1/media/upload-signature?type=thumbnail should return signed credentials', async () => {
      const res = await request(app).get('/api/v1/media/upload-signature?type=thumbnail');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.signature).toBeDefined();
      expect(res.body.data.timestamp).toBeGreaterThan(0);
      expect(res.body.data.folder).toContain('thumbnails');
      expect(res.body.data.uploadUrl).toBeDefined();
    });
  });

  describe('Public Cities Endpoint', () => {
    it('GET /api/v1/cities should return supported cities with Abeokuta active', async () => {
      (prisma.listing.groupBy as jest.Mock).mockResolvedValue([
        { city: 'Abeokuta', _count: { id: 18 } },
      ]);

      const res = await request(app).get('/api/v1/cities');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const abeokuta = res.body.data.find((c: any) => c.name === 'Abeokuta');
      expect(abeokuta).toBeDefined();
      expect(abeokuta.isActive).toBe(true);
      expect(abeokuta.listingCount).toBe(18);

      const lagos = res.body.data.find((c: any) => c.name === 'Lagos');
      expect(lagos).toBeDefined();
      expect(lagos.isActive).toBe(false);
    });
  });

  describe('Public Submissions Endpoint', () => {
    it('POST /api/v1/submissions should validate required fields', async () => {
      // Missing title, category, submitter info
      const res = await request(app)
        .post('/api/v1/submissions')
        .send({
          listingType: 'event',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/v1/submissions should reject restaurant submission without legalDocumentUrls', async () => {
      const res = await request(app)
        .post('/api/v1/submissions')
        .send({
          listingType: 'restaurant',
          title: 'Gourmet Bistro',
          description: 'Finest cuisine in town.',
          category: 'food_drink',
          neighborhood: 'Ibara',
          thumbnailUrl: 'https://cloudinary.com/sample.jpg',
          submitterName: 'Chef Owner',
          submitterEmail: 'chef@yopmail.com',
          submitterPhone: '+2348011223344',
          restaurantDetails: {
            cuisineType: 'Continental',
          },
          // missing legalDocumentUrls
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Legal verification document upload');
    });

    it('POST /api/v1/submissions should create pending submission successfully', async () => {
      const submissionUuid = 'd3b07384-d113-4629-9e8a-2c8e31a0e6e9';
      (prisma.listing.create as jest.Mock).mockResolvedValue({
        id: submissionUuid,
        title: 'Tech Meetup',
        listingType: 'event',
        status: 'pending',
        submitterEmail: 'tech@example.com',
        submitterName: 'Developer',
        editToken: 'token-abc',
      });

      const res = await request(app)
        .post('/api/v1/submissions')
        .send({
          listingType: 'event',
          title: 'Tech Meetup',
          description: 'A gathering of software engineers.',
          category: 'education',
          neighborhood: 'Downtown',
          thumbnailUrl: 'https://cloudinary.com/sample.jpg',
          submitterName: 'Developer',
          submitterEmail: 'tech@example.com',
          submitterPhone: '+1234567890',
          eventDetails: {
            startDateTime: new Date('2026-10-01T18:00:00Z').toISOString(),
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(submissionUuid);
      expect(res.body.data.status).toBe('pending');
    });
  });

  describe('Admin Authentication & Protected Routes', () => {
    it('GET /api/v1/admin/listings should reject requests without JWT token', async () => {
      const res = await request(app).get('/api/v1/admin/listings');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/admin/listings should allow requests with valid JWT token', async () => {
      const validToken = AuthService.generateToken({
        userId: 'admin-uuid-1',
        email: 'okeolamide.o@gmail.com',
        role: 'super_admin',
      });

      (prisma.listing.count as jest.Mock).mockResolvedValue(1);
      (prisma.listing.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'a0000000-0000-4000-a000-000000000001',
          title: 'Live Concert',
          description: 'Great music',
          category: 'music',
          neighborhood: 'Midtown',
          thumbnailUrl: 'https://img.com/thumb.jpg',
          submitterName: 'Jane',
          submitterEmail: 'jane@example.com',
          submitterPhone: '123',
          status: 'pending',
          isFeatured: false,
          featuredOrder: 0,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          images: [],
          eventDetails: null,
          restaurantDetails: null,
          facilityDetails: null,
        },
      ]);

      const res = await request(app)
        .get('/api/v1/admin/listings')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });
});
