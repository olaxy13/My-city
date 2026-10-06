import { Controller, Route, Get, Path, Tags, Response } from 'tsoa';
import { CityService } from '../../services/city.service';
import { CityResponse, ApiResponse, ApiErrorResponse } from '../../models/common.dto';

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


  /**
 * Get list of major neighborhoods for a given city ID (e.g. 'lagos', 'abeokuta')
 */
  @Response<ApiErrorResponse>(404, 'City not found')
  @Get('{cityId}/neighborhoods')
  public async getNeighborhoods(@Path() cityId: string): Promise<ApiResponse<string[]>> {
    const neighborhoods = await CityService.getNeighborhoodsByCity(cityId);
    return {
      success: true,
      message: `Neighborhoods for ${cityId} retrieved successfully`,
      data: neighborhoods,
    };
  }
}
