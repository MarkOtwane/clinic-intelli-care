import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { diseaseRules } from './rules/basic-rules';

@Injectable()
export class AiAnalysisService {
  constructor(private prisma: PrismaService) {}

  private analyzeSymptoms(symptoms: string[]) {
    const results = diseaseRules.map((rule) => {
      const matchCount = rule.keywords.filter((k) =>
        symptoms.map((s) => s.toLowerCase()).includes(k.toLowerCase()),
      ).length;
      const probability = matchCount / rule.keywords.length;
      return {
        name: rule.name,
        probability: Number(probability.toFixed(2)),
        doctorCategory: rule.doctorCategory,
        recommendation: rule.recommendation,
      };
    });

    return results
      .filter((r) => r.probability > 0)
      .sort((a, b) => b.probability - a.probability);
  }

  async create(dto: CreateAnalysisDto, patientId: string) {
    const predictions = this.analyzeSymptoms(dto.symptoms);

    const topRecommendation = predictions[0]
      ? predictions[0].recommendation
      : 'Symptoms are inconclusive. Please provide more details or consult a doctor.';

    return this.prisma.analysis.create({
      data: {
        patientId,
        symptoms: dto.symptoms,
        predictedDiseases: predictions,
        recommendations: topRecommendation,
      },
    });
  }

  async findAll() {
    return this.prisma.analysis.findMany({
      include: { patient: true, doctor: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.analysis.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.analysis.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });
    if (!record) throw new NotFoundException('Analysis not found');
    return record;
  }

  async update(id: string, dto: UpdateAnalysisDto) {
    return this.prisma.analysis.update({
      where: { id },
      data: dto,
    });
  }
}
