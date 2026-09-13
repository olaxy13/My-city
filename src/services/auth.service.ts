import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { LoginDto, LoginResponse, JwtPayload, AdminUserResponse } from '../models/auth.dto';
import { AdminRole } from '../models/common.dto';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  static async login(dto: LoginDto): Promise<LoginResponse> {
    const admin = await prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await this.comparePassword(dto.password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload: JwtPayload = {
      userId: admin.id,
      email: admin.email,
      role: admin.role as AdminRole,
    };

    const token = this.generateToken(payload);

    return {
      token,
      // admin: {
      //   id: admin.id,
      //   name: admin.name,
      //   email: admin.email,
      //   role: admin.role as AdminRole,
      //   isActive: admin.isActive,
      //   createdAt: admin.createdAt,
      // },
    };
  }

  static async getAdminById(id: string): Promise<AdminUserResponse> {
    const admin = await prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw new NotFoundError('Admin user not found or inactive');
    }

    return {
      ...admin,
      role: admin.role as AdminRole,
    };
  }
}
