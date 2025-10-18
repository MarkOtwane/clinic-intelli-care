import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

export const COOKIE_NAME = 'refreshToken';

export function setRefreshTokenCookie(
  res: Response,
  token: string,
  config: ConfigService,
) {
  const secure = config.get<string>('REFRESH_TOKEN_COOKIE_SECURE') === 'true';
  const maxAge = msFromEnv(
    config.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '30d',
  );

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export function clearRefreshTokenCookie(res: Response) {
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
