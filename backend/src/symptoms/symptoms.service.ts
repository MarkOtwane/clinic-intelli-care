import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AiAnalysisService } from '../ai-analysis/ai-analysis.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';

/**
 * Service for managing patient symptoms
 * Handles symptom creation, retrieval, and triggers AI analysis
 */
@Injectable()
export class SymptomsService {
  constructor(
    private prisma: PrismaService,
    private aiAnalysisService: AiAnalysisService,
  ) {}

  /**
   * Create a new symptom entry and optionally trigger AI analysis
   * @param dto - Symptom data from patient
   * @param patientId - ID of the patient submitting symptoms
   * @param analyze - Whether to immediately trigger AI analysis
   * @returns Created symptom with optional prediction
   */
  async create(
    dto: CreateSymptomDto,
    patientId: string,
    analyze: boolean = true,
  ) {
    // Convert array of symptoms to a single description string for storage
    const description = Array.isArray(dto.description)
      ? dto.description.join(', ')
      : dto.description;

    // Create the symptom entry
    const symptom = await this.prisma.symptom.create({
      data: {
        patientId,
        description,
        location: dto.location,
        medications: dto.medications,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If analyze is true, trigger AI prediction
    if (analyze) {
      try {
        const prediction =
          await this.aiAnalysisService.createPredictionFromSymptom(
            symptom.id,
            dto.description,
          );
        return {
          ...symptom,
          prediction,
        };
      } catch (error) {
        // If prediction fails, still return the symptom
        console.error('Failed to create prediction:', error);
        return symptom;
      }
    }

    return symptom;
  }

  /**
   * Get all symptoms for a specific patient
   * @param patientId - Patient ID
   * @returns Array of symptoms with their predictions
   */
  async findByPatient(patientId: string) {
    return this.prisma.symptom.findMany({
      where: { patientId },
      include: {
        prediction: {
          include: {
            forwardedTo: {
              select: {
                id: true,
                name: true,
                specialization: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all symptoms (admin/doctor access)
   * @returns Array of all symptoms
   */
  async findAll() {
    return this.prisma.symptom.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
          },
        },
        prediction: {
          include: {
            forwardedTo: {
              select: {
                id: true,
                name: true,
                specialization: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single symptom by ID
   * @param id - Symptom ID
   * @param patientId - Optional patient ID for authorization check
   * @returns Symptom with related data
   */
  async findOne(id: string, patientId?: string) {
    const symptom = await this.prisma.symptom.findUnique({
      where: { id },
      include: {
        patient: true,
        prediction: {
          include: {
            forwardedTo: {
              select: {
                id: true,
                name: true,
                specialization: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!symptom) {
      throw new NotFoundException('Symptom not found');
    }

    // Check if user has access (patient can only see their own)
    if (patientId && symptom.patientId !== patientId) {
      throw new ForbiddenException(
        'You do not have permission to view this symptom',
      );
    }

    return symptom;
  }

  /**
   * Update an existing symptom
   * @param id - Symptom ID
   * @param dto - Update data
   * @param patientId - Patient ID for authorization
   * @returns Updated symptom
   */
  async update(id: string, dto: UpdateSymptomDto, patientId: string) {
    const symptom = await this.prisma.symptom.findUnique({
      where: { id },
    });

    if (!symptom) {
      throw new NotFoundException('Symptom not found');
    }

    if (symptom.patientId !== patientId) {
      throw new ForbiddenException('You can only update your own symptoms');
    }

    // Convert description array to string if provided
    const updateData: any = { ...dto };
    if (dto.description && Array.isArray(dto.description)) {
      updateData.description = dto.description.join(', ');
    }

    return this.prisma.symptom.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        prediction: true,
      },
    });
  }

  /**
   * Delete a symptom
   * @param id - Symptom ID
   * @param patientId - Patient ID for authorization
   * @returns Success message
   */
  async remove(id: string, patientId: string) {
    const symptom = await this.prisma.symptom.findUnique({
      where: { id },
    });

    if (!symptom) {
      throw new NotFoundException('Symptom not found');
    }

    if (symptom.patientId !== patientId) {
      throw new ForbiddenException('You can only delete your own symptoms');
    }

    await this.prisma.symptom.delete({
      where: { id },
    });

    return { message: 'Symptom deleted successfully' };
  }

  /**
   * Get symptoms that need doctor review
   * @param doctorId - Optional doctor ID to filter forwarded cases
   * @returns Array of symptoms forwarded to doctors
   */
  async getForwardedSymptoms(doctorId?: string) {
    const where: any = {
      prediction: {
        isNot: null,
        ...(doctorId && {
          forwardedToId: doctorId,
        }),
      },
    };

    return this.prisma.symptom.findMany({
      where,
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
        prediction: {
          include: {
            forwardedTo: {
              select: {
                id: true,
                name: true,
                specialization: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
