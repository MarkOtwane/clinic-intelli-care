import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

/**
 * AI Analysis Service
 * Handles symptom analysis, disease prediction, and doctor forwarding
 */
@Injectable()
export class AiAnalysisService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  /**
   * AI-powered symptom analysis using Google Gemini
   * @param symptoms - Array of symptom strings
   * @param additionalInfo - Additional context information
   * @returns AI analysis results
   */
  private async analyzeSymptomsWithAI(
    symptoms: string[],
    additionalInfo?: {
      severity?: string;
      duration?: number;
      location?: string;
      medications?: string[];
    },
  ) {
    return this.aiService.analyzeSymptoms(symptoms, additionalInfo);
  }

  /**
   * Infer doctor category based on disease name
   * @param disease - Disease name
   * @returns Doctor category string
   */
  private inferDoctorCategory(disease: string): string {
    const diseaseLower = disease.toLowerCase();

    if (diseaseLower.includes('heart') || diseaseLower.includes('cardiac')) {
      return 'Cardiologist';
    }
    if (
      diseaseLower.includes('lung') ||
      diseaseLower.includes('respiratory') ||
      diseaseLower.includes('pneumonia') ||
      diseaseLower.includes('bronchitis')
    ) {
      return 'Pulmonologist';
    }
    if (
      diseaseLower.includes('stomach') ||
      diseaseLower.includes('digestive') ||
      diseaseLower.includes('gastro')
    ) {
      return 'Gastroenterologist';
    }
    if (diseaseLower.includes('skin') || diseaseLower.includes('rash')) {
      return 'Dermatologist';
    }
    if (
      diseaseLower.includes('mental') ||
      diseaseLower.includes('depression') ||
      diseaseLower.includes('anxiety')
    ) {
      return 'Psychiatrist';
    }
    if (
      diseaseLower.includes('bone') ||
      diseaseLower.includes('joint') ||
      diseaseLower.includes('arthritis')
    ) {
      return 'Orthopedic Surgeon';
    }
    if (diseaseLower.includes('eye') || diseaseLower.includes('vision')) {
      return 'Ophthalmologist';
    }
    if (
      diseaseLower.includes('ear') ||
      diseaseLower.includes('nose') ||
      diseaseLower.includes('throat')
    ) {
      return 'ENT Specialist';
    }
    if (diseaseLower.includes('kidney') || diseaseLower.includes('urinary')) {
      return 'Urologist';
    }
    if (
      diseaseLower.includes('brain') ||
      diseaseLower.includes('neurological') ||
      diseaseLower.includes('migraine')
    ) {
      return 'Neurologist';
    }
    if (
      diseaseLower.includes('infection') ||
      diseaseLower.includes('fever') ||
      diseaseLower.includes('flu') ||
      diseaseLower.includes('cold')
    ) {
      return 'General Practitioner';
    }

    // Default fallback
    return 'General Practitioner';
  }

  /**
   * Find appropriate doctor for forwarding based on disease prediction
   * @param topPrediction - The highest probability disease prediction
   * @returns Doctor ID or null if no suitable doctor found
   */
  private async findDoctorForForwarding(topPrediction: {
    doctorCategory: string;
    doctorSpecialization?: string[];
    severity?: string;
  }): Promise<string | null> {
    if (!topPrediction || !topPrediction.doctorCategory) {
      return null;
    }

    const specialization = topPrediction.doctorSpecialization?.[0] || null;

    // Find available doctors with matching specialization or category
    const doctors = await this.prisma.doctor.findMany({
      where: {
        available: true,
        ...(specialization && {
          specialization: {
            contains: specialization,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: {
        // Prioritize doctors with matching specialization
        specialization: specialization ? 'asc' : 'desc',
      },
      take: 1,
    });

    return doctors.length > 0 ? doctors[0].id : null;
  }

  /**
   * Analyze symptoms and create AI analysis
   * @param dto - Analysis creation data
   * @param patientId - Patient ID
   * @returns Analysis response with formatted data
   */
  async create(dto: CreateAnalysisDto, patientId: string) {
    if (!dto.symptoms || dto.symptoms.length === 0) {
      throw new BadRequestException('Symptoms are required for analysis');
    }

    // Analyze symptoms using AI (has built-in fallback)
    const aiAnalysis = await this.analyzeSymptomsWithAI(dto.symptoms, {
      severity: dto.severity,
      duration: dto.duration,
      location: dto.location,
      medications: dto.medications,
    });

    if (aiAnalysis.predictions.length === 0) {
      // If no predictions, create analysis with inconclusive result
      return this.prisma.analysis.create({
        data: {
          patientId,
          symptoms: dto.symptoms,
          predictedDiseases: [],
          recommendations:
            'Symptoms are inconclusive. Please provide more details or consult a doctor directly.',
          status: 'PENDING',
        },
      });
    }

    // Get top prediction
    const topPrediction = aiAnalysis.predictions[0];

    // Get top recommendation
    const topRecommendation =
      aiAnalysis.recommendations[0] ||
      'Please consult with a healthcare professional for proper diagnosis and treatment.';

    // Determine if case should be forwarded to doctor
    // Forward if probability is high enough (>= 50%) - convert from percentage back to decimal
    const shouldForward = topPrediction.probability >= 50;

    // Find appropriate doctor if forwarding is needed
    let forwardedDoctorId: string | null = null;
    if (shouldForward) {
      // For AI analysis, we need to determine doctor category based on the disease
      // This is a simplified approach - in production, you'd want more sophisticated mapping
      const doctorCategory = this.inferDoctorCategory(topPrediction.disease);
      forwardedDoctorId = await this.findDoctorForForwarding({
        doctorCategory,
        doctorSpecialization: [],
        severity: 'medium', // Default severity
      });
    }

    // Create analysis record
    const analysis = await this.prisma.analysis.create({
      data: {
        patientId,
        symptoms: dto.symptoms,
        predictedDiseases: aiAnalysis.predictions.map((p) => ({
          name: p.disease,
          probability: p.probability / 100, // Convert back to decimal
          description: p.description,
          doctorCategory: this.inferDoctorCategory(p.disease),
          recommendation: p.suggestedActions.join('. '),
        })),
        recommendations: topRecommendation,
        status: forwardedDoctorId ? 'PENDING' : 'PENDING',
        doctorId: forwardedDoctorId || null,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
          },
        },
        doctor: forwardedDoctorId
          ? {
              select: {
                id: true,
                name: true,
                specialization: true,
              },
            }
          : false,
      },
    });

    // Create notification if forwarded to doctor
    if (forwardedDoctorId) {
      try {
        const doctor = await this.prisma.doctor.findUnique({
          where: { id: forwardedDoctorId },
          include: { user: true },
        });

        if (doctor?.user?.id) {
          await this.prisma.notification.create({
            data: {
              title: 'New Patient Case Forwarded',
              message: `A new case with predicted ${topPrediction.disease} (${topPrediction.probability}% probability) has been forwarded to you for review.`,
              userId: doctor.user.id,
              type: 'BOTH',
            },
          });
        }
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    // Transform predictions to match frontend interface
    const transformedPredictions = aiAnalysis.predictions.map((pred) => ({
      disease: pred.disease,
      probability: pred.probability, // Already in percentage
      description: pred.description,
      suggestedActions: pred.suggestedActions,
    }));

    // Transform follow-up questions to match frontend interface
    const transformedFollowUpQuestions =
      aiAnalysis.followUpQuestions?.map((question, index) => ({
        id: `followup_${index}`,
        question,
        type: 'text' as const,
        required: false,
      })) || [];

    // Use confidence from AI analysis
    const confidence = aiAnalysis.confidence;

    // Format symptoms as SymptomInput object
    const symptomInput = {
      symptoms: dto.symptoms,
      severity: dto.severity,
      duration: dto.duration,
      additionalInfo: dto.additionalInfo,
      location: dto.location,
      medications: dto.medications,
    };

    // Return formatted response
    return {
      analysis: {
        id: analysis.id,
        patientId: analysis.patientId,
        symptoms: symptomInput,
        predictions: transformedPredictions,
        followUpQuestions: transformedFollowUpQuestions,
        recommendations: [analysis.recommendations], // Convert to array
        confidence,
        status: analysis.status,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
      followUpRequired: transformedFollowUpQuestions.length > 0,
      confidence,
    };
  }

  /**
   * Create prediction from existing symptom entry
   * Used when symptom is submitted first, then analyzed
   * @param symptomId - Symptom ID
   * @param symptoms - Array of symptom strings
   * @returns Created prediction
   */
  async createPredictionFromSymptom(
    symptomId: string,
    symptoms: string[],
  ): Promise<any> {
    const symptom = await this.prisma.symptom.findUnique({
      where: { id: symptomId },
    });

    if (!symptom) {
      throw new NotFoundException('Symptom not found');
    }

    // Analyze symptoms using AI
    const aiAnalysis = await this.analyzeSymptomsWithAI(symptoms);

    if (aiAnalysis.predictions.length === 0) {
      return null;
    }

    // Get top prediction for forwarding
    const topPrediction = aiAnalysis.predictions[0];
    // Forward if probability is high enough (>= 50%)
    const shouldForward = topPrediction.probability >= 50;

    // Find doctor for forwarding
    let forwardedDoctorId: string | null = null;
    if (shouldForward) {
      const doctorCategory = this.inferDoctorCategory(topPrediction.disease);
      forwardedDoctorId = await this.findDoctorForForwarding({
        doctorCategory,
        doctorSpecialization: [],
        severity: 'medium',
      });
    }

    // Create prediction record
    const prediction = await this.prisma.prediction.create({
      data: {
        symptomId,
        results: aiAnalysis.predictions.map((p) => ({
          name: p.disease,
          probability: p.probability / 100, // Convert to decimal
          description: p.description,
          doctorCategory: this.inferDoctorCategory(p.disease),
          recommendation: p.suggestedActions.join('. '),
        })),
        followUps: aiAnalysis.followUpQuestions ?? undefined,
        forwardedToId: forwardedDoctorId,
      },
      include: {
        symptom: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        forwardedTo: forwardedDoctorId
          ? {
              select: {
                id: true,
                name: true,
                specialization: true,
              },
            }
          : false,
      },
    });

    // Create notification if forwarded
    if (forwardedDoctorId) {
      try {
        const doctor = await this.prisma.doctor.findUnique({
          where: { id: forwardedDoctorId },
          include: { user: true },
        });

        if (doctor?.user?.id) {
          await this.prisma.notification.create({
            data: {
              title: 'New Patient Case Forwarded',
              message: `A new symptom case with predicted ${topPrediction.disease} has been forwarded to you.`,
              userId: doctor.user.id,
              type: 'BOTH',
            },
          });
        }
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    return prediction;
  }

  /**
   * Get all analyses
   * @returns Array of all analyses
   */
  async findAll() {
    return this.prisma.analysis.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get analyses by patient
   * @param patientId - Patient ID
   * @returns Array of patient's analyses
   */
  async findByPatient(patientId: string) {
    return this.prisma.analysis.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
    });
  }

  /**
   * Get analyses forwarded to a specific doctor
   * @param doctorId - Doctor ID
   * @returns Array of forwarded analyses
   */
  async findByDoctor(doctorId: string) {
    return this.prisma.analysis.findMany({
      where: {
        doctorId,
        status: { in: ['PENDING', 'REVIEWED'] },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single analysis by ID
   * @param id - Analysis ID
   * @returns Analysis with related data
   */
  async findOne(id: string) {
    const record = await this.prisma.analysis.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            phone: true,
          },
        },
        prescriptions: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!record) throw new NotFoundException('Analysis not found');
    return record;
  }

  /**
   * Update analysis (typically by doctor reviewing)
   * @param id - Analysis ID
   * @param dto - Update data
   * @returns Updated analysis
   */
  async update(id: string, dto: UpdateAnalysisDto) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    return this.prisma.analysis.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  /**
   * Persist/save an existing analysis (PATIENT only).
   * Frontend calls POST /ai-analysis/:id/save after analysis is shown.
   * We keep AI logic unchanged; this only verifies ownership and updates the record timestamp.
   */
  async save(id: string, patientId: string) {
    const analysis = await this.prisma.analysis.findFirst({
      where: { id, patientId },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    return this.prisma.analysis.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Confirm analysis diagnosis (by doctor)
   * @param id - Analysis ID
   * @param doctorId - Doctor ID confirming
   * @param confirmedDiagnosis - Confirmed diagnosis name
   * @returns Updated analysis
   */
  async confirmDiagnosis(
    id: string,
    doctorId: string,
    confirmedDiagnosis: string,
  ) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.doctorId !== doctorId) {
      throw new BadRequestException(
        'Only the assigned doctor can confirm this diagnosis',
      );
    }

    return this.prisma.analysis.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        doctorId,
        recommendations: `Doctor confirmed diagnosis: ${confirmedDiagnosis}. Please follow prescribed treatment.`,
        updatedAt: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  /**
   * Review analysis (doctor marks as reviewed)
   * @param id - Analysis ID
   * @param doctorId - Doctor ID reviewing
   * @returns Updated analysis
   */
  async reviewAnalysis(id: string, doctorId: string) {
    return this.prisma.analysis.update({
      where: { id },
      data: {
        status: 'REVIEWED',
        doctorId,
        updatedAt: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  /**
   * Generate follow-up questions based on initial analysis
   * AI will ask clarifying questions about the most probable disease
   * @param analysisId - Analysis ID to generate questions for
   * @param patientId - Patient ID for authorization
   * @returns Follow-up questions
   */
  async generateFollowUpQuestions(
    analysisId: string,
    patientId: string,
  ): Promise<any> {
    // Verify analysis exists and belongs to patient
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        patient: true,
      },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.patientId !== patientId) {
      throw new BadRequestException('You do not have access to this analysis');
    }

    // Don't generate new questions if already in final state
    if (analysis.analysisStatus === 'COMPLETED') {
      throw new BadRequestException(
        'Final analysis already generated. No more follow-up questions available.',
      );
    }

    // Get the top predicted disease from initial analysis
    const predictedDiseases = analysis.predictedDiseases as any[];
    if (!predictedDiseases || predictedDiseases.length === 0) {
      throw new BadRequestException('No predicted diseases in analysis');
    }

    const topDisease = predictedDiseases[0];
    const symptoms = analysis.symptoms as any[];

    // Generate follow-up questions using AI
    let followUpQuestions: any[] = [];
    try {
      // Call AI service to generate specific questions based on the disease
      const prompt = `
Based on the patient reporting these symptoms: ${symptoms.join(', ')}
And the AI analysis predicting: ${topDisease.name} (${topDisease.probability * 100}% probability)

Generate 3-5 specific follow-up questions to clarify the diagnosis. The questions should:
1. Help differentiate this disease from similar conditions
2. Explore specific symptoms or risk factors relevant to ${topDisease.name}
3. Be easy for the patient to understand and answer

Return ONLY a JSON array with no additional text, in this format:
[
  {
    "questionId": "q1",
    "question": "Question text here?",
    "description": "Why this question helps the diagnosis"
  }
]
`;

      // Use the raw AI service to generate questions
      const aiResponse = await this.aiService.askQuestion(prompt);

      // Parse the response - it should be JSON array
      try {
        followUpQuestions = JSON.parse(aiResponse);
      } catch {
        // If parsing fails, create default questions
        followUpQuestions = [
          {
            questionId: 'q1',
            question: `Have you experienced any worsening of your ${topDisease.name} symptoms?`,
            description: 'To assess disease progression',
          },
          {
            questionId: 'q2',
            question: `Do you have any other symptoms not mentioned initially?`,
            description: 'To identify additional clinical signs',
          },
          {
            questionId: 'q3',
            question: `How is your overall condition affecting your daily activities?`,
            description: 'To understand severity and impact',
          },
        ];
      }
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      throw new BadRequestException(
        'Failed to generate follow-up questions. Please try again.',
      );
    }

    // Store follow-up questions in the analysis
    const updatedAnalysis = await this.prisma.analysis.update({
      where: { id: analysisId },
      data: {
        followUpQuestions,
        analysisStatus: 'AWAITING_ANSWERS',
        updatedAt: new Date(),
      },
    });

    // Store in conversation history
    const conversationHistory = (analysis.conversationHistory || []) as any[];
    conversationHistory.push({
      type: 'FOLLOW_UP_QUESTIONS',
      timestamp: new Date(),
      questions: followUpQuestions,
    });

    await this.prisma.analysis.update({
      where: { id: analysisId },
      data: {
        conversationHistory,
      },
    });

    return {
      analysisId,
      disease: topDisease.name,
      probability: topDisease.probability,
      questions: followUpQuestions,
    };
  }

  /**
   * Submit follow-up answers and generate final analysis
   * @param analysisId - Analysis ID
   * @param dto - Follow-up answers from patient
   * @param patientId - Patient ID for authorization
   * @returns Final analysis
   */
  async submitFollowUpAnswers(
    analysisId: string,
    dto: any, // SubmitFollowUpAnswersDto
    patientId: string,
  ): Promise<any> {
    // Verify analysis exists and belongs to patient
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        patient: true,
      },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.patientId !== patientId) {
      throw new BadRequestException('You do not have access to this analysis');
    }

    if (analysis.analysisStatus !== 'AWAITING_ANSWERS') {
      throw new BadRequestException(
        'This analysis is not awaiting answers. Follow-up answers cannot be submitted.',
      );
    }

    if (!dto.answers || dto.answers.length === 0) {
      throw new BadRequestException('Please provide answers to the questions');
    }

    // Store answers
    const answers = dto.answers.map((a: any) => ({
      questionId: a.questionId,
      question: a.question,
      answer: a.answer,
    }));

    // Prepare prompt for final analysis with all available information
    const symptoms = analysis.symptoms as any[];
    const predictedDiseases = analysis.predictedDiseases as any[];
    const topDisease = predictedDiseases?.[0];

    const answersText = answers
      .map((a: any) => `Q: ${a.question}\nA: ${a.answer}`)
      .join('\n\n');

    const finalAnalysisPrompt = `
You are a medical AI assistant. A patient presented with these symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}

Initial AI Analysis predicted: ${topDisease?.name} (${(topDisease?.probability || 0) * 100}% probability)

The patient has now provided additional information in response to follow-up questions:
${answersText}

Based on ALL this information (initial symptoms + follow-up answers), provide a FINAL, MORE ACCURATE diagnosis.

Return ONLY a JSON object with no additional text in this exact format:
{
  "finalDiagnosis": "The most likely condition based on all information",
  "probability": 0.85,
  "reasoning": "Explanation of why this is the most likely diagnosis based on the combined information",
  "recommendations": [
    "Specific action/recommendation 1",
    "Specific action/recommendation 2",
    "Specific action/recommendation 3"
  ],
  "warnings": ["Any warning signs to watch for"]
}
`;

    let finalAnalysisData: any = {
      finalDiagnosis: topDisease?.name,
      probability: topDisease?.probability || 0.5,
      reasoning: 'Based on combined initial and follow-up information',
      recommendations: ['Consult with a healthcare professional'],
      warnings: [],
    };

    try {
      const aiResponse = await this.aiService.askQuestion(finalAnalysisPrompt);
      try {
        finalAnalysisData = JSON.parse(aiResponse);
      } catch {
        // Use default if parsing fails
        console.warn('Failed to parse final analysis response, using defaults');
      }
    } catch (error) {
      console.error('Error generating final analysis:', error);
      // Continue with default data
    }

    // Update analysis with final results - replace initial with final
    const updatedAnalysis = await this.prisma.analysis.update({
      where: { id: analysisId },
      data: {
        // Store answers
        followUpAnswers: answers,
        // Replace predicted diseases with final analysis
        predictedDiseases: [
          {
            name: finalAnalysisData.finalDiagnosis,
            probability: finalAnalysisData.probability,
            description: finalAnalysisData.reasoning,
            recommendation: finalAnalysisData.recommendations?.join('. '),
          },
        ],
        recommendations: finalAnalysisData.recommendations?.join('\n') || '',
        // Mark as completed
        analysisStatus: 'COMPLETED',
        updatedAt: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Update conversation history with final analysis
    const conversationHistory = (analysis.conversationHistory || []) as any[];
    conversationHistory.push({
      type: 'FINAL_ANALYSIS',
      timestamp: new Date(),
      analysis: {
        diagnosis: finalAnalysisData.finalDiagnosis,
        probability: finalAnalysisData.probability,
        reasoning: finalAnalysisData.reasoning,
        recommendations: finalAnalysisData.recommendations,
        warnings: finalAnalysisData.warnings,
      },
    });

    await this.prisma.analysis.update({
      where: { id: analysisId },
      data: {
        conversationHistory,
      },
    });

    // Format response
    return {
      analysis: {
        id: updatedAnalysis.id,
        patientId: updatedAnalysis.patientId,
        finalDiagnosis: finalAnalysisData.finalDiagnosis,
        probability: finalAnalysisData.probability,
        reasoning: finalAnalysisData.reasoning,
        recommendations: finalAnalysisData.recommendations,
        warnings: finalAnalysisData.warnings,
        status: updatedAnalysis.status,
        analysisStatus: updatedAnalysis.analysisStatus,
        createdAt: updatedAnalysis.createdAt,
        updatedAt: updatedAnalysis.updatedAt,
      },
    };
  }

  /**
   * Get conversation history for an analysis
   * Shows all interactions: initial analysis, follow-up questions, final analysis
   * @param analysisId - Analysis ID
   * @param userId - User ID for authorization (patient or doctor)
   * @returns Conversation history
   */
  async getConversationHistory(
    analysisId: string,
    userId: string,
  ): Promise<any> {
    // Get user info to check role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Get analysis
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    // Authorization check
    const isPatient = user.patientProfile?.id === analysis.patientId;
    const isDoctor = user.doctorProfile?.id === analysis.doctorId;
    const isAdmin = user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new BadRequestException(
        'You do not have access to this analysis history',
      );
    }

    // Build conversation history from stored data and analysis fields
    const history = analysis.conversationHistory
      ? (analysis.conversationHistory as any[])
      : [];

    // If no history exists, create it from current analysis state
    if (history.length === 0) {
      history.push({
        type: 'INITIAL',
        timestamp: analysis.createdAt,
        analysis: {
          symptoms: analysis.symptoms,
          predictions: analysis.predictedDiseases,
          recommendations: analysis.recommendations,
        },
      });

      if (analysis.followUpQuestions) {
        history.push({
          type: 'FOLLOW_UP_QUESTIONS',
          timestamp: analysis.updatedAt,
          questions: analysis.followUpQuestions,
        });
      }

      if (analysis.analysisStatus === 'COMPLETED') {
        history.push({
          type: 'FINAL_ANALYSIS',
          timestamp: analysis.updatedAt,
          analysis: {
            predictions: analysis.predictedDiseases,
            recommendations: analysis.recommendations,
          },
        });
      }
    }

    return {
      analysisId,
      patientName: analysis.patient.name,
      doctorName: analysis.doctor?.name || 'Not yet assigned',
      analysisStatus: analysis.analysisStatus,
      history,
    };
  }
}
