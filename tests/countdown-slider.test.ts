import { ListingService } from '../src/services/listing.service';
import { prisma } from '../src/config/prisma';

// Mock prisma
jest.mock('../src/config/prisma', () => ({
  prisma: {
    listing: {
      findMany: jest.fn(),
    },
  },
}));

describe('Countdown Slider (Scenario B Ordering & CategoryEnum)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return featured events ordered by featuredOrder ASC first, then fill with soonest upcoming', async () => {
    const featuredEvents = [
      {
        id: '11111111-1111-4111-a111-111111111111',
        listingType: 'event',
        title: 'Headline Music Festival',
        thumbnailUrl: 'https://img.com/fest.jpg',
        neighborhood: 'Downtown',
        category: 'music',
        isFeatured: true,
        featuredOrder: 1,
        eventDetails: {
          startDateTime: new Date('2026-09-15T18:00:00Z'),
          endDateTime: null,
        },
      },
      {
        id: '22222222-2222-4222-a222-222222222222',
        listingType: 'event',
        title: 'VIP Rooftop Mixer',
        thumbnailUrl: 'https://img.com/mixer.jpg',
        neighborhood: 'Uptown',
        category: 'nightlife',
        isFeatured: true,
        featuredOrder: 2,
        eventDetails: {
          startDateTime: new Date('2026-09-10T20:00:00Z'),
          endDateTime: null,
        },
      },
    ];

    const upcomingEvents = [
      {
        id: '33333333-3333-4333-a333-333333333333',
        listingType: 'event',
        title: 'Morning Yoga in the Park',
        thumbnailUrl: 'https://img.com/yoga.jpg',
        neighborhood: 'Green Park',
        category: 'wellness',
        isFeatured: false,
        featuredOrder: 0,
        eventDetails: {
          startDateTime: new Date('2026-09-07T08:00:00Z'),
          endDateTime: null,
        },
      },
    ];

    (prisma.listing.findMany as jest.Mock)
      .mockResolvedValueOnce(featuredEvents)
      .mockResolvedValueOnce(upcomingEvents);

    const result = await ListingService.getUpcomingCountdownSlider(10);

    expect(result).toHaveLength(3);
    // 1st item: Featured rank 1
    expect(result[0].id).toBe('11111111-1111-4111-a111-111111111111');
    expect(result[0].isFeatured).toBe(true);
    expect(result[0].featuredOrder).toBe(1);
    expect(result[0].category).toBe('music');
    expect(result[0].categoryLabel).toBe('Music & Concerts');

    // 2nd item: Featured rank 2
    expect(result[1].id).toBe('22222222-2222-4222-a222-222222222222');
    expect(result[1].isFeatured).toBe(true);
    expect(result[1].featuredOrder).toBe(2);
    expect(result[1].category).toBe('nightlife');
    expect(result[1].categoryLabel).toBe('Nightlife & Parties');

    // 3rd item: Automatic non-featured soonest upcoming
    expect(result[2].id).toBe('33333333-3333-4333-a333-333333333333');
    expect(result[2].isFeatured).toBe(false);
    expect(result[2].category).toBe('wellness');
    expect(result[2].categoryLabel).toBe('Health & Wellness');
  });
});
