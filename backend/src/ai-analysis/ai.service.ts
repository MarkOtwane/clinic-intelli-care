/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import OpenAI from 'openai';

export interface AISymptomAnalysis {
  predictions: Array<{
    disease: string;
    probability: number;
    description: string;
    suggestedActions: string[];
  }>;
  recommendations: string[];
  confidence: number;
  followUpQuestions?: string[];
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiApiKey) {
      this.openai = new OpenAI({ apiKey: openaiApiKey });
    }
  }

  /**
   * Analyze symptoms using Google Gemini AI or OpenAI ChatGPT
   * @param symptoms - Array of symptom strings
   * @param additionalInfo - Additional context information
   * @returns AI-powered analysis results
   */
  async analyzeSymptoms(
    symptoms: string[],
    additionalInfo?: {
      severity?: string;
      duration?: number;
      location?: string;
      medications?: string[];
    },
  ): Promise<AISymptomAnalysis> {
    try {
      // Try ChatGPT first if API key is available
      const useOpenAI = this.configService.get<boolean>('USE_OPENAI', false);

      if (useOpenAI && this.openai) {
        return await this.analyzeSymptomsWithChatGPT(symptoms, additionalInfo);
      }

      // Fall back to Gemini
      return await this.analyzeSymptomsWithGemini(symptoms, additionalInfo);
    } catch (error) {
      this.logger.error('AI analysis failed:', error);
      // Fallback to basic analysis if AI fails
      return this.fallbackAnalysis(symptoms);
    }
  }

  /**
   * Analyze symptoms using ChatGPT API
   * @param symptoms - Array of symptom strings
   * @param additionalInfo - Additional context information
   * @returns AI-powered analysis results
   */
  private async analyzeSymptomsWithChatGPT(
    symptoms: string[],
    additionalInfo?: {
      severity?: string;
      duration?: number;
      location?: string;
      medications?: string[];
    },
  ): Promise<AISymptomAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(symptoms, additionalInfo);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a medical AI assistant analyzing patient symptoms. Provide analysis in valid JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      });

      const aiResponse =
        response.choices[0].message.content || 'Unable to analyze symptoms';
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      this.logger.error('ChatGPT analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze symptoms using Google Gemini AI
   * @param symptoms - Array of symptom strings
   * @param additionalInfo - Additional context information
   * @returns AI-powered analysis results
   */
  private async analyzeSymptomsWithGemini(
    symptoms: string[],
    additionalInfo?: {
      severity?: string;
      duration?: number;
      location?: string;
      medications?: string[];
    },
  ): Promise<AISymptomAnalysis> {
    try {
      const apiKey = this.configService.get<string>('AI_API_KEY');
      const apiUrl = this.configService.get<string>('AI_API_URL');

      if (!apiKey || !apiUrl) {
        throw new Error('AI API configuration is missing');
      }

      // Build the prompt for medical symptom analysis
      const prompt = this.buildAnalysisPrompt(symptoms, additionalInfo);

      // Call Gemini API
      const response = await axios.post<GeminiResponse>(
        `${apiUrl}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1, // Low temperature for medical accuracy
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Parse the AI response
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      this.logger.error('AI analysis failed:', error);
      // Fallback to basic analysis if AI fails
      return this.fallbackAnalysis(symptoms);
    }
  }

  /**
   * Build a comprehensive prompt for AI analysis
   */
  private buildAnalysisPrompt(
    symptoms: string[],
    additionalInfo?: {
      severity?: string;
      duration?: number;
      location?: string;
      medications?: string[];
    },
  ): string {
    const symptomList = symptoms.join(', ');

    let prompt = `You are a medical AI assistant analyzing patient symptoms. Provide a detailed analysis based on the following symptoms: ${symptomList}.

Please respond in the following JSON format:
{
  "predictions": [
    {
      "disease": "Disease Name",
      "probability": 85,
      "description": "Brief description of the condition",
      "suggestedActions": ["Action 1", "Action 2", "Action 3"]
    }
  ],
  "recommendations": ["General recommendation 1", "General recommendation 2"],
  "confidence": 80,
  "followUpQuestions": ["Question 1?", "Question 2?"]
}

Guidelines:
- Provide 3-5 most likely conditions based on symptoms
- Probability should be realistic (0-100)
- Include evidence-based recommendations
- Consider symptom severity, duration, and combinations
- Suggest appropriate medical actions
- Ask relevant follow-up questions if more information is needed
- Be medically accurate and cautious about diagnoses
- Always recommend consulting healthcare professionals

`;

    if (additionalInfo) {
      prompt += `\nAdditional Information:\n`;
      if (additionalInfo.severity) {
        prompt += `- Severity: ${additionalInfo.severity}\n`;
      }
      if (additionalInfo.duration) {
        prompt += `- Duration: ${additionalInfo.duration} days\n`;
      }
      if (additionalInfo.location) {
        prompt += `- Location: ${additionalInfo.location}\n`;
      }
      if (additionalInfo.medications && additionalInfo.medications.length > 0) {
        prompt += `- Current medications: ${additionalInfo.medications.join(', ')}\n`;
      }
    }

    prompt += `\nProvide your analysis in valid JSON format only.`;

    return prompt;
  }

  /**
   * Parse AI response and convert to structured format
   */
  private parseAIResponse(aiResponse: string): AISymptomAnalysis {
    try {
      // Clean the response to extract JSON
      let jsonString = aiResponse.trim();

      // Remove markdown code blocks if present
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString
          .replace(/```json\s*/, '')
          .replace(/```\s*$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\s*/, '').replace(/```\s*$/, '');
      }

      // Parse JSON
      const parsed: any = JSON.parse(jsonString);

      // Validate and normalize the response
      return {
        predictions: (parsed.predictions ||
          []) as AISymptomAnalysis['predictions'],
        recommendations: parsed.recommendations || [],
        confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
        followUpQuestions: parsed.followUpQuestions || [],
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response:', error);
      this.logger.error('Raw response:', aiResponse);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  private fallbackAnalysis(symptoms: string[]): AISymptomAnalysis {
    // Provide basic analysis based on common symptoms
    const symptomText = symptoms.join(' ').toLowerCase();

    const predictions: AISymptomAnalysis['predictions'] = [];
    const recommendations = [
      'Please consult with a healthcare professional for proper diagnosis and treatment.',
      'Monitor your symptoms closely and seek immediate medical attention if they worsen.',
    ];
    let confidence = 30;

    // Basic pattern matching for common conditions
    if (symptomText.includes('fever') && symptomText.includes('cough')) {
      predictions.push({
        disease: 'Respiratory Infection',
        probability: 70,
        description:
          'Possible respiratory infection based on fever and cough symptoms',
        suggestedActions: [
          'Rest and stay hydrated',
          'Use over-the-counter fever reducers if needed',
          'Monitor temperature and symptoms',
          'Seek medical attention if symptoms persist or worsen',
        ],
      });
      confidence = 65;
    } else if (
      symptomText.includes('headache') &&
      symptomText.includes('nausea')
    ) {
      predictions.push({
        disease: 'Migraine or Tension Headache',
        probability: 60,
        description:
          'Headache with nausea may indicate migraine or other headache disorders',
        suggestedActions: [
          'Rest in a dark, quiet room',
          'Apply cold or warm compress',
          'Stay hydrated',
          'Consider over-the-counter pain relief',
        ],
      });
      confidence = 55;
    } else if (
      symptomText.includes('stomach') ||
      symptomText.includes('abdominal')
    ) {
      predictions.push({
        disease: 'Gastrointestinal Issue',
        probability: 55,
        description:
          'Abdominal symptoms may indicate various gastrointestinal conditions',
        suggestedActions: [
          'Monitor diet and avoid trigger foods',
          'Stay hydrated',
          'Consider antacids if appropriate',
          'Seek medical attention for severe pain or vomiting',
        ],
      });
      confidence = 45;
    }

    // Add general fallback if no specific matches
    if (predictions.length === 0) {
      predictions.push({
        disease: 'General Symptoms',
        probability: 40,
        description: 'Symptoms require professional medical evaluation',
        suggestedActions: [
          'Document all symptoms and their progression',
          'Note any triggers or patterns',
          'Consult healthcare provider for comprehensive assessment',
        ],
      });
    }

    return {
      predictions,
      recommendations,
      confidence,
      followUpQuestions: [
        'How long have you been experiencing these symptoms?',
        'Have you had similar symptoms before?',
        'Are your symptoms getting better, worse, or staying the same?',
        'Do you have any known medical conditions or allergies?',
      ],
    };
  }
}
