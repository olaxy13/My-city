import { Controller, Route, Get, Tags } from 'tsoa';
import { CategoryService } from '../../services/category.service';
import { CategoryResponse } from '../../models/category.dto';
import { ApiResponse } from '../../models/common.dto';

@Tags('Public Categories')
@Route('api/v1/categories')
export class CategoriesController extends Controller {
  /**
   * Get all active categories with approved listing counts, ordered by displayOrder.
   */
  @Get('')
  public async getCategories(): Promise<ApiResponse<CategoryResponse[]>> {
    const categories = await CategoryService.getCategories();
    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }
}
