export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: UserRole;
  alias: string;
  createdAt: string;
}

export type DoubtStatus = 'open' | 'answered' | 'resolved' | 'needs teacher review';

export interface Doubt {
  id: string;
  userId: string;
  questionText: string;
  subject: string;
  subTopic?: string;
  predictedTopic: string;
  topicConfidence: number;
  imageUrl?: string;
  isAnonymous: boolean;
  authorAlias: string;
  authorName?: string;
  authorEmail?: string;
  status: DoubtStatus;
  createdAt: string;
  answersCount?: number;
  hasVerifiedAnswer?: boolean;
}

export type AnswerSource = 'ai' | 'teacher';

export interface Answer {
  id: string;
  doubtId: string;
  userId: string;
  authorName: string;
  answerText: string;
  source: AnswerSource;
  isVerified: boolean;
  createdAt: string;
  rating?: 'up' | 'down' | 'none';
  thumbsUp?: number;
  thumbsDown?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  topic: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  score: number;
  total: number;
  percentage?: number;
  createdAt: string;
}

export interface SimilarDoubtMatch {
  doubt: Doubt;
  similarity: number;
  hasVerifiedAnswer: boolean;
}

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface DoubtReport {
  id: string;
  doubtId: string;
  userId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  doubtSnippet?: string;
}

export type NavigationPage = 
  | 'home' 
  | 'feed' 
  | 'ask' 
  | 'tutor'
  | 'quiz'
  | 'student-dashboard' 
  | 'teacher-dashboard'
  | 'admin-model'
  | 'privacy'
  | 'case-study';

export interface TutorChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
  isError?: boolean;
}


