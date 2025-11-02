import { IsString } from 'class-validator';

export class ManageRoleDto {
  @IsString()
  userId: string;

  @IsString()
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}
