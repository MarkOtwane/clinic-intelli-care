/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, SignupDto } from './dtos/auth-credentials.dto';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Create account (signup)
  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const role = (dto.role as Prisma.JsonValue) ?? 'PATIENT';
    const user = await this.usersService.createUser(
      dto.email,
      hashed,
      dto.role ?? 'PATIENT',
    );
    // never return password
    const token = this.generateJwt(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  // Login: validate credentials and return JWT
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateJwt(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  generateJwt(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
