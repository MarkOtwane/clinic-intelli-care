import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { 
  SymptomInput, 
  AIAnalysis, 
  DiseasePrediction, 
  FollowUpQuestion,
  AnalysisStatus 
} from '../models/ai-analysis.model';

export interface SymptomAnalysisRequest {
  symptoms: string[];
  severity: string;
  duration: number;
  additionalInfo?: string;
  location?: string;
  medications?: string[];
}

export interface SymptomAnalysisResponse {
  analysis: AIAnalysis;
  followUpRequired: boolean;
  confidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private readonly apiUrl = '/api/ai-analysis';
  private currentAnalysisSubject = new BehaviorSubject<AIAnalysis | null>(null);
  public currentAnalysis$ = this.currentAnalysisSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Submit symptoms for AI analysis
   */
  analyzeSymptoms(request: SymptomAnalysisRequest): Observable<SymptomAnalysisResponse> {
    return this.http.post<SymptomAnalysisResponse>(`${this.apiUrl}/analyze`, request);
  }

  /**
   * Submit follow-up answers to complete analysis
   */
  submitFollowUp(analysisId: string, answers: any): Observable<AIAnalysis> {
    return this.http.post<AIAnalysis>(`${this.apiUrl}/${analysisId}/follow-up`, { answers });
  }

  /**
   * Get analysis by ID
   */
  getAnalysis(analysisId: string): Observable<AIAnalysis> {
    return this.http.get<AIAnalysis>(`${this.apiUrl}/${analysisId}`);
  }

  /**
   * Get patient's analysis history
   */
  getPatientAnalyses(patientId: string): Observable<AIAnalysis[]> {
    return this.http.get<AIAnalysis[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  /**
   * Get available symptoms list
   */
  getAvailableSymptoms(): Observable<{name: string, category: string}[]> {
    return this.http.get<{name: string, category: string}[]>(`${this.apiUrl}/symptoms`);
  }

  /**
   * Update analysis status
   */
  updateAnalysisStatus(analysisId: string, status: AnalysisStatus): Observable<AIAnalysis> {
    return this.http.patch<AIAnalysis>(`${this.apiUrl}/${analysisId}/status`, { status });
  }

  /**
   * Save analysis to patient's history
   */
  saveAnalysis(analysisId: string): Observable<AIAnalysis> {
    return this.http.post<AIAnalysis>(`${this.apiUrl}/${analysisId}/save`, {});
  }

  /**
   * Get disease information
   */
  getDiseaseInfo(diseaseName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/diseases/${encodeURIComponent(diseaseName)}`);
  }

  /**
   * Set current analysis for UI state management
   */
  setCurrentAnalysis(analysis: AIAnalysis | null): void {
    this.currentAnalysisSubject.next(analysis);
  }

  /**
   * Get current analysis
   */
  getCurrentAnalysis(): AIAnalysis | null {
    return this.currentAnalysisSubject.value;
  }

  /**
   * Clear current analysis
   */
  clearCurrentAnalysis(): void {
    this.currentAnalysisSubject.next(null);
  }

  /**
   * Validate symptoms input
   */
  validateSymptoms(symptoms: string[], duration: number, severity: string): {isValid: boolean, errors: string[]} {
    const errors: string[] = [];
    
    if (!symptoms || symptoms.length === 0) {
      errors.push('At least one symptom is required');
    }
    
    if (duration <= 0) {
      errors.push('Duration must be greater than 0');
    }
    
    if (!severity || !['MILD', 'MODERATE', 'SEVERE'].includes(severity)) {
      errors.push('Valid severity level is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}