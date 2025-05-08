
export interface JournalEntry {
  id: string;
  text: string;
  timestamp: string;
  emotion: EmotionResult;
}

export interface EmotionResult {
  label: string;
  score: number;
  color: string;
  feedback: string;
}

// Expanded to include all possible raw emotions from the model
export type EmotionType = 
  | 'admiration' | 'amusement' | 'anger' | 'annoyance' | 'approval' 
  | 'caring' | 'confusion' | 'curiosity' | 'desire' | 'disappointment' 
  | 'disapproval' | 'disgust' | 'embarrassment' | 'excitement' | 'fear' 
  | 'gratitude' | 'grief' | 'joy' | 'love' | 'nervousness' | 'optimism' 
  | 'pride' | 'realization' | 'relief' | 'remorse' | 'sadness' 
  | 'surprise' | 'neutral';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}
