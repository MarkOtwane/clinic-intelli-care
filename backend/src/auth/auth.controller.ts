/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dtos/auth-credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from './cookie.utils';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const meta = { userAgent: req.get('user-agent') || undefined, ip: req.ip };
    const result = await this.authService.signup(dto);
    // set refresh cookie if returned
    if (result.refreshToken)
      setRefreshTokenCookie(res, result.refreshToken, this.config);
    // return access token only (or include user)
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const meta = { userAgent: req.get('user-agent') || undefined, ip: req.ip };
    const result = await this.authService.login(dto);
    setRefreshTokenCookie(res, result.refreshToken, this.config);
    return { user: result.user, accessToken: result.accessToken };
  }

  /**
   * Refresh endpoint.
   * Reads refresh token from httpOnly cookie and issues new access + refresh tokens.
   */
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.['refreshToken'];
    if (!raw) throw new UnauthorizedException('Refresh token missing');

    const meta = { userAgent: req.get('user-agent'), ip: req.ip };
    const result = await this.authService.validateAndRotateRefreshToken(
      raw,
      meta,
    );

    setRefreshTokenCookie(res, result.refreshToken, this.config);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.['refreshToken'];
    if (raw) await this.authService.revokeRefreshToken(raw);
    clearRefreshTokenCookie(res);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }
}
