import { Controller, Route, Get, Put, Query, Path, Body, Tags, Security, Response } from 'tsoa';
import { AdminService } from '../../services/admin.service';
import {
  AdminListingDetailResponse,
  FeatureListingDto,
  ReorderFeaturedDto,
  PublishStatusDto,
} from '../../models/admin.dto';
import { ListingStatus, ListingType, ApiResponse, PaginatedApiResponse, ApiErrorResponse } from '../../models/common.dto';

@Tags('Admin Listings')
@Security('jwt')
@Route('api/v1/admin/listings')
export class AdminListingsController extends Controller {
  /**
   * Get all listings for moderation queue and admin management with filters.
   */
  @Get('')
  public async getAdminListings(
    @Query() status?: ListingStatus,
    @Query() type?: ListingType,
    @Query() city?: string,
    @Query() search?: string,
    @Query() page?: number,
    @Query() limit?: number
  ): Promise<PaginatedApiResponse<AdminListingDetailResponse>> {
    const result = await AdminService.getAdminListings({
      status,
      type,
      city,
      search,
      page,
      limit,
    });

    return {
      success: true,
      message: 'Admin listings retrieved successfully',
      data: result.items,
      pagination: result.pagination,
    };
  }

  /**
   * Bulk reorder featured listings in the homepage slider.
   */
  @Put('reorder-featured')
  public async reorderFeatured(@Body() body: ReorderFeaturedDto): Promise<ApiResponse<null>> {
    await AdminService.reorderFeatured(body.orderedIds);
    return {
      success: true,
      message: 'Featured listings reordered successfully',
      data: null,
    };
  }

  /**
   * Get full details of a listing (including submitter info & moderation history) by ID.
   */
  @Response<ApiErrorResponse>(404, 'Listing not found')
  @Get('{id}')
  public async getAdminListingById(@Path() id: string): Promise<ApiResponse<AdminListingDetailResponse>> {
    const listing = await AdminService.getAdminListingById(id);
    return {
      success: true,
      message: 'Listing details retrieved successfully',
      data: listing,
    };
  }

  /**
   * Toggle featured status and set slider display order for a listing.
   */
  @Response<ApiErrorResponse>(404, 'Listing not found')
  @Put('{id}/feature')
  public async featureListing(
    @Path() id: string,
    @Body() body: FeatureListingDto
  ): Promise<ApiResponse<AdminListingDetailResponse>> {
    const updated = await AdminService.setFeatured(id, body.isFeatured, body.featuredOrder);
    return {
      success: true,
      message: body.isFeatured ? 'Listing marked as featured' : 'Listing unfeatured',
      data: updated,
    };
  }

  /**
   * Toggle publish/unpublish visibility for a live listing.
   */
  @Response<ApiErrorResponse>(404, 'Listing not found')
  @Put('{id}/publish-status')
  public async setPublishStatus(
    @Path() id: string,
    @Body() body: PublishStatusDto
  ): Promise<ApiResponse<AdminListingDetailResponse>> {
    const updated = await AdminService.setPublishStatus(id, body.isPublished);
    return {
      success: true,
      message: body.isPublished ? 'Listing published' : 'Listing unpublished',
      data: updated,
    };
  }
}
