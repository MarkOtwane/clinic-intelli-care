export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  bio?: string;
  phone?: string;
  experience?: number;
  available?: boolean;
  email?: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    mustChangePassword?: boolean;
  };
  licenseNumber?: string;
  hospital?: string;
  totalPatients?: number;
  totalAppointments?: number;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDoctorDto {
  name: string;
  specialization: string;
  bio?: string;
  phone?: string;
  experience?: number;
  available?: boolean;
  userId?: string;
  email?: string;
  licenseNumber?: string;
  hospital?: string;
}

export interface UpdateDoctorDto extends Partial<CreateDoctorDto> {
  totalPatients?: number;
  totalAppointments?: number;
  rating?: number;
}
