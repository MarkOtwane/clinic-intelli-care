import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Appointment, AppointmentStatus, AppointmentType, AppointmentRequest, CreateAppointmentRequest } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private readonly apiUrl = '/api/appointments';

  constructor(private http: HttpClient) {}

  // Basic CRUD operations
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  /**
   * PATIENT-only endpoint (backend): GET /api/appointments/my-appointments
   */
  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/my-appointments`);
  }

  /**
   * DOCTOR-only endpoint (backend): GET /api/appointments/my-doctor-appointments
   */
  getMyDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/my-doctor-appointments`);
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  createAppointment(appointment: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  updateAppointment(id: string, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}`, appointment);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Advanced operations
  getPatientAppointments(patientId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getDoctorAppointments(doctorId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getAppointmentsByStatus(status: AppointmentStatus): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/status/${status}`);
  }

  // Appointment management
  confirmAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancelAppointment(id: string, reason?: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  rescheduleAppointment(id: string, newDate: Date, newTime: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/reschedule`, {
      date: newDate,
      time: newTime
    });
  }

  // Availability and scheduling
  getAvailableSlots(doctorId: string, date: Date): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/available-slots/${doctorId}?date=${date.toISOString().split('T')[0]}`
    );
  }

  checkAvailability(doctorId: string, date: Date, time: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, {
      params: {
        doctorId,
        date: date.toISOString().split('T')[0],
        time
      }
    });
  }

  // Statistics
  getAppointmentStats(doctorId?: string, patientId?: string): Observable<{
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
  }> {
    const params: any = {};
    if (doctorId) params.doctorId = doctorId;
    if (patientId) params.patientId = patientId;
    
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }

  // Search and filtering
  searchAppointments(filters: {
    doctorId?: string;
    patientId?: string;
    status?: AppointmentStatus;
    date?: Date;
    type?: AppointmentType;
  }): Observable<Appointment[]> {
    const params: any = {};

    if (filters.doctorId) params.doctorId = filters.doctorId;
    if (filters.patientId) params.patientId = filters.patientId;
    if (filters.status) params.status = filters.status;
    if (filters.date) params.date = filters.date.toISOString().split('T')[0];
    if (filters.type) params.type = filters.type;

    return this.http.get<Appointment[]>(`${this.apiUrl}/search`, { params });
  }

  // Emergency appointments
  createEmergencyAppointment(request: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/emergency`, request);
  }

  getEmergencyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/emergency`);
  }

  // Doctor availability management
  getAvailableDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctors`);
  }

  setDoctorAvailability(availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/availability`, availability);
  }

  getDoctorAvailability(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/availability`);
  }

  // Patient AI analyses for doctors
  getPatientAnalysesForDoctor(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patient-analyses`);
  }
}
