import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnalyzeSymptomsDto {
  @IsArray()
  @IsNotEmpty()
  symptoms: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
