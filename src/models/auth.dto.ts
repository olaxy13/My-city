import { AdminRole } from './common.dto';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string | Date;
}

export interface LoginResponse {
  token: string;
  //admin: AdminUserResponse;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: AdminRole;
}
