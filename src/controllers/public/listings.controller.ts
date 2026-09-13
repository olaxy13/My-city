import { Controller, Route, Get, Query, Path, Tags, Response } from 'tsoa';
import { ListingService } from '../../services/listing.service';
import { ListingType, CategoryEnum, ApiResponse, PaginatedApiResponse, ApiErrorResponse } from '../../models/common.dto';
import {
  ListingDetailResponse,
  CountdownSliderItem,
} from '../../models/listing.dto';

@Tags('Public Listings')
@Route('api/v1/listings')
export class ListingsController extends Controller {
  /**
   * Browse & Search Approved Listings with filters for category, city, neighborhood, date, keyword, and type.
   */
  @Get('')
  public async getListings(
    @Query() category?: CategoryEnum,
    @Query() city?: string,
    @Query() neighborhood?: string,
    @Query() type?: ListingType,
    @Query() date?: string,
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() search?: string,
    @Query() page?: number,
    @Query() limit?: number
  ): Promise<PaginatedApiResponse<ListingDetailResponse>> {
    const result = await ListingService.getPublicListings({
      category,
      city,
      neighborhood,
      type,
      date,
      startDate,
      endDate,
      search,
      page,
      limit,
    });

    return {
      success: true,
      message: 'Listings retrieved successfully',
      data: result.items,
      pagination: result.pagination,
    };
  }

  /**
   * Retrieve homepage countdown slider items (featured events first, followed by soonest upcoming events).
   */
  @Get('upcoming-countdown')
  public async getUpcomingCountdown(
    @Query() limit?: number,
    @Query() city?: string
  ): Promise<ApiResponse<CountdownSliderItem[]>> {
    const items = await ListingService.getUpcomingCountdownSlider(limit, city);
    return {
      success: true,
      message: 'Upcoming countdown items retrieved successfully',
      data: items,
    };
  }

  /**
   * Get single approved listing detail by ID.
   */
  @Response<ApiErrorResponse>(404, 'Listing not found')
  @Get('{id}')
  public async getListingById(@Path() id: string): Promise<ApiResponse<ListingDetailResponse>> {
    const item = await ListingService.getPublicListingById(id);
    return {
      success: true,
      message: 'Listing details retrieved successfully',
      data: item,
    };
  }
}
