export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  notes?: string;
  aiAnalysisId?: string;
  isEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  TELEMEDICINE = 'TELEMEDICINE'
}

export interface AppointmentRequest {
  doctorId: string;
  preferredDate: Date;
  preferredTime: string;
  reason: string;
  type: AppointmentType;
  isEmergency: boolean;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  date: string;
  time: string;
  notes?: string;
  type?: AppointmentType;
  isEmergency?: boolean;
}

export interface DoctorSchedule {
  doctorId: string;
  date: Date;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}