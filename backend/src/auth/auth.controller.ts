/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from './cookie.utils';
import { Public } from './decorators/public.decorator';
import { LoginDto, SignupDto } from './dtos/auth-credentials.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
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
  @Public()
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

  @Public()
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

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
