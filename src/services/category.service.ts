import { prisma } from '../config/prisma';
import { CategoryResponse } from '../models/category.dto';
import { ALL_CATEGORIES, CategoryInfo } from '../utils/categories';
import { CategoryEnum } from '../models/common.dto';

export class CategoryService {
  /**
   * Get all categories with approved listing counts
   */
  static async getCategories(): Promise<CategoryResponse[]> {
    // Count approved listings grouped by category
    const counts = await prisma.listing.groupBy({
      by: ['category'],
      where: {
        status: 'approved',
        isPublished: true,
      },
      _count: {
        id: true,
      },
    });

    const countMap = new Map<CategoryEnum, number>();
    counts.forEach((item) => {
      countMap.set(item.category as CategoryEnum, item._count.id);
    });

    return ALL_CATEGORIES.map((cat: CategoryInfo) => ({
      slug: cat.slug,
      name: cat.name,
      displayOrder: cat.displayOrder,
      listingCount: countMap.get(cat.slug) || 0,
    })).sort((a, b) => a.displayOrder - b.displayOrder);
  }
}
