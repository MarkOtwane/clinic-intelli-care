import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import {
  CreatePrescriptionRequest,
  Prescription,
  PrescriptionStatus,
} from '../models/prescription.model';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  private apiUrl = `${environment.apiUrl}/prescriptions`;
  private selectedPrescriptionSubject =
    new BehaviorSubject<Prescription | null>(null);
  public selectedPrescription$ =
    this.selectedPrescriptionSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all prescriptions
   */
  getAllPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(this.apiUrl);
  }

  /**
   * Get prescription by ID
   */
  getPrescriptionById(id: string): Observable<Prescription> {
    return this.http
      .get<Prescription>(`${this.apiUrl}/${id}`)
      .pipe(
        tap((prescription) =>
          this.selectedPrescriptionSubject.next(prescription),
        ),
      );
  }

  /**
   * Get prescriptions by patient ID
   */
  getPrescriptionsByPatient(patientId: string): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  /**
   * Get prescriptions by doctor ID
   */
  getPrescriptionsByDoctor(doctorId: string): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  /**
   * Create new prescription
   */
  createPrescription(
    prescriptionData: CreatePrescriptionRequest,
  ): Observable<Prescription> {
    return this.http.post<Prescription>(this.apiUrl, prescriptionData);
  }

  /**
   * Update prescription
   */
  updatePrescription(
    id: string,
    prescriptionData: Partial<Prescription>,
  ): Observable<Prescription> {
    return this.http
      .patch<Prescription>(`${this.apiUrl}/${id}`, prescriptionData)
      .pipe(
        tap((prescription) => {
          if (this.selectedPrescriptionSubject.value?.id === id) {
            this.selectedPrescriptionSubject.next(prescription);
          }
        }),
      );
  }

  /**
   * Update prescription status
   */
  updatePrescriptionStatus(
    id: string,
    status: PrescriptionStatus,
  ): Observable<Prescription> {
    return this.http
      .patch<Prescription>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(
        tap((prescription) => {
          if (this.selectedPrescriptionSubject.value?.id === id) {
            this.selectedPrescriptionSubject.next(prescription);
          }
        }),
      );
  }

  /**
   * Delete prescription
   */
  deletePrescription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        if (this.selectedPrescriptionSubject.value?.id === id) {
          this.selectedPrescriptionSubject.next(null);
        }
      }),
    );
  }

  /**
   * Get my prescriptions (current authenticated patient)
   */
  getMyPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.apiUrl}/my-prescriptions`);
  }

  /**
   * Get active prescriptions for a patient
   */
  getActivePrescriptions(patientId: string): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(
      `${this.apiUrl}/patient/${patientId}/active`,
    );
  }

  /**
   * Get prescription history for a patient
   */
  getPrescriptionHistory(patientId: string): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(
      `${this.apiUrl}/patient/${patientId}/history`,
    );
  }

  /**
   * Renew prescription
   */
  renewPrescription(id: string, validUntil?: Date): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.apiUrl}/${id}/renew`, {
      validUntil,
    });
  }

  /**
   * Set selected prescription
   */
  setSelectedPrescription(prescription: Prescription | null): void {
    this.selectedPrescriptionSubject.next(prescription);
  }

  /**
   * Clear selected prescription
   */
  clearSelectedPrescription(): void {
    this.selectedPrescriptionSubject.next(null);
  }
}
