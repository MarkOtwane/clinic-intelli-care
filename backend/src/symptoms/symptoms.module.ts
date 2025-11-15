import { Module } from '@nestjs/common';
import { AiAnalysisModule } from '../ai-analysis/ai-analysis.module';
import { SymptomsController } from './symptoms.controller';
import { SymptomsService } from './symptoms.service';

/**
 * Symptoms Module
 * Handles patient symptom submission and management
 */
@Module({
  imports: [AiAnalysisModule],
  controllers: [SymptomsController],
  providers: [SymptomsService],
  exports: [SymptomsService],
})
export class SymptomsModule {}
