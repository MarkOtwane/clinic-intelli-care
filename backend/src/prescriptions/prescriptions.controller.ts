import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { CreatePrescriptionDto } from './dtos/create-prescription.dto';
import { UpdatePrescriptionDto } from './dtos/update-prescription.dto';
import { PrescriptionsService } from './prescriptions.service';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles('DOCTOR')
  create(
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser('id') doctorId: string,
  ) {
    return this.prescriptionsService.create(dto, doctorId);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.prescriptionsService.findAll();
  }

  /**
   * Get prescriptions for current patient (PATIENT only)
   * Convenience endpoint that auto-detects patient ID from JWT
   */
  @Get('my-prescriptions')
  @Roles('PATIENT')
  async findMyPrescriptions(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.prescriptionsService.findByPatient(user.patientProfile.id);
  }

  @Get('patient/:id')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  findByPatient(@Param('id') id: string) {
    return this.prescriptionsService.findByPatient(id);
  }

  @Get(':id')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('DOCTOR')
  update(@Param('id') id: string, @Body() dto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('DOCTOR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
