import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

export const COOKIE_NAME = 'refreshToken';

export function setRefreshTokenCookie(
  res: Response,
  token: string,
  config: ConfigService,
) {
  const secureEnv = config.get<string>('REFRESH_TOKEN_COOKIE_SECURE');
  // Default secure:true in production when not explicitly set
  const nodeEnv = config.get<string>('NODE_ENV') || 'development';
  const secure =
    secureEnv !== undefined ? secureEnv === 'true' : nodeEnv === 'production';

  const sameSiteEnv = config.get<string>('REFRESH_TOKEN_COOKIE_SAMESITE');
  const sameSite = (sameSiteEnv || 'lax') as 'lax' | 'strict' | 'none';

  const domain = config.get<string>('REFRESH_TOKEN_COOKIE_DOMAIN') || undefined;

  const maxAge = msFromEnv(
    config.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '30d',
  );

  const cookieOptions: any = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge,
  };

  if (domain) cookieOptions.domain = domain;

  res.cookie(COOKIE_NAME, token, cookieOptions);
}

export function clearRefreshTokenCookie(res: Response) {
  // Clear cookie with same attributes (domain/path) if set
  res.clearCookie(COOKIE_NAME, { httpOnly: true, path: '/' });
}

/**
 * Convert env-style value "30d", "1h", "900s" into ms for cookie maxAge
 * Minimal implementation: supports s, m, h, d suffixes — extend if needed.
 */
function msFromEnv(val: string): number {
  if (!val) return 0;
  const m = val.match(/^(\d+)(s|m|h|d)$/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const unit = m[2];
  switch (unit) {
    case 's':
      return n * 1000;
    case 'm':
      return n * 60 * 1000;
    case 'h':
      return n * 60 * 60 * 1000;
    case 'd':
      return n * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}
