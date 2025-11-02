import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateAnalysisDto {
  @IsArray()
  symptoms: string[];

  @IsOptional()
  @IsString()
  medications?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
