export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bloodGroup?: string;
  allergies?: string[];
  conditions?: string[];
  emergencyContact?: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
  medicalHistory?: MedicalHistory[];
  lastVisit?: Date;
  totalAppointments: number;
  status: 'active' | 'inactive' | 'critical';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  expiryDate?: Date;
}

export interface MedicalHistory {
  id: string;
  date: Date;
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctorId: string;
  doctorName?: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bloodGroup?: string;
  allergies?: string[];
  conditions?: string[];
  emergencyContact?: EmergencyContact;
  insuranceInfo?: InsuranceInfo;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  status?: 'active' | 'inactive' | 'critical';
}
