import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AIAnalysis, AnalysisStatus } from '../models/ai-analysis.model';

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

/**
 * CRITICAL FIX for "Refresh token missing" error:
 *
 * All HTTP requests in this service include `withCredentials: true` because:
 *
 * 1. The backend uses httpOnly refresh token cookies for security
 * 2. When a request's access token expires, the backend returns 401
 * 3. The auth interceptor automatically calls /refresh endpoint
 * 4. The refresh endpoint reads `req.cookies?.['refreshToken']`
 * 5. WITHOUT `withCredentials: true`, the browser doesn't send cookies with the request
 * 6. This causes "Refresh token missing" error, breaking the entire auth flow
 *
 * By including `withCredentials: true`, the browser sends httpOnly cookies,
 * allowing token refresh to work and the original request to be retried successfully.
 */
@Injectable({
  providedIn: 'root',
})
export class AiAnalysisService {
  private readonly apiUrl = '/api/ai-analysis';
  private currentAnalysisSubject = new BehaviorSubject<AIAnalysis | null>(null);
  public currentAnalysis$ = this.currentAnalysisSubject.asObservable();
  private readonly httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  /**
   * Submit symptoms for AI analysis
   */
  analyzeSymptoms(
    request: SymptomAnalysisRequest,
  ): Observable<SymptomAnalysisResponse> {
    return this.http.post<SymptomAnalysisResponse>(
      `${this.apiUrl}/analyze`,
      request,
      this.httpOptions,
    );
  }

  /**
   * Submit follow-up answers to complete analysis
   */
  submitFollowUp(analysisId: string, answers: any): Observable<AIAnalysis> {
    return this.http.post<AIAnalysis>(
      `${this.apiUrl}/${analysisId}/follow-up`,
      { answers },
      this.httpOptions,
    );
  }

  /**
   * Get analysis by ID
   */
  getAnalysis(analysisId: string): Observable<AIAnalysis> {
    return this.http.get<AIAnalysis>(
      `${this.apiUrl}/${analysisId}`,
      this.httpOptions,
    );
  }

  /**
   * Get patient's analysis history
   */
  getPatientAnalyses(patientId: string): Observable<AIAnalysis[]> {
    return this.http.get<AIAnalysis[]>(
      `${this.apiUrl}/patient/${patientId}`,
      this.httpOptions,
    );
  }

  /**
   * Get available symptoms list
   */
  getAvailableSymptoms(): Observable<{ name: string; category: string }[]> {
    return this.http.get<{ name: string; category: string }[]>(
      `${this.apiUrl}/symptoms`,
      this.httpOptions,
    );
  }

  /**
   * Update analysis status
   */
  updateAnalysisStatus(
    analysisId: string,
    status: AnalysisStatus,
  ): Observable<AIAnalysis> {
    return this.http.patch<AIAnalysis>(
      `${this.apiUrl}/${analysisId}/status`,
      { status },
      this.httpOptions,
    );
  }

  /**
   * Save analysis to patient's history
   */
  saveAnalysis(analysisId: string): Observable<AIAnalysis> {
    return this.http.post<AIAnalysis>(
      `${this.apiUrl}/${analysisId}/save`,
      {},
      this.httpOptions,
    );
  }

  /**
   * Get disease information
   */
  getDiseaseInfo(diseaseName: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/diseases/${encodeURIComponent(diseaseName)}`,
      this.httpOptions,
    );
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
  validateSymptoms(
    symptoms: string[],
    duration: number,
    severity: string,
  ): { isValid: boolean; errors: string[] } {
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
      errors,
    };
  }

  /**
   * Request follow-up questions for an existing analysis
   * @param analysisId - The analysis ID to get follow-up questions for
   * @returns Observable with follow-up questions
   */
  getFollowUpQuestions(analysisId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${analysisId}/follow-up-questions`,
      {},
      this.httpOptions,
    );
  }

  /**
   * Submit follow-up answers to get final analysis
   * @param analysisId - The analysis ID
   * @param answers - Array of answers to follow-up questions
   * @returns Observable with final analysis
   */
  submitFollowUpAnswers(
    analysisId: string,
    answers: { questionId: string; question: string; answer: string }[],
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${analysisId}/submit-answers`,
      { analysisId, answers },
      this.httpOptions,
    );
  }

  /**
   * Get conversation history for an analysis
   * Shows all interactions: initial analysis, follow-up questions, final analysis
   * @param analysisId - The analysis ID
   * @returns Observable with conversation history
   */
  getConversationHistory(analysisId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${analysisId}/history`,
      this.httpOptions,
    );
  }
}
