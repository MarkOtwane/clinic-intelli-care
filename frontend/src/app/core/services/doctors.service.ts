import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DoctorProfile, DoctorAvailability } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { Blog } from '../models/blog.model';
import { Prescription } from '../models/prescription.model';

export interface Doctor extends DoctorProfile {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };
}

export interface DoctorSearchFilters {
  specialty?: string;
  availability?: string;
  location?: string;
  consultationFee?: { min: number; max: number };
  rating?: number;
  isVerified?: boolean;
}

export interface DoctorSearchResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorsService {
  private readonly apiUrl = '/api/doctors';

  constructor(private http: HttpClient) {}

  // Basic CRUD operations
  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl);
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
  }

  createDoctor(doctor: Partial<Doctor>): Observable<Doctor> {
    return this.http.post<Doctor>(this.apiUrl, doctor);
  }

  updateDoctor(id: string, doctor: Partial<Doctor>): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.apiUrl}/${id}`, doctor);
  }

  deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Search and filtering
  searchDoctors(filters: DoctorSearchFilters, page = 1, limit = 10): Observable<DoctorSearchResponse> {
    const params: any = { 
      page: page.toString(), 
      limit: limit.toString() 
    };
    
    if (filters.specialty) params.specialty = filters.specialty;
    if (filters.availability) params.availability = filters.availability;
    if (filters.location) params.location = filters.location;
    if (filters.consultationFee) {
      params.minFee = filters.consultationFee.min.toString();
      params.maxFee = filters.consultationFee.max.toString();
    }
    if (filters.rating) params.rating = filters.rating.toString();
    if (filters.isVerified !== undefined) params.isVerified = filters.isVerified.toString();
    
    return this.http.get<DoctorSearchResponse>(`${this.apiUrl}/search`, { params });
  }

  getDoctorsBySpecialty(specialty: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/specialty/${specialty}`);
  }

  // Availability management
  getDoctorAvailability(doctorId: string): Observable<DoctorAvailability[]> {
    return this.http.get<DoctorAvailability[]>(`${this.apiUrl}/${doctorId}/availability`);
  }

  updateDoctorAvailability(doctorId: string, availability: DoctorAvailability[]): Observable<DoctorAvailability[]> {
    return this.http.put<DoctorAvailability[]>(`${this.apiUrl}/${doctorId}/availability`, { availability });
  }

  getAvailableTimeSlots(doctorId: string, date: string): Observable<{startTime: string, endTime: string}[]> {
    return this.http.get<{startTime: string, endTime: string}[]>(`${this.apiUrl}/${doctorId}/availability/${date}`);
  }

  // Doctor dashboard data
  getDoctorAppointments(doctorId: string, status?: string): Observable<Appointment[]> {
    if (status) {
      return this.http.get<Appointment[]>(`${this.apiUrl}/${doctorId}/appointments?status=${status}`);
    }
    return this.http.get<Appointment[]>(`${this.apiUrl}/${doctorId}/appointments`);
  }

  getDoctorPrescriptions(doctorId: string, patientId?: string): Observable<Prescription[]> {
    if (patientId) {
      return this.http.get<Prescription[]>(`${this.apiUrl}/${doctorId}/prescriptions?patientId=${patientId}`);
    }
    return this.http.get<Prescription[]>(`${this.apiUrl}/${doctorId}/prescriptions`);
  }

  getDoctorBlogs(doctorId: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/${doctorId}/blogs`);
  }

  // Profile management
  getDoctorProfile(userId: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/profile/${userId}`);
  }

  updateDoctorProfile(userId: string, profile: Partial<Doctor>): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.apiUrl}/profile/${userId}`, profile);
  }

  // Statistics
  getDoctorStats(doctorId: string): Observable<{
    totalAppointments: number;
    totalPatients: number;
    totalBlogs: number;
    averageRating: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${doctorId}/stats`);
  }

  // Verification
  verifyDoctor(doctorId: string): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.apiUrl}/${doctorId}/verify`, {});
  }

  // Reviews and ratings
  getDoctorReviews(doctorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${doctorId}/reviews`);
  }
}
