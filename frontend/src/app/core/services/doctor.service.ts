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
}
