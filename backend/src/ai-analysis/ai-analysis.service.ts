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

    // Analyze symptoms using AI
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
}
