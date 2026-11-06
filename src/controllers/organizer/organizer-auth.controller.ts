import { Controller, Route, Post, Get, Body, Tags, Query, Response } from 'tsoa';
import { ApiResponse, ApiErrorResponse } from '../../models/common.dto';
import { OrganizerService } from '../../services/organizer.service';

interface RequestLinkDto {
  email: string;
}

interface OrganizerLoginResponse {
  token: string;
  organizerEmail: string;
}

@Tags('Organizer Authentication')
@Route('api/v1/organizer/auth')
export class OrganizerAuthController extends Controller {
  /**
   * Request a magic login link sent to the organizer's email.
   * Always returns 200 (even if email not found) to prevent enumeration.
   */
  @Response<ApiErrorResponse>(400, 'Bad request')
  @Post('request-link')
  public async requestLink(
    @Body() body: RequestLinkDto
  ): Promise<ApiResponse<{ message: string }>> {
    await OrganizerService.requestMagicLink(body.email);
    return {
      success: true,
      message: 'If this email is registered as an organizer, a login link has been sent.',
      data: { message: 'Check your inbox' },
    };
  }

  /**
   * Verify a magic link token and issue a 24h organizer JWT.
   */
  @Response<ApiErrorResponse>(400, 'Invalid or expired token')
  @Get('verify')
  public async verify(
    @Query() token: string
  ): Promise<ApiResponse<OrganizerLoginResponse>> {
    const data = await OrganizerService.verifyMagicLink(token);
    return {
      success: true,
      message: 'Authenticated successfully',
      data,
    };
  }
}
