import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysisService } from './ai-analysis.service';
import { AIService } from './ai.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService, AIService],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
