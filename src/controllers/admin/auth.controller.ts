import { Controller, Route, Post, Get, Body, Tags, Security, Request, Response } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { AuthService } from '../../services/auth.service';
import { LoginDto, LoginResponse, AdminUserResponse, JwtPayload } from '../../models/auth.dto';
import { ApiResponse, ApiErrorResponse } from '../../models/common.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload;
}

@Tags('Admin Authentication')
@Route('api/v1/admin/auth')
export class AdminAuthController extends Controller {
  /**
   * Admin login with email and password, returning JWT bearer token.
   */
  @Response<ApiErrorResponse>(401, 'Invalid email or password')
  @Post('login')
  public async login(@Body() body: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const data = await AuthService.login(body);
    return {
      success: true,
      message: 'Login successful',
      data,
    };
  }

  /**
   * Retrieve current authenticated admin profile.
   */
  @Security('jwt')
  @Response<ApiErrorResponse>(401, 'Unauthorized')
  @Response<ApiErrorResponse>(404, 'Admin profile not found')
  @Get('me')
  public async getProfile(@Request() request: ExpressRequest): Promise<ApiResponse<AdminUserResponse>> {
    const authReq = request as AuthenticatedRequest;
    const profile = await AuthService.getAdminById(authReq.user.userId);
    return {
      success: true,
      message: 'Admin profile retrieved successfully',
      data: profile,
    };
  }
}
