import { prisma } from '../config/prisma';
import { CityResponse } from '../models/common.dto';

export const SUPPORTED_CITIES = [
  {
    id: 'abeokuta',
    name: 'Abeokuta',
    state: 'Ogun',
    isActive: true,
  },
  {
    id: 'lagos',
    name: 'Lagos',
    state: 'Lagos',
    isActive: false,
  },
  {
    id: 'ibadan',
    name: 'Ibadan',
    state: 'Oyo',
    isActive: false,
  },
  {
    id: 'abuja',
    name: 'Abuja',
    state: 'FCT',
    isActive: false,
  },
  {
    id: 'port-harcourt',
    name: 'Port Harcourt',
    state: 'Rivers',
    isActive: false,
  },
];

export class CityService {
  /**
   * Get supported cities with active listing counts
   */
  static async getCities(): Promise<CityResponse[]> {
    // Count active approved listings per city
    const counts = await prisma.listing.groupBy({
      by: ['city'],
      where: {
        status: 'approved',
        isPublished: true,
      },
      _count: {
        id: true,
      },
    });

    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      countMap.set(c.city.toLowerCase(), c._count.id);
    });

    return SUPPORTED_CITIES.map((city) => {
      const listingCount = countMap.get(city.name.toLowerCase()) || 0;
      return {
        id: city.id,
        name: city.name,
        state: city.state,
        isActive: city.isActive,
        listingCount: city.isActive ? listingCount : 0,
      };
    });
  }
}
