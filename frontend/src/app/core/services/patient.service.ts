import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import {
  CreatePatientDto,
  Patient,
  UpdatePatientDto,
} from '../models/patient.model';

export interface PatientDashboardResponse {
  patient: Patient & { status?: string };
  stats: {
    upcomingAppointments: number;
    activePrescriptions: number;
    unreadNotifications: number;
  };
  upcomingAppointments: any[];
  activePrescriptions: any[];
  recentAnalyses: any[];
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;
  private selectedPatientSubject = new BehaviorSubject<Patient | null>(null);
  public selectedPatient$ = this.selectedPatientSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all patients
   */
  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  /**
   * Get patient by ID
   */
  getPatientById(id: string): Observable<Patient> {
    return this.http
      .get<Patient>(`${this.apiUrl}/${id}`)
      .pipe(tap((patient) => this.selectedPatientSubject.next(patient)));
  }

  /**
   * Create new patient
   */
  createPatient(patientData: CreatePatientDto): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patientData);
  }

  /**
   * Update patient
   */
  updatePatient(
    id: string,
    patientData: UpdatePatientDto,
  ): Observable<Patient> {
    return this.http.patch<Patient>(`${this.apiUrl}/${id}`, patientData).pipe(
      tap((patient) => {
        if (this.selectedPatientSubject.value?.id === id) {
          this.selectedPatientSubject.next(patient);
        }
      }),
    );
  }

  /**
   * Delete patient
   */
  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        if (this.selectedPatientSubject.value?.id === id) {
          this.selectedPatientSubject.next(null);
        }
      }),
    );
  }

  /**
   * Search patients
   */
  searchPatients(query: string): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/search`, {
      params: { q: query },
    });
  }

  /**
   * Get patient medical history
   */
  getPatientMedicalHistory(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${patientId}/medical-history`);
  }

  /**
   * Add medical history entry
   */
  addMedicalHistory(patientId: string, historyData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${patientId}/medical-history`,
      historyData,
    );
  }

  /**
   * Get patient appointments
   */
  getPatientAppointments(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${patientId}/appointments`);
  }

  /**
   * Get patient prescriptions
   */
  getPatientPrescriptions(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${patientId}/prescriptions`);
  }

  /**
   * Get the authenticated patient's dashboard data (resolves patient by userId server-side)
   */
  getMyDashboard(): Observable<PatientDashboardResponse> {
    return this.http
      .get<PatientDashboardResponse>(`${this.apiUrl}/dashboard`)
      .pipe(
        tap((response) => this.selectedPatientSubject.next(response.patient)),
      );
  }

  /**
   * Set selected patient
   */
  setSelectedPatient(patient: Patient | null): void {
    this.selectedPatientSubject.next(patient);
  }

  /**
   * Clear selected patient
   */
  clearSelectedPatient(): void {
    this.selectedPatientSubject.next(null);
  }
}
