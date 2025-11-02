import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  analysisId?: string;

  @IsArray()
  @IsNotEmpty()
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];

  @IsOptional()
  @IsString()
  notes?: string;
}
