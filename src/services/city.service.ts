import { prisma } from '../config/prisma';
import { CityResponse } from '../models/common.dto';
import { NotFoundError } from '../utils/errors';


export interface SupportedCityItem {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
  neighborhoods: string[];
}

export const SUPPORTED_CITIES = [
  {
    id: 'abeokuta',
    name: 'Abeokuta',
    state: 'Ogun',
    isActive: true,
    neighborhoods: [
      'Ibara',
      'Kuto',
      'Oke-Mosan',
      'Adigbe',
      'Panseke',
      'Onikolobo',
      'Idi-Aba',
      'Lalubu',
      'Obantoko',
      'Camp',
      'Totoro',
      'Ita-Eko',
      'Lafenwa',
    ],
  },
  {
    id: 'lagos',
    name: 'Lagos',
    state: 'Lagos',
    isActive: true,
    neighborhoods: [
      'Ikeja',
      'Lekki Phase 1',
      'Victoria Island',
      'Ikoyi',
      'Yaba',
      'Surulere',
      'Maryland',
      'Ajah',
      'Chevron / Ikota',
      'Ebute Metta',
      'Alausa',
      'Ogudu / Ojota',
      'Magodo',
      'Ikorodu',
      'Festac Town',
    ],
  },
  {
    id: 'ibadan',
    name: 'Ibadan',
    state: 'Oyo',
    isActive: false,
    neighborhoods: [
      'Bodija',
      'Ring Road',
      'Oluyole',
      'Jericho',
      'Akobo',
      'Iyaganku',
      'Agodi GRA',
      'UI / Samonda',
      'Dugbe',
      'Challenge',
    ],
  },
  {
    id: 'abuja',
    name: 'Abuja',
    state: 'FCT',
    isActive: false,
    neighborhoods: [
      'Maitama',
      'Wuse 2',
      'Garki',
      'Jabi',
      'Utako',
      'Gwarinpa',
      'Asokoro',
      'Central Business District',
      'Guzape',
      'Lugbe',
    ],
  },
  {
    id: 'port-harcourt',
    name: 'Port Harcourt',
    state: 'Rivers',
    isActive: false,
    neighborhoods: [
      'GRA Phase 1',
      'GRA Phase 2',
      'Aba Road',
      'Trans Amadi',
      'Rumuola',
      'Rumuokwuta',
      'Elelenwo',
      'Old GRA',
      'Diobu',
    ],
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
        neighborhoods: city.neighborhoods,
      };
    });
  }

  /**
 * Get neighborhoods for a specific city ID or City Name
 */
  static async getNeighborhoodsByCity(cityIdOrName: string): Promise<string[]> {
    const target = cityIdOrName.toLowerCase().trim();
    const city = SUPPORTED_CITIES.find(
      (c) => c.id.toLowerCase() === target || c.name.toLowerCase() === target
    );
    if (!city) {
      throw new NotFoundError(`City '${cityIdOrName}' is not supported`);
    }
    return city.neighborhoods;
  }
}


