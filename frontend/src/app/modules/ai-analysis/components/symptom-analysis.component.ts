import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { AiAnalysisService } from '../../../core/services/ai-analysis.service';
import { AuthService } from '../../../core/services/auth.service';
import { 
  SymptomInput, 
  SymptomSeverity, 
  AIAnalysis, 
  DiseasePrediction, 
  FollowUpQuestion 
} from '../../../core/models/ai-analysis.model';

@Component({
  selector: 'app-symptom-analysis',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    
    // Material modules
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTableModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  template: `
    <div class="symptom-analysis-container">
      <div class="header-section">
        <h1>AI Symptom Analysis</h1>
        <p class="subtitle">Describe your symptoms and get AI-powered insights about potential health conditions</p>
      </div>

      <!-- Symptom Input Form -->
      <mat-card class="input-card" *ngIf="!currentAnalysis">
        <mat-card-header>
          <mat-card-title>Enter Your Symptoms</mat-card-title>
          <mat-card-subtitle>Provide detailed information for accurate analysis</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="symptomForm" (ngSubmit)="analyzeSymptoms()">
            <!-- Symptoms Input -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Main Symptoms</mat-label>
              <input 
                matInput 
                formControlName="mainSymptoms"
                placeholder="e.g., headache, fever, nausea">
              <mat-hint>Describe your primary symptoms in detail</mat-hint>
            </mat-form-field>

            <!-- Severity -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Severity Level</mat-label>
              <mat-select formControlName="severity">
                <mat-option value="MILD">Mild - Slight discomfort</mat-option>
                <mat-option value="MODERATE">Moderate - Noticeable symptoms</mat-option>
                <mat-option value="SEVERE">Severe - Significant impact</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Duration -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Duration (days)</mat-label>
              <input 
                matInput 
                type="number" 
                formControlName="duration"
                placeholder="How many days have you had these symptoms?">
              <mat-hint>Number of days you've been experiencing symptoms</mat-hint>
            </mat-form-field>

            <!-- Additional Info -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Additional Information</mat-label>
              <textarea 
                matInput 
                formControlName="additionalInfo"
                rows="3"
                placeholder="Any additional details about your condition, recent activities, or circumstances">
              </textarea>
            </mat-form-field>

            <!-- Current Medications -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Medications</mat-label>
              <input 
                matInput 
                formControlName="medications"
                placeholder="List any medications you're currently taking">
              <mat-hint>Optional - helps avoid drug interactions</mat-hint>
            </mat-form-field>

            <!-- Location -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Your Location</mat-label>
              <input 
                matInput 
                formControlName="location"
                placeholder="City, State (for local health alerts)">
            </mat-form-field>

            <div class="button-row">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="symptomForm.invalid || isAnalyzing">
                <mat-spinner diameter="20" *ngIf="isAnalyzing"></mat-spinner>
                <mat-icon *ngIf="!isAnalyzing">smart_toy</mat-icon>
                <span *ngIf="!isAnalyzing">Analyze Symptoms</span>
                <span *ngIf="isAnalyzing">Analyzing...</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Analysis Results -->
      <div class="results-section" *ngIf="currentAnalysis">
        <mat-card class="results-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon color="primary">analytics</mat-icon>
              Analysis Results
            </mat-card-title>
            <mat-card-subtitle>
              Generated on {{ currentAnalysis.createdAt | date:'medium' }}
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <!-- Disease Predictions -->
            <div class="predictions-section">
              <h3>Potential Conditions</h3>
              <div class="prediction-item" *ngFor="let prediction of currentAnalysis.predictions">
                <div class="prediction-header">
                  <h4>{{ prediction.disease }}</h4>
                  <mat-chip 
                    [color]="getProbabilityColor(prediction.probability)"
                    selected>
                    {{ prediction.probability }}% match
                  </mat-chip>
                </div>
                <p class="prediction-description">{{ prediction.description }}</p>
                <div class="suggested-actions" *ngIf="prediction.suggestedActions.length > 0">
                  <strong>Recommended Actions:</strong>
                  <ul>
                    <li *ngFor="let action of prediction.suggestedActions">{{ action }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- General Recommendations -->
            <div class="recommendations-section">
              <h3>General Recommendations</h3>
              <ul class="recommendations-list">
                <li *ngFor="let recommendation of currentAnalysis.recommendations">
                  <mat-icon>check_circle</mat-icon>
                  {{ recommendation }}
                </li>
              </ul>
            </div>

            <mat-divider></mat-divider>

            <!-- Confidence Score -->
            <div class="confidence-section">
              <h3>Analysis Confidence</h3>
              <div class="confidence-bar">
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="currentAnalysis.confidence"
                  [color]="getConfidenceColor(currentAnalysis.confidence)">
                </mat-progress-bar>
                <span class="confidence-text">{{ currentAnalysis.confidence }}% confidence</span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="scheduleAppointment()">
              <mat-icon>event</mat-icon>
              Schedule Appointment
            </button>
            <button mat-button (click)="newAnalysis()">
              <mat-icon>add</mat-icon>
              New Analysis
            </button>
            <button mat-button (click)="saveAnalysis()">
              <mat-icon>save</mat-icon>
              Save Results
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Follow-up Questions -->
      <mat-card class="followup-card" *ngIf="currentAnalysis?.followUpQuestions?.length">
        <mat-card-header>
          <mat-card-title>
            <mat-icon color="accent">help_outline</mat-icon>
            Additional Information Needed
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <p>To provide more accurate results, please answer these follow-up questions:</p>
          
          <div class="followup-question" *ngFor="let question of currentAnalysis.followUpQuestions || []">
            <h4>{{ question.question }}</h4>
            
            <div [ngSwitch]="question.type">
              <!-- Yes/No Questions -->
              <mat-form-field appearance="outline" *ngSwitchCase="'yes_no'" class="full-width">
                <mat-select>
                  <mat-option value="yes">Yes</mat-option>
                  <mat-option value="no">No</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Multiple Choice -->
              <mat-form-field appearance="outline" *ngSwitchCase="'multiple_choice'" class="full-width">
                <mat-select>
                  <mat-option 
                    *ngFor="let option of question.options" 
                    [value]="option">
                    {{ option }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Text Input -->
              <mat-form-field appearance="outline" *ngSwitchCase="'text'" class="full-width">
                <input matInput>
              </mat-form-field>
            </div>
          </div>

          <div class="button-row">
            <button mat-raised-button color="primary" (click)="submitFollowUp()">
              Submit Answers
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Previous Analyses -->
      <mat-card class="history-card" *ngIf="analysisHistory.length > 0">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Previous Analyses
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="history-item" *ngFor="let analysis of analysisHistory">
            <div class="history-info">
              <strong>{{ analysis.createdAt | date:'short' }}</strong>
              <span class="confidence-badge">{{ analysis.confidence }}% confidence</span>
            </div>
            <div class="history-predictions">
              <mat-chip *ngFor="let prediction of analysis.predictions.slice(0, 2)">
                {{ prediction.disease }} ({{ prediction.probability }}%)
              </mat-chip>
            </div>
            <button mat-button (click)="viewAnalysis(analysis)">View Details</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .symptom-analysis-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
    }

    .header-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .header-section h1 {
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #7f8c8d;
      font-size: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .button-row {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 24px;
    }

    .input-card {
      margin-bottom: 32px;
    }

    .results-section {
      margin-bottom: 32px;
    }

    .predictions-section {
      margin-bottom: 24px;
    }

    .prediction-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      background: #fafafa;
    }

    .prediction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .prediction-header h4 {
      margin: 0;
      color: #2c3e50;
    }

    .prediction-description {
      color: #5d6d7e;
      margin-bottom: 12px;
    }

    .suggested-actions {
      margin-top: 12px;
    }

    .suggested-actions ul {
      margin: 8px 0;
      padding-left: 20px;
    }

    .recommendations-list {
      list-style: none;
      padding: 0;
    }

    .recommendations-list li {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: #34495e;
    }

    .recommendations-list mat-icon {
      margin-right: 8px;
      color: #27ae60;
    }

    .confidence-bar {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .confidence-text {
      font-weight: 500;
      color: #2c3e50;
    }

    .followup-card {
      margin-bottom: 32px;
      border-left: 4px solid #f39c12;
    }

    .followup-question {
      margin-bottom: 20px;
    }

    .history-card {
      border-left: 4px solid #3498db;
    }

    .history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #ecf0f1;
    }

    .history-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .confidence-badge {
      background: #3498db;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .history-predictions {
      display: flex;
      gap: 8px;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class SymptomAnalysisComponent implements OnInit {
  symptomForm: FormGroup;
  currentAnalysis: AIAnalysis | null = null;
  analysisHistory: AIAnalysis[] = [];
  isAnalyzing = false;
  availableSymptoms: {name: string, category: string}[] = [];

  severityLevels = [
    { value: SymptomSeverity.MILD, label: 'Mild', description: 'Slight discomfort' },
    { value: SymptomSeverity.MODERATE, label: 'Moderate', description: 'Noticeable symptoms' },
    { value: SymptomSeverity.SEVERE, label: 'Severe', description: 'Significant impact' }
  ];

  constructor(
    private fb: FormBuilder,
    private aiAnalysisService: AiAnalysisService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.symptomForm = this.fb.group({
      mainSymptoms: ['', Validators.required],
      severity: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      additionalInfo: [''],
      medications: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.loadAnalysisHistory();
    this.loadAvailableSymptoms();
  }

  analyzeSymptoms(): void {
    if (this.symptomForm.valid) {
      this.isAnalyzing = true;
      const formValue = this.symptomForm.value;

      const symptomInput: SymptomInput = {
        symptoms: formValue.mainSymptoms.split(',').map((s: string) => s.trim()),
        severity: formValue.severity,
        duration: formValue.duration,
        additionalInfo: formValue.additionalInfo,
        location: formValue.location,
        medications: formValue.medications ? formValue.medications.split(',').map((m: string) => m.trim()) : []
      };

      this.aiAnalysisService.analyzeSymptoms(symptomInput).subscribe({
        next: (response) => {
          this.isAnalyzing = false;
          this.currentAnalysis = response.analysis;
          this.aiAnalysisService.setCurrentAnalysis(response.analysis);
          
          this.snackBar.open('Analysis completed successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.isAnalyzing = false;
          this.snackBar.open(
            error.error?.message || 'Analysis failed. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    }
  }

  newAnalysis(): void {
    this.currentAnalysis = null;
    this.symptomForm.reset();
    this.aiAnalysisService.clearCurrentAnalysis();
  }

  saveAnalysis(): void {
    if (this.currentAnalysis) {
      this.aiAnalysisService.saveAnalysis(this.currentAnalysis.id).subscribe({
        next: () => {
          this.snackBar.open('Analysis saved successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to save analysis', 'Close', { duration: 3000 });
        }
      });
    }
  }

  scheduleAppointment(): void {
    // This would navigate to appointment scheduling with pre-filled information
    this.snackBar.open('Redirecting to appointment booking...', 'Close', { duration: 2000 });
  }

  submitFollowUp(): void {
    // Implementation for submitting follow-up answers
    this.snackBar.open('Follow-up answers submitted!', 'Close', { duration: 3000 });
  }

  viewAnalysis(analysis: AIAnalysis): void {
    this.currentAnalysis = analysis;
  }

  private loadAnalysisHistory(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.aiAnalysisService.getPatientAnalyses(user.id).subscribe({
          next: (analyses) => {
            this.analysisHistory = analyses;
          },
          error: () => {
            // Handle error silently for now
          }
        });
      }
    });
  }

  private loadAvailableSymptoms(): void {
    this.aiAnalysisService.getAvailableSymptoms().subscribe({
      next: (symptoms) => {
        this.availableSymptoms = symptoms;
      },
      error: () => {
        // Handle error silently for now
      }
    });
  }

  getProbabilityColor(probability: number): string {
    if (probability >= 80) return 'warn';
    if (probability >= 60) return 'accent';
    return 'primary';
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'primary';
    if (confidence >= 60) return 'accent';
    return 'warn';
  }
}