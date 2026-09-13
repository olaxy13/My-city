import { CategoryEnum } from '../models/common.dto';

export interface CategoryInfo {
  slug: CategoryEnum;
  name: string;
  displayOrder: number;
}

export const CATEGORIES_METADATA: Record<CategoryEnum, { name: string; displayOrder: number }> = {
  music: { name: 'Music & Concerts', displayOrder: 1 },
  food_drink: { name: 'Food & Drinks', displayOrder: 2 },
  sports: { name: 'Sports & Fitness', displayOrder: 3 },
  comedy: { name: 'Comedy & Stand-up', displayOrder: 4 },
  arts_culture: { name: 'Arts & Culture', displayOrder: 5 },
  nightlife: { name: 'Nightlife & Parties', displayOrder: 6 },
  religious: { name: 'Religious & Faith', displayOrder: 7 },
  education: { name: 'Education & Workshops', displayOrder: 8 },
  lifestyle: { name: 'Lifestyle & Community', displayOrder: 9 },
  wellness: { name: 'Health & Wellness', displayOrder: 10 },
};

export const ALL_CATEGORIES: CategoryInfo[] = (Object.keys(CATEGORIES_METADATA) as CategoryEnum[]).map(
  (slug) => ({
    slug,
    name: CATEGORIES_METADATA[slug].name,
    displayOrder: CATEGORIES_METADATA[slug].displayOrder,
  })
);

export function getCategoryLabel(slug: CategoryEnum): string {
  return CATEGORIES_METADATA[slug]?.name || slug;
}
