import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentDto } from './dtos/update-appointment.dto';

/**
 * Appointments Service
 * Handles appointment creation, management, and intelligent routing
 */
@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find available doctors based on AI analysis prediction
   * Automatically routes to appropriate doctor based on predicted disease
   * @param analysisId - Analysis ID with predictions
   * @returns Available doctors matching the prediction criteria
   */
  private async findDoctorsForAnalysis(analysisId: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      select: {
        predictedDiseases: true,
        doctorId: true, // Already assigned doctor
      },
    });

    if (!analysis) {
      return [];
    }

    // If already assigned, return that doctor
    if (analysis.doctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: analysis.doctorId },
      });
      return doctor ? [doctor] : [];
    }

    // Get top prediction to determine specialization needed
    const predictions = analysis.predictedDiseases as Array<{
      name: string;
      doctorCategory?: string;
      doctorSpecialization?: string[];
      probability?: number;
    }>;

    if (!predictions || predictions.length === 0) {
      return [];
    }

    const topPrediction = predictions[0];
    const specializations = topPrediction.doctorSpecialization || [
      topPrediction.doctorCategory,
    ];

    // Find available doctors with matching specializations
    // Note: Case-insensitive search may not be available in all Prisma versions
    // If 'mode: insensitive' doesn't work, remove it and use case-sensitive matching
    const doctors = await this.prisma.doctor.findMany({
      where: {
        available: true,
        OR: specializations.map((spec) => ({
          specialization: {
            contains: spec,
            // mode: 'insensitive', // Uncomment if your Prisma version supports it
          },
        })),
      },
      orderBy: {
        experience: 'desc',
      },
      take: 5, // Return top 5 options
    });

    return doctors;
  }

  /**
   * Check doctor availability for a specific date and time
   * Prevents double booking
   * @param doctorId - Doctor ID
   * @param date - Appointment date
   * @param time - Appointment time
   * @returns True if available, false otherwise
   */
  private async isDoctorAvailable(
    doctorId: string,
    date: Date,
    time: string,
  ): Promise<boolean> {
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId,
        date: {
          equals: date,
        },
        time,
        status: {
          not: 'CANCELLED',
        },
      },
    });

    return !conflictingAppointment;
  }

  /**
   * Create appointment with intelligent routing
   * Can auto-assign doctor based on AI analysis
   * @param dto - Appointment data
   * @param patientId - Patient ID
   * @param analysisId - Optional analysis ID for intelligent routing
   * @returns Created appointment
   */
  async createAppointment(
    dto: CreateAppointmentDto,
    patientId: string,
    analysisId?: string,
  ) {
    // Check if doctor is available
    const appointmentDate = new Date(dto.date);
    const isAvailable = await this.isDoctorAvailable(
      dto.doctorId,
      appointmentDate,
      dto.time,
    );

    if (!isAvailable) {
      throw new BadRequestException(
        'Doctor unavailable at this time. Please choose another day or time.',
      );
    }

    // If analysisId provided and no doctorId, auto-assign based on analysis
    if (analysisId && !dto.doctorId) {
      const suggestedDoctors = await this.findDoctorsForAnalysis(analysisId);
      if (suggestedDoctors.length > 0) {
        dto.doctorId = suggestedDoctors[0].id;
      } else {
        throw new BadRequestException(
          'No available doctors found for the predicted condition. Please select a doctor manually.',
        );
      }
    }

    // Verify doctor exists and is available
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.available) {
      throw new BadRequestException('Doctor is not currently available');
    }

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        date: appointmentDate,
        time: dto.time,
        notes: dto.notes,
        patient: { connect: { id: patientId } },
        doctor: { connect: { id: dto.doctorId } },
        status: 'PENDING',
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            phone: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Create notification for patient
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        include: { user: true },
      });

      if (patient?.user?.id) {
        await this.prisma.notification.create({
          data: {
            title: 'Appointment Scheduled',
            message: `Your appointment with Dr. ${doctor.name} (${doctor.specialization}) has been scheduled for ${dto.date} at ${dto.time}.`,
            userId: patient.user.id,
            type: 'BOTH',
            scheduledAt: appointmentDate,
          },
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    // Create notification for doctor
    try {
      const doctorUser = await this.prisma.doctor.findUnique({
        where: { id: dto.doctorId },
        include: { user: true },
      });

      if (doctorUser?.user?.id) {
        await this.prisma.notification.create({
          data: {
            title: 'New Appointment Scheduled',
            message: `A new appointment has been scheduled with ${appointment.patient.name} on ${dto.date} at ${dto.time}.`,
            userId: doctorUser.user.id,
            type: 'BOTH',
            scheduledAt: appointmentDate,
          },
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    return appointment;
  }

  /**
   * Get suggested doctors based on AI analysis
   * Used to show patients recommended doctors before booking
   * @param analysisId - Analysis ID
   * @returns Array of suggested doctors
   */
  async getSuggestedDoctors(analysisId: string) {
    return this.findDoctorsForAnalysis(analysisId);
  }

  /**
   * Get all appointments (ADMIN only)
   * @returns Array of all appointments
   */
  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            phone: true,
          },
        },
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
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get appointment by ID
   * @param id - Appointment ID
   * @returns Appointment with related data
   */
  async getAppointmentById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            phone: true,
            bio: true,
          },
        },
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
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  /**
   * Get appointments for a specific patient
   * @param patientId - Patient ID
   * @returns Array of patient's appointments
   */
  async getAppointmentsByPatient(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            phone: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get appointments for a specific doctor
   * @param doctorId - Doctor ID
   * @returns Array of doctor's appointments
   */
  async getAppointmentsByDoctor(doctorId: string) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
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
      orderBy: { date: 'asc' }, // Ascending for upcoming appointments first
    });
  }

  /**
   * Update appointment (DOCTOR/ADMIN only)
   * @param id - Appointment ID
   * @param dto - Update data
   * @param userRole - User role
   * @returns Updated appointment
   */
  async updateAppointment(
    id: string,
    dto: UpdateAppointmentDto,
    userRole: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (userRole !== 'DOCTOR' && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only doctors or admins can update appointment status',
      );
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.date && { date: new Date(dto.date) }),
        updatedAt: new Date(),
      },
      include: {
        doctor: true,
        patient: true,
      },
    });

    // Notify patient if status changed
    if (dto.status && dto.status !== appointment.status) {
      try {
        const patient = await this.prisma.patient.findUnique({
          where: { id: appointment.patientId },
          include: { user: true },
        });

        if (patient?.user?.id) {
          await this.prisma.notification.create({
            data: {
              title: 'Appointment Status Updated',
              message: `Your appointment status has been updated to ${dto.status}.`,
              userId: patient.user.id,
              type: 'BOTH',
            },
          });
        }
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    return updatedAppointment;
  }

  /**
   * Cancel appointment (PATIENT only, own appointments)
   * @param id - Appointment ID
   * @param patientId - Patient ID
   * @returns Updated appointment
   */
  async cancelAppointment(id: string, patientId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.patientId !== patientId) {
      throw new ForbiddenException('You can only cancel your own appointment');
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('Appointment is already cancelled');
    }

    const cancelledAppointment = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED', updatedAt: new Date() },
      include: {
        doctor: true,
        patient: true,
      },
    });

    // Notify doctor
    try {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: appointment.doctorId },
        include: { user: true },
      });

      if (doctor?.user?.id) {
        await this.prisma.notification.create({
          data: {
            title: 'Appointment Cancelled',
            message: `Appointment with ${cancelledAppointment.patient.name} on ${appointment.date} at ${appointment.time} has been cancelled.`,
            userId: doctor.user.id,
            type: 'BOTH',
          },
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    return cancelledAppointment;
  }

  /**
   * Get available time slots for a doctor on a specific date
   * @param doctorId - Doctor ID
   * @param date - Date to check
   * @returns Array of available time slots
   */
  async getAvailableTimeSlots(doctorId: string, date: string) {
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Check if doctor has availability set for this day
    const doctorAvailabilities = await this.prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek,
        isAvailable: true,
      },
      orderBy: { startTime: 'asc' },
    });

    if (doctorAvailabilities.length === 0) {
      return []; // Doctor not available on this day
    }

    // Get all appointments for the doctor on this date
    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          equals: appointmentDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        time: true,
      },
    });

    const bookedTimes = appointments.map((apt) => apt.time);

    // Generate available time slots based on doctor's availability
    const availableSlots: string[] = [];

    for (const availability of doctorAvailabilities) {
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);

      let currentHour = startHour;
      let currentMinute = startMinute;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute < endMinute)
      ) {
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        if (!bookedTimes.includes(timeSlot)) {
          availableSlots.push(timeSlot);
        }

        // Add 30 minutes
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
      }
    }

    return availableSlots;
  }

  /**
   * Get available doctors for appointment booking
   * @returns Array of available doctors with basic info
   */
  async getAvailableDoctors() {
    const doctors = await this.prisma.doctor.findMany({
      where: {
        available: true,
        availabilities: {
          some: {
            isAvailable: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        specialization: true,
        experience: true,
        bio: true,
        availabilities: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    // Transform to include available days
    return doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      bio: doctor.bio,
      availability: doctor.availabilities.map(avail => ({
        day: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
      })),
    }));
  }

  /**
   * Set doctor availability for a specific day
   * @param doctorId - Doctor ID
   * @param dayOfWeek - Day of week (0-6)
   * @param startTime - Start time (HH:mm)
   * @param endTime - End time (HH:mm)
   * @param isAvailable - Whether available
   * @returns Updated availability
   */
  async setDoctorAvailability(
    doctorId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isAvailable: boolean,
  ) {
    return this.prisma.doctorAvailability.upsert({
      where: {
        doctorId_dayOfWeek: {
          doctorId,
          dayOfWeek,
        },
      },
      update: {
        startTime,
        endTime,
        isAvailable,
      },
      create: {
        doctorId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
      },
    });
  }

  /**
   * Get doctor availability
   * @param doctorId - Doctor ID
   * @returns Array of availability slots
   */
  async getDoctorAvailability(doctorId: string) {
    return this.prisma.doctorAvailability.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  /**
   * Get patient AI analyses for a doctor (patients who have booked appointments)
   * @param doctorId - Doctor ID
   * @returns Array of analyses with patient info
   */
  async getPatientAnalysesForDoctor(doctorId: string) {
    // Get all appointments for this doctor
    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED'],
        },
      },
      select: {
        patientId: true,
      },
    });

    const patientIds = [...new Set(appointments.map(apt => apt.patientId))];

    if (patientIds.length === 0) {
      return [];
    }

    // Get analyses for these patients
    return this.prisma.analysis.findMany({
      where: {
        patientId: {
          in: patientIds,
        },
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
