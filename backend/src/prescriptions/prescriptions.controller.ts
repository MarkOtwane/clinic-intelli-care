import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

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
