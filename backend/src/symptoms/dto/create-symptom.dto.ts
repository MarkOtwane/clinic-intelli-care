import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for creating a new symptom entry
 * Used by patients to submit their symptoms for AI analysis
 */
export class CreateSymptomDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  description: string[]; // Array of symptom descriptions (e.g., ['fever', 'headache', 'fatigue'])

  @IsOptional()
  @IsString()
  location?: string; // Body location where symptom occurs (e.g., 'head', 'chest', 'abdomen')

  @IsOptional()
  @IsString()
  medications?: string; // Medications already taken by the patient

  @IsOptional()
  @IsString()
  notes?: string; // Additional notes or details about the symptoms
}
