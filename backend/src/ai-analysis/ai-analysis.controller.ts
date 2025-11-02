import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
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
  create(@Body() dto: CreateAnalysisDto, @CurrentUser('id') patientId: string) {
    return this.aiService.create(dto, patientId);
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR')
  findAll() {
    return this.aiService.findAll();
  }

  @Get('patient/:id')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  findByPatient(@Param('id') id: string) {
    return this.aiService.findByPatient(id);
  }

  @Get(':id')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.aiService.findOne(id);
  }

  @Patch(':id')
  @Roles('DOCTOR')
  update(@Param('id') id: string, @Body() dto: UpdateAnalysisDto) {
    return this.aiService.update(id, dto);
  }
}
