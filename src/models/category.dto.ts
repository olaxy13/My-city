import { CategoryEnum } from './common.dto';

export interface CategoryResponse {
  slug: CategoryEnum;
  name: string;
  displayOrder: number;
  listingCount?: number;
}
