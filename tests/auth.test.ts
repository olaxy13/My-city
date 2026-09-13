import { AuthService } from '../src/services/auth.service';
import { AdminRole } from '../src/models/common.dto';

describe('AuthService Unit Tests', () => {
  it('should hash and compare passwords correctly', async () => {
    const plainPassword = 'Diamond13';
    const hash = await AuthService.hashPassword(plainPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plainPassword);

    const isMatch = await AuthService.comparePassword(plainPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await AuthService.comparePassword('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('should generate and verify valid JWT tokens', () => {
    const payload = {
      userId: 'test-admin-uuid',
      email: 'okeolamide.o@gmail.com',
      role: 'super_admin' as AdminRole,
    };

    const token = AuthService.generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = AuthService.verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('should fail token verification with invalid token', () => {
    expect(() => AuthService.verifyToken('invalid-token-string')).toThrow();
  });
});
