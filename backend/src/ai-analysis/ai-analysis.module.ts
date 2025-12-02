import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisController } from './ai-analysis.controller';
import { AIService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService, AIService, PrismaService],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
