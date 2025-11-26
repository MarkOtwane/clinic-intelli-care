/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto } from './dtos/auth-credentials.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user = await this.usersService.createUser(
      dto.email,
      hashed,
      dto.role ?? 'PATIENT',
      dto.firstName,
      dto.lastName,
      dto.phone,
    );

    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const refreshToken = await this.createAndStoreRefreshToken(user.id);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const refreshToken = await this.createAndStoreRefreshToken(user.id);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  generateAccessToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: parseInt(this.config.get<string>('JWT_EXPIRES_IN') || '900'),
    });
  }

  private parseExpiry(spec: string): Date {
    const match = spec.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry specification: ${spec}`);
    }
    const now = new Date();
    const val = Number(match[1]);
    const unit = match[2];
    const ms =
      unit === 's'
        ? val * 1000
        : unit === 'm'
          ? val * 60000
          : unit === 'h'
            ? val * 3600000
            : val * 86400000;
    return new Date(now.getTime() + ms);
  }

  private generateRandomToken() {
    return randomBytes(64).toString('hex');
  }

  async createAndStoreRefreshToken(
    userId: string,
    meta: { userAgent?: string; ip?: string } = {},
  ) {
    const jti = uuidv4();
    const rawSecret = this.generateRandomToken(); // raw part
    const combinedToken = `${jti}.${rawSecret}`;

    const hash = await bcrypt.hash(rawSecret, this.SALT_ROUNDS);
    const expiresAt = this.parseExpiry(
      this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '30d',
    );

    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId,
        tokenHash: hash,
        userAgent: meta.userAgent,
        ip: meta.ip,
        expiresAt,
      },
    });

    return combinedToken;
  }

  async validateAndRotateRefreshToken(
    rawToken: string,
    meta: { userAgent?: string; ip?: string } = {},
  ) {
    const [jti, secret] = rawToken.split('.');
    if (!jti || !secret)
      throw new UnauthorizedException('Malformed refresh token');

    const record = await this.prisma.refreshToken.findUnique({
      where: { id: jti },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    const valid = await bcrypt.compare(secret, record.tokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    // Rotation: delete old + issue new
    await this.prisma.refreshToken.delete({ where: { id: jti } });
    const newRaw = await this.createAndStoreRefreshToken(record.userId, meta);
    const accessToken = this.generateAccessToken(
      record.user.id,
      record.user.email,
      record.user.role,
    );

    return {
      user: {
        id: record.user.id,
        email: record.user.email,
        role: record.user.role,
      },
      accessToken,
      refreshToken: newRaw,
    };
  }

  async revokeRefreshToken(rawToken: string) {
    const [jti] = rawToken.split('.');
    if (!jti) return false;
    await this.prisma.refreshToken.deleteMany({ where: { id: jti } });
    return true;
  }

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
