import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto, SignupDto } from './dtos/auth-credentials.dto';

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
      'PATIENT',
      dto.firstName,
      dto.lastName,
      dto.phone,
    );

    // Create patient profile for PATIENT role users
    if (user.role === 'PATIENT') {
      await this.prisma.patient.create({
        data: {
          user: { connect: { id: user.id } },
          name: `${dto.firstName || ''} ${dto.lastName || ''}`.trim(),
          age: 0, // Will be updated later
          gender: 'OTHER', // Will be updated later
          phone: dto.phone || '',
          address: '',
        },
      });
    }

    return {
      user: { id: user.id, email: user.email, role: user.role },
      message: 'Account created successfully. Please sign in to continue.',
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
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      accessToken,
      refreshToken,
      requirePasswordChange: user.mustChangePassword,
    };
  }

  generateAccessToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') || '900s') as any,
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
        mustChangePassword: record.user.mustChangePassword,
      },
      accessToken,
      refreshToken: newRaw,
      requirePasswordChange: record.user.mustChangePassword,
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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // If currentPassword is provided (not empty), verify it
    // If it's empty and mustChangePassword is true, allow password change
    if (currentPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('Invalid current password');
    } else if (!user.mustChangePassword) {
      // If no current password provided and it's not a forced change, reject
      throw new UnauthorizedException('Current password is required');
    }

    const hashed = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed, mustChangePassword: false },
    });

    await this.revokeAllUserTokens(userId);

    return { message: 'Password updated successfully. Please sign in again.' };
  }
}
