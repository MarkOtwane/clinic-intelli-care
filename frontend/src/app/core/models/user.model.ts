export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string;
  licenseNumber: string;
  experience: number;
  qualifications: string[];
  bio?: string;
  consultationFee: number;
  availability: DoctorAvailability[];
  isVerified: boolean;
}

export interface DoctorAvailability {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface AdminProfile {
  id: string;
  userId: string;
  permissions: string[];
  department: string;
}