import { Controller, Route, Post, Put, Get, Body, Path, Query, Tags, SuccessResponse, Response } from 'tsoa';
import { ListingService } from '../../services/listing.service';
import {
  CreateSubmissionDto,
  ResubmitListingDto,
  SubmissionResponseData,
} from '../../models/submission.dto';
import { ListingDetailResponse } from '../../models/listing.dto';
import { ApiResponse, ApiErrorResponse } from '../../models/common.dto';

@Tags('Public Submissions')
@Route('api/v1/submissions')
export class SubmissionsController extends Controller {
  /**
   * Submit a new listing for moderation review (creates in status 'pending').
   */
  @SuccessResponse(201, 'Created')
  @Response<ApiErrorResponse>(400, 'Validation or missing required fields')
  @Post('')
  public async createSubmission(
    @Body() body: CreateSubmissionDto
  ): Promise<ApiResponse<SubmissionResponseData>> {
    this.setStatus(201);
    const data = await ListingService.createSubmission(body);
    return {
      success: true,
      message: 'Your listing has been submitted successfully for moderation review',
      data,
    };
  }

  /**
   * Retrieve listing details for submitter editing (requires edit authorization token).
   */
  @Response<ApiErrorResponse>(401, 'Invalid edit authorization token')
  @Response<ApiErrorResponse>(404, 'Listing not found')
  @Get('{id}')
  public async getSubmissionForEdit(
    @Path() id: string,
    @Query() editToken: string
  ): Promise<ApiResponse<ListingDetailResponse>> {
    const data = await ListingService.getSubmissionForEdit(id, editToken);
    return {
      success: true,
      message: 'Submission details retrieved for editing',
      data,
    };
  }

  /**
   * Update and resubmit a listing in 'needs_changes' status back to 'pending'.
   */
  @Response<ApiErrorResponse>(422, 'Cannot resubmit listing in non-needs_changes status')
  @Response<ApiErrorResponse>(401, 'Invalid edit authorization token')
  @Put('{id}')
  public async updateAndResubmit(
    @Path() id: string,
    @Query() editToken: string,
    @Body() body: ResubmitListingDto
  ): Promise<ApiResponse<SubmissionResponseData>> {
    const data = await ListingService.updateAndResubmit(id, editToken, body);
    return {
      success: true,
      message: 'Listing changes have been submitted and placed back in the moderation queue',
      data,
    };
  }
}
