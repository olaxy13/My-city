import {
  Controller, Route, Get, Patch, Body, Tags, Security, Request,
  Path, Query, Response,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { ApiResponse, ApiErrorResponse } from '../../models/common.dto';
import { OrganizerService } from '../../services/organizer.service';
import { JwtPayload } from '../../models/auth.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload;
}

interface UpdateSettingsDto {
  notificationPreference: 'per_sale' | 'daily_digest' | 'weekly_digest';
}

interface UpdateListingDto {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  contactPhone?: string;
  contactEmail?: string;
  externalLink?: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  startDateTime?: string;
  endDateTime?: string;
}

@Tags('Organizer Dashboard')
@Route('api/v1/organizer')
@Security('organizer_jwt')
export class OrganizerEventsController extends Controller {
  /**
   * List all event listings submitted by this organizer (all statuses).
   */
  @Response<ApiErrorResponse>(401, 'Unauthorized')
  @Get('events')
  public async getEvents(@Request() req: ExpressRequest): Promise<ApiResponse<any[]>> {
    const authReq = req as AuthenticatedRequest;
    const data = await OrganizerService.getEvents(authReq.user.organizerEmail!);
    return { success: true, message: 'Events retrieved', data };
  }

  /**
   * Get full analytics for a single event listing.
   */
  @Response<ApiErrorResponse>(401, 'Unauthorized')
  @Response<ApiErrorResponse>(403, 'Forbidden')
  @Response<ApiErrorResponse>(404, 'Not found')
  @Get('events/{listingId}')
  public async getEventAnalytics(
    @Path() listingId: string,
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<any>> {
    const authReq = req as AuthenticatedRequest;
    const data = await OrganizerService.getEventAnalytics(listingId, authReq.user.organizerEmail!);
    return { success: true, message: 'Analytics retrieved', data };
  }

  /**
   * Update an event listing (edit restrictions apply based on listing status).
   */
  @Response<ApiErrorResponse>(401, 'Unauthorized')
  @Response<ApiErrorResponse>(403, 'Forbidden')
  @Patch('events/{listingId}')
  public async updateListing(
    @Path() listingId: string,
    @Body() body: UpdateListingDto,
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<any>> {
    const authReq = req as AuthenticatedRequest;
    const data = await OrganizerService.updateListing(listingId, authReq.user.organizerEmail!, body);
    return { success: true, message: data.message, data };
  }

  /**
   * Get paginated orders for a listing.
   */
  @Response<ApiErrorResponse>(401, 'Unauthorized')
  @Response<ApiErrorResponse>(403, 'Forbidden')
  @Get('events/{listingId}/orders')
  public async getOrders(
    @Path() listingId: string,
    @Query() page = 1,
    @Query() limit = 20,
    @Request() req: ExpressRequest
  ): Promise<any> {
    const authReq = req as AuthenticatedRequest;
    const result = await OrganizerService.getOrders(listingId, authReq.user.organizerEmail!, page, limit);
    return {
      success: true,
      message: 'Orders retrieved',
      data: result.data,
      pagination: result.pagination,
    };
  }

  /**
   * Get all attendees (issued tickets) for a listing.
   */
  @Response<ApiErrorResponse>(401, 'Unauthorized')
  @Response<ApiErrorResponse>(403, 'Forbidden')
  @Get('events/{listingId}/attendees')
  public async getAttendees(
    @Path() listingId: string,
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<any[]>> {
    const authReq = req as AuthenticatedRequest;
    const data = await OrganizerService.getAttendees(listingId, authReq.user.organizerEmail!);
    return { success: true, message: 'Attendees retrieved', data };
  }

  /**
   * Get organizer notification settings.
   */
  @Response<ApiErrorResponse>(401, 'Unauthorized')
  @Get('settings')
  public async getSettings(@Request() req: ExpressRequest): Promise<ApiResponse<any>> {
    const authReq = req as AuthenticatedRequest;
    const data = await OrganizerService.getSettings(authReq.user.organizerEmail!);
    return { success: true, message: 'Settings retrieved', data };
  }

  /**
   * Update organizer notification settings.
   */
  @Response<ApiErrorResponse>(401, 'Unauthorized')
  @Response<ApiErrorResponse>(400, 'Invalid preference value')
  @Patch('settings')
  public async updateSettings(
    @Body() body: UpdateSettingsDto,
    @Request() req: ExpressRequest
  ): Promise<ApiResponse<any>> {
    const authReq = req as AuthenticatedRequest;
    const data = await OrganizerService.updateSettings(authReq.user.organizerEmail!, body.notificationPreference);
    return { success: true, message: 'Settings updated', data };
  }
}
