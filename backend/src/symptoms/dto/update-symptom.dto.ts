import { PartialType } from '@nestjs/mapped-types';
import { CreateSymptomDto } from './create-symptom.dto';

/**
 * DTO for updating an existing symptom entry
 * Extends CreateSymptomDto with all fields optional
 */
export class UpdateSymptomDto extends PartialType(CreateSymptomDto) {}
