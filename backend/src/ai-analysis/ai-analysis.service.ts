import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyzeSymptomsDto } from './dto/analyze-symptoms.dto';

@Injectable()
export class AiAnalysisService {
  constructor(private prisma: PrismaService) {}

  private symptomDatabase = [
    {
      disease: 'Common Cold',
      keywords: ['cough', 'sore throat', 'runny nose', 'sneezing'],
      advice: 'Rest, stay hydrated, and use mild cold medication.',
      specialist: 'General Practitioner',
    },
    {
      disease: 'Malaria',
      keywords: ['fever', 'chills', 'sweating', 'headache', 'fatigue'],
      advice: 'Seek a malaria test and treatment immediately.',
      specialist: 'Tropical Medicine / GP',
    },
    {
      disease: 'Migraine',
      keywords: ['headache', 'nausea', 'light sensitivity', 'throbbing pain'],
      advice:
        'Avoid triggers, stay in a dark room, use pain relief medication.',
      specialist: 'Neurologist',
    },
    {
      disease: 'COVID-19',
      keywords: ['fever', 'dry cough', 'loss of taste', 'difficulty breathing'],
      advice: 'Get tested and isolate. Monitor oxygen levels.',
      specialist: 'Respiratory Specialist',
    },
  ];

  async analyzeSymptoms(dto: AnalyzeSymptomsDto, patientId: string) {
    const matches = this.symptomDatabase.map((entry) => {
      const matched = entry.keywords.filter((k) =>
        dto.symptoms.map((s) => s.toLowerCase()).includes(k.toLowerCase()),
      );
      const probability = (matched.length / entry.keywords.length) * 100;

      return {
        disease: entry.disease,
        probability: Number(probability.toFixed(1)),
        advice: entry.advice,
        specialist: entry.specialist,
      };
    });

    const filteredResults = matches
      .filter((m) => m.probability > 20)
      .sort((a, b) => b.probability - a.probability);

    const topResults = filteredResults.slice(0, 3);

    const recommendations = topResults
      .map(
        (r) =>
          `${r.disease} (${r.probability}%): ${r.advice} → See ${r.specialist}`,
      )
      .join('\n');

    // Save to DB
    const record = await this.prisma.analysis.create({
      data: {
        symptoms: dto.symptoms.join(', '),
        predictedDiseases: topResults,
        recommendations,
        patient: { connect: { id: patientId } },
      },
    });

    return { record, topResults };
  }

  async getPatientAnalyses(patientId: string) {
    return this.prisma.analysis.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAnalysisById(id: string) {
    return this.prisma.analysis.findUnique({
      where: { id },
    });
  }
}
