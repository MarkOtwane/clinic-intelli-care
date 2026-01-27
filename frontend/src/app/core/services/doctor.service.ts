import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateDoctorDto,
  Doctor,
  UpdateDoctorDto,
} from '../models/doctor.model';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private apiUrl = '/api/doctors';

  constructor(private http: HttpClient) {}

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
  }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl);
  }

  createDoctor(doctor: CreateDoctorDto): Observable<Doctor> {
    return this.http.post<Doctor>(this.apiUrl, doctor);
  }

  updateDoctor(id: string, doctor: UpdateDoctorDto): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.apiUrl}/${id}`, doctor);
  }

  setDoctorAvailability(id: string, available: boolean): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.apiUrl}/${id}/status`, {
      available,
    });
  }

  deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createDoctorAccount(doctorAccountData: any): Observable<Doctor> {
    return this.http.post<Doctor>(`${this.apiUrl}/account`, doctorAccountData);
  }

  getDoctorStats(id: string): Observable<{
    totalPatients: number;
    totalAppointments: number;
    todayAppointments: number;
    pendingPrescriptions: number;
  }> {
    return this.http.get<{
      totalPatients: number;
      totalAppointments: number;
      todayAppointments: number;
      pendingPrescriptions: number;
    }>(`${this.apiUrl}/${id}/stats`);
  }

  /**
   * Get doctor dashboard data (appointments, stats, etc.)
   * Uses current logged-in doctor's JWT token
   */
  getDoctorDashboard(): Observable<{
    doctor: {
      id: string;
      name: string;
      specialization: string;
      phone?: string;
      bio?: string;
      experience?: number;
      available: boolean;
    };
    stats: {
      totalAppointments: number;
      totalPrescriptions: number;
      totalPatients: number;
      pendingAppointments: number;
      upcomingAppointmentsCount: number;
    };
    upcomingAppointments: any[];
    recentAppointments: any[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }
}
