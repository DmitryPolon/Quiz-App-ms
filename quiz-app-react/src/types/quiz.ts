export interface QuizData {
  quizID?: number;
  title?: string;
  description?: string;
  timeLimitMinutes?: number;
  createdBy?: number | string; // Handle both number (from API) and string (from some components)
  createdAt?: string;
  categories?: string | null; // Handle both string and null values
  questions?: Array<{
    questionID?: number;
    sequenceNum?: number | null;
    sequenceId?: number | null;
    questionText?: string;
    difficulty?: string;
    difficultyID?: number;
    timeLimitSeconds?: number;
    answers?: Array<{
      answerID?: number;
      answerText?: string;
      isCorrect?: boolean;
    }>;
  }>;
}

export interface QuestionFormData {
  questionText: string;
  difficulty: number; // Changed to number to store DifficultyID
  timeLimitSeconds: number;
}

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
