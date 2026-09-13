import { Controller, Route, Put, Path, Body, Tags, Security, Response } from 'tsoa';
import { ModerationService } from '../../services/moderation.service';
import {
  ModerationActionResponse,
  RejectListingDto,
  RequestChangesDto,
} from '../../models/admin.dto';
import { ApiResponse, ApiErrorResponse } from '../../models/common.dto';

@Tags('Admin Moderation')
@Security('jwt')
@Route('api/v1/admin/listings')
export class AdminModerationController extends Controller {
  /**
   * Approve a pending listing to make it live (pending -> approved).
   */
  @Response<ApiErrorResponse>(422, 'Invalid state transition')
  @Response<ApiErrorResponse>(404, 'Listing not found')
  @Put('{id}/approve')
  public async approveListing(@Path() id: string): Promise<ApiResponse<ModerationActionResponse>> {
    const data = await ModerationService.approveListing(id);
    return {
      success: true,
      message: 'Listing approved successfully and published to the discovery feed',
      data,
    };
  }

  /**
   * Reject a pending listing with a mandatory reason (pending -> rejected).
   */
  @Response<ApiErrorResponse>(400, 'Rejection reason is required')
  @Response<ApiErrorResponse>(422, 'Invalid state transition')
  @Response<ApiErrorResponse>(404, 'Listing not found')
  @Put('{id}/reject')
  public async rejectListing(
    @Path() id: string,
    @Body() body: RejectListingDto
  ): Promise<ApiResponse<ModerationActionResponse>> {
    const data = await ModerationService.rejectListing(id, body.rejectionReason);
    return {
      success: true,
      message: 'Listing rejected and notification email sent to submitter',
      data,
    };
  }

  /**
   * Request adjustments from the submitter with feedback notes (pending -> needs_changes).
   */
  @Response<ApiErrorResponse>(400, 'Admin feedback notes are required')
  @Response<ApiErrorResponse>(422, 'Invalid state transition')
  @Response<ApiErrorResponse>(404, 'Listing not found')
  @Put('{id}/request-changes')
  public async requestChanges(
    @Path() id: string,
    @Body() body: RequestChangesDto
  ): Promise<ApiResponse<ModerationActionResponse>> {
    const data = await ModerationService.requestChanges(id, body.adminNotes);
    return {
      success: true,
      message: 'Changes requested successfully and feedback email sent to submitter',
      data,
    };
  }
}
