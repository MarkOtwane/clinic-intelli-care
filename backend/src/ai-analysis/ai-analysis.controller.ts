import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import { AnalyzeSymptomsDto } from './dto/analyze-symptoms.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('ai-analysis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiAnalysisController {
  constructor(private readonly aiService: AiAnalysisService) {}

  @Post()
  @Roles('PATIENT')
  analyzeSymptoms(
    @Body() dto: AnalyzeSymptomsDto,
    @CurrentUser('id') patientId: string,
  ) {
    return this.aiService.analyzeSymptoms(dto, patientId);
  }

  @Get('patient/:patientId')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  getPatientAnalyses(@Param('patientId') patientId: string) {
    return this.aiService.getPatientAnalyses(patientId);
  }

  @Get(':id')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  getAnalysisById(@Param('id') id: string) {
    return this.aiService.getAnalysisById(id);
  }
}
