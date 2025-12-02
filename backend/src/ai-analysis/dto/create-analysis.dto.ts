import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum SymptomSeverity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
}

export class CreateAnalysisDto {
  @IsArray()
  symptoms: string[];

  @IsEnum(SymptomSeverity)
  severity: SymptomSeverity;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];
}
