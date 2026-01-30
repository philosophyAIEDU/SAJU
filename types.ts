export enum ServiceType {
  BASIC = "기본 사주 분석",
  COMPATIBILITY = "궁합 분석",
  FORTUNE = "운세 분석",
  CAREER = "적성 및 진로"
}

export interface UserInput {
  // Person 1 (Main)
  birthDate: string;
  birthTime: string;
  isTimeUnknown: boolean;
  gender: '남성' | '여성';
  calendarType: '양력' | '음력';
  
  // Person 2 (For Compatibility)
  person2BirthDate?: string;
  person2BirthTime?: string;
  person2Gender?: '남성' | '여성';
  relationshipType?: string;

  // Fortune
  targetYear?: number;

  // Career
  currentStatus?: string;
  interests?: string;
}

export interface WorkflowStep {
  id: number;
  name: string;
  expertName: string;
  description: string;
  status: 'pending' | 'loading' | 'completed';
}

export interface AnalysisResult {
  step1: string; // Structure
  step2: string; // Elements
  final: string; // Final Result
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}