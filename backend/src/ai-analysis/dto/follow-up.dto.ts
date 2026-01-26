import { IsArray, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for requesting follow-up questions based on initial analysis
 */
export class GetFollowUpQuestionsDto {
  @IsNotEmpty()
  @IsString()
  analysisId: string;
}

/**
 * DTO for submitting follow-up answers and getting final analysis
 */
export class SubmitFollowUpAnswersDto {
  @IsNotEmpty()
  @IsString()
  analysisId: string;

  @IsNotEmpty()
  @IsArray()
  answers: {
    questionId: string;
    question: string;
    answer: string;
  }[];
}

/**
 * Follow-up question structure for AI to generate
 */
export interface FollowUpQuestion {
  id: string;
  questionId?: string;
  disease: string;
  probability: number;
  question: string;
  description: string;
}

/**
 * Conversation history entry
 */
export interface ConversationEntry {
  type: 'INITIAL' | 'FOLLOW_UP_QUESTIONS' | 'FINAL_ANALYSIS';
  timestamp: Date;
  analysis?: any;
  questions?: FollowUpQuestion[];
  answers?: { question: string; answer: string }[];
}
