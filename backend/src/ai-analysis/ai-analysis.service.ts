import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import {
  defaultFollowUpQuestions,
  DiseaseRule,
  diseaseRules,
} from './rules/basic-rules';

/**
 * AI Analysis Service
 * Handles symptom analysis, disease prediction, and doctor forwarding
 */
@Injectable()
export class AiAnalysisService {
  constructor(private prisma: PrismaService) {}

  /**
   * Advanced symptom analysis with probability calculation
   * Considers keyword matching, required keywords, and symptom frequency
   * @param symptoms - Array of symptom strings
   * @returns Array of predicted diseases with probabilities and metadata
   */
  private analyzeSymptoms(symptoms: string[]): Array<{
    name: string;
    probability: number;
    doctorCategory: string;
    doctorSpecialization?: string[];
    recommendation: string;
    severity?: string;
    needsFollowUp?: boolean;
    followUpQuestions?: string[];
  }> {
    if (!symptoms || symptoms.length === 0) {
      return [];
    }

    // Normalize symptoms to lowercase for matching
    const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim());

    const results = diseaseRules.map((rule: DiseaseRule) => {
      // Calculate keyword matches
      const matchedKeywords = rule.keywords.filter((keyword) =>
        normalizedSymptoms.some((symptom) => {
          // Check for exact match or partial match (word contains keyword or vice versa)
          return (
            symptom === keyword.toLowerCase() ||
            symptom.includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(symptom)
          );
        }),
      );

      // Check if required keywords are present
      const hasRequiredKeywords =
        !rule.requiredKeywords ||
        rule.requiredKeywords.length === 0 ||
        rule.requiredKeywords.some((req) =>
          normalizedSymptoms.some(
            (symptom) =>
              symptom.includes(req.toLowerCase()) ||
              req.toLowerCase().includes(symptom),
          ),
        );

      if (!hasRequiredKeywords) {
        return null; // Skip this rule if required keywords are missing
      }

      // Calculate probability: weighted by keyword importance and match count
      const baseProbability = matchedKeywords.length / rule.keywords.length;

      // Boost probability if required keywords are present
      const requiredKeywordBonus = rule.requiredKeywords
        ? (rule.requiredKeywords.filter((req) =>
            normalizedSymptoms.some((symptom) =>
              symptom.includes(req.toLowerCase()),
            ),
          ).length /
            rule.requiredKeywords.length) *
          0.3
        : 0;

      // Normalize probability to 0-1 range
      const probability = Math.min(
        1,
        baseProbability * 0.7 +
          requiredKeywordBonus +
          (matchedKeywords.length > 0 ? 0.1 : 0),
      );

      // Determine if follow-up questions are needed
      const needsFollowUp =
        probability > 0 &&
        probability < (rule.minProbability || 0.5) &&
        rule.followUpQuestions &&
        rule.followUpQuestions.length > 0;

      return {
        name: rule.name,
        probability: Number(probability.toFixed(2)),
        doctorCategory: rule.doctorCategory,
        doctorSpecialization: rule.doctorSpecialization || [],
        recommendation: rule.recommendation,
        severity: rule.severity || 'medium',
        needsFollowUp,
        followUpQuestions:
          needsFollowUp && rule.followUpQuestions
            ? rule.followUpQuestions.slice(0, 3) // Limit to 3 questions
            : undefined,
      };
    });

    // Filter out null results and sort by probability
    return results
      .filter(
        (r): r is NonNullable<typeof r> => r !== null && r.probability > 0,
      )
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5); // Return top 5 predictions
  }

  /**
   * Determine if follow-up questions are needed based on prediction results
   * @param predictions - Array of disease predictions
   * @returns Array of follow-up questions or null
   */
  private determineFollowUpQuestions(
    predictions: Array<{
      name: string;
      probability: number;
      needsFollowUp?: boolean;
      followUpQuestions?: string[];
    }>,
  ): string[] | null {
    // If top prediction has low/medium probability and needs follow-up, return its questions
    if (
      predictions.length > 0 &&
      predictions[0].needsFollowUp &&
      predictions[0].followUpQuestions
    ) {
      return predictions[0].followUpQuestions;
    }

    // If all predictions are low probability, use default questions
    if (
      predictions.length > 0 &&
      predictions.every((p) => p.probability < 0.4)
    ) {
      return defaultFollowUpQuestions.slice(0, 4);
    }

    return null;
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
   * Create AI analysis from symptoms
   * @param dto - Analysis creation data
   * @param patientId - Patient ID
   * @returns Created analysis with predictions
   */
  async create(dto: CreateAnalysisDto, patientId: string) {
    if (!dto.symptoms || dto.symptoms.length === 0) {
      throw new BadRequestException('Symptoms are required for analysis');
    }

    // Analyze symptoms to get disease predictions
    const predictions = this.analyzeSymptoms(dto.symptoms);

    if (predictions.length === 0) {
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
    const topPrediction = predictions[0];

    // Determine follow-up questions
    const followUpQuestions = this.determineFollowUpQuestions(predictions);

    // Get top recommendation
    const topRecommendation =
      topPrediction.recommendation ||
      'Please consult with a healthcare professional for proper diagnosis and treatment.';

    // Determine if case should be forwarded to doctor
    // Forward if probability is high enough (>= 0.5) or severity is high
    const shouldForward =
      topPrediction.probability >= 0.5 || topPrediction.severity === 'high';

    // Find appropriate doctor if forwarding is needed
    let forwardedDoctorId: string | null = null;
    if (shouldForward) {
      forwardedDoctorId = await this.findDoctorForForwarding(topPrediction);
    }

    // Create analysis record
    const analysis = await this.prisma.analysis.create({
      data: {
        patientId,
        symptoms: dto.symptoms,
        predictedDiseases: predictions,
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
              message: `A new case with predicted ${topPrediction.name} (probability: ${topPrediction.probability}) has been forwarded to you for review.`,
              userId: doctor.user.id,
              type: 'BOTH',
            },
          });
        }
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    return {
      ...analysis,
      followUpQuestions,
      forwarded: !!forwardedDoctorId,
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

    // Analyze symptoms
    const predictions = this.analyzeSymptoms(symptoms);

    if (predictions.length === 0) {
      return null;
    }

    // Determine follow-up questions
    const followUpQuestions = this.determineFollowUpQuestions(predictions);

    // Get top prediction for forwarding
    const topPrediction = predictions[0];
    // Forward if probability is high enough (>= 0.5) or severity is high
    const shouldForward =
      topPrediction.probability >= 0.5 || topPrediction.severity === 'high';

    // Find doctor for forwarding
    let forwardedDoctorId: string | null = null;
    if (shouldForward) {
      forwardedDoctorId = await this.findDoctorForForwarding(topPrediction);
    }

    // Create prediction record
    const prediction = await this.prisma.prediction.create({
      data: {
        symptomId,
        results: predictions,
        followUps: followUpQuestions ?? undefined,
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
              message: `A new symptom case with predicted ${topPrediction.name} has been forwarded to you.`,
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
