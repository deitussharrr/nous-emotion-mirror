
export interface JournalEntry {
  id: string;
  title?: string;
  text: string;
  timestamp: string;
  emotion: EmotionResult;
  messages: ConversationMessage[]; // Adding messages array
}

export interface EmotionResult {
  label: string;
  score: number;
  color: string;
  feedback?: string;
  emotions?: Array<{label: string; score: number}>;
}

// Expanded to include all possible raw emotions from the model
export type EmotionType = 
  | 'admiration' | 'amusement' | 'anger' | 'annoyance' | 'approval' 
  | 'caring' | 'confusion' | 'curiosity' | 'desire' | 'disappointment' 
  | 'disapproval' | 'disgust' | 'embarrassment' | 'excitement' | 'fear' 
  | 'gratitude' | 'grief' | 'joy' | 'love' | 'nervousness' | 'optimism' 
  | 'pride' | 'realization' | 'relief' | 'remorse' | 'sadness' 
  | 'surprise' | 'neutral'
  | 'distress'; // <-- Add "distress"

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  emotion?: EmotionResult; // Add emotion to track per message
}
