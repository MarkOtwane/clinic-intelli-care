import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';
import { SymptomsService } from './symptoms.service';

/**
 * Controller for managing patient symptoms
 * Handles symptom submission, retrieval, and updates
 */
@Controller('symptoms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SymptomsController {
  constructor(
    private readonly symptomsService: SymptomsService,
    private prisma: PrismaService,
  ) {}

  /**
   * Submit new symptoms (PATIENT only)
   * Automatically triggers AI analysis if analyze=true
   */
  @Post()
  @Roles('PATIENT')
  async create(
    @Body() dto: CreateSymptomDto,
    @CurrentUser('id') userId: string,
    @Query('analyze') analyze?: string,
  ) {
    // Get patient ID from user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    const shouldAnalyze = analyze !== 'false'; // Default to true
    return this.symptomsService.create(
      dto,
      user.patientProfile.id,
      shouldAnalyze,
    );
  }

  /**
   * Get all symptoms for the current patient (PATIENT only)
   */
  @Get('my-symptoms')
  @Roles('PATIENT')
  async findMySymptoms(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.symptomsService.findByPatient(user.patientProfile.id);
  }

  /**
   * Get all symptoms (ADMIN/DOCTOR only)
   */
  @Get()
  @Roles('ADMIN', 'DOCTOR')
  findAll() {
    return this.symptomsService.findAll();
  }

  /**
   * Get symptoms forwarded to a specific doctor (DOCTOR only)
   */
  @Get('forwarded')
  @Roles('DOCTOR')
  async getForwardedSymptoms(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.symptomsService.getForwardedSymptoms(user.doctorProfile.id);
  }

  /**
   * Get a specific symptom by ID
   */
  @Get(':id')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    let patientId: string | undefined;

    // Only check patient ID if user is a patient
    if (role === 'PATIENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { patientProfile: true },
      });
      patientId = user?.patientProfile?.id;
    }

    return this.symptomsService.findOne(id, patientId);
  }

  /**
   * Update a symptom (PATIENT only, own symptoms)
   */
  @Patch(':id')
  @Roles('PATIENT')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSymptomDto,
    @CurrentUser('id') userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.symptomsService.update(id, dto, user.patientProfile.id);
  }

  /**
   * Delete a symptom (PATIENT only, own symptoms)
   */
  @Delete(':id')
  @Roles('PATIENT')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.symptomsService.remove(id, user.patientProfile.id);
  }
}
