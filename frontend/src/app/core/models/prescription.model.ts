export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  medications: Medication[];
  instructions: string;
  diagnosis: string;
  status: PrescriptionStatus;
  issuedAt: Date;
  validUntil?: Date;
  notes?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  sideEffects?: string[];
}

export enum PrescriptionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface CreatePrescriptionRequest {
  patientId: string;
  appointmentId?: string;
  medications: Omit<Medication, 'sideEffects'>[];
  instructions: string;
  diagnosis: string;
  validUntil?: Date;
}