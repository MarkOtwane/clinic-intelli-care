import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AiAnalysisService } from './ai-analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

/**
 * Controller for AI Analysis endpoints
 * Handles symptom analysis, disease prediction, and doctor reviews
 */
@Controller('ai-analysis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiAnalysisController {
  constructor(
    private readonly aiService: AiAnalysisService,
    private prisma: PrismaService,
  ) {}

  /**
   * Analyze symptoms and create AI analysis (PATIENT only)
   */
  @Post('analyze')
  @Roles('PATIENT')
  async analyzeSymptoms(
    @Body() dto: CreateAnalysisDto,
    @CurrentUser('id') userId: string,
  ) {
    // Get patient ID from user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let patientId = user.patientProfile?.id;

    // Create patient profile if it doesn't exist for PATIENT role users
    if (!patientId && user.role === 'PATIENT') {
      const patient = await this.prisma.patient.create({
        data: {
          user: { connect: { id: userId } },
          name: `${user.email}`, // Use email as fallback name
          age: 0,
          gender: 'OTHER',
          phone: '',
          address: '',
        },
      });
      patientId = patient.id;
    }

    if (!patientId) {
      throw new BadRequestException(
        'Patient profile not found and could not be created',
      );
    }

    return this.aiService.create(dto, patientId);
  }

  /**
   * Get all analyses (ADMIN, DOCTOR only)
   */
  @Get()
  @Roles('ADMIN', 'DOCTOR')
  findAll() {
    return this.aiService.findAll();
  }

  /**
   * Get analyses forwarded to current doctor (DOCTOR only)
   */
  @Get('my-forwarded')
  @Roles('DOCTOR')
  async getMyForwarded(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.aiService.findByDoctor(user.doctorProfile.id);
  }

  /**
   * Get analyses for a specific patient
   */
  @Get('patient/:id')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  findByPatient(@Param('id') id: string) {
    return this.aiService.findByPatient(id);
  }

  /**
   * Get analyses for current patient (PATIENT only)
   */
  @Get('my-analyses')
  @Roles('PATIENT')
  async findMyAnalyses(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.aiService.findByPatient(user.patientProfile.id);
  }

  /**
   * Get single analysis by ID
   */
  @Get(':id')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.aiService.findOne(id);
  }

  /**
   * Update analysis (DOCTOR only)
   */
  @Patch(':id')
  @Roles('DOCTOR')
  update(@Param('id') id: string, @Body() dto: UpdateAnalysisDto) {
    return this.aiService.update(id, dto);
  }

  /**
   * Confirm diagnosis (DOCTOR only)
   */
  @Post(':id/confirm')
  @Roles('DOCTOR')
  async confirmDiagnosis(
    @Param('id') id: string,
    @Body() body: { confirmedDiagnosis: string },
    @CurrentUser('id') userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.aiService.confirmDiagnosis(
      id,
      user.doctorProfile.id,
      body.confirmedDiagnosis,
    );
  }

  /**
   * Mark analysis as reviewed (DOCTOR only)
   */
  @Post(':id/review')
  @Roles('DOCTOR')
  async reviewAnalysis(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.aiService.reviewAnalysis(id, user.doctorProfile.id);
  }
}
