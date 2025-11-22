export interface Symptom {
  id: string;
  name: string;
  category: string;
  severity: SymptomSeverity;
  description?: string;
  duration?: number; // in days
  createdAt: Date;
}

export enum SymptomSeverity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE'
}

export interface SymptomInput {
  symptoms: string[];
  severity: SymptomSeverity;
  duration: number;
  additionalInfo?: string;
  location?: string;
  medications?: string[];
}

export interface AIAnalysis {
  id: string;
  patientId: string;
  symptoms: SymptomInput;
  predictions: DiseasePrediction[];
  followUpQuestions?: FollowUpQuestion[];
  recommendations: string[];
  confidence: number;
  status: AnalysisStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiseasePrediction {
  disease: string;
  probability: number; // 0-100
  description: string;
  suggestedActions: string[];
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'multiple_choice' | 'text';
  options?: string[];
  required: boolean;
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FOLLOWUP_REQUIRED = 'FOLLOWUP_REQUIRED'
}