import { Module } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';

@Module({
  providers: [AiAnalysisService]
})
export class AiAnalysisModule {}
