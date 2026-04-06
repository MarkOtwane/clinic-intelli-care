/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma client connected');
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma library engine (v5+) requires hooking process.beforeExit directly.
    process.once('beforeExit', async () => {
      await app.close();
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
