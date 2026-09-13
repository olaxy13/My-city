import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../models/auth.dto';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<JwtPayload> {
  if (securityName === 'jwt') {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = AuthService.verifyToken(token);

      if (scopes && scopes.length > 0) {
        if (!scopes.includes(decoded.role)) {
          throw new ForbiddenError('Insufficient permissions for this resource');
        }
      }

      return decoded;
    } catch (err) {
      if (err instanceof ForbiddenError) {
        throw err;
      }
      throw new UnauthorizedError('Invalid or expired authentication token');
    }
  }

  throw new UnauthorizedError(`Unknown security scheme '${securityName}'`);
}
