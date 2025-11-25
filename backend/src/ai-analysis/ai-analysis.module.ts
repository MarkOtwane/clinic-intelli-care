import { Module } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisController } from './ai-analysis.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService, PrismaService],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
