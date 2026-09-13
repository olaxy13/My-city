import { Controller, Route, Get, Tags } from 'tsoa';
import { CityService } from '../../services/city.service';
import { CityResponse, ApiResponse } from '../../models/common.dto';

@Tags('Public Cities')
@Route('api/v1/cities')
export class CitiesController extends Controller {
  /**
   * Get supported cities list for the frontend city selection pills.
   * Active cities have isActive: true and listing counts; upcoming cities have isActive: false.
   */
  @Get('')
  public async getCities(): Promise<ApiResponse<CityResponse[]>> {
    const cities = await CityService.getCities();
    return {
      success: true,
      message: 'Supported cities retrieved successfully',
      data: cities,
    };
  }
}
