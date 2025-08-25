
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

// Gen Z emotion types for modern language detection
export type EmotionType = 
  // Modern Gen Z emotions
  | 'vibing' | 'bossed' | 'stressed' | 'blessed' | 'mood' | 'cringe'
  | 'savage' | 'soft' | 'lit' | 'depressed' | 'anxious' | 'confident'
  | 'overwhelmed' | 'grateful' | 'frustrated' | 'inspired' | 'lonely'
  | 'peaceful' | 'angry' | 'excited' | 'tired' | 'hopeful' | 'confused'
  | 'proud' | 'nervous' | 'happy' | 'sad'
  
  // Legacy emotions (keeping for backward compatibility)
  | 'admiration' | 'amusement' | 'annoyance' | 'approval' | 'caring'
  | 'curiosity' | 'desire' | 'disappointment' | 'disapproval' | 'disgust'
  | 'embarrassment' | 'excitement' | 'fear' | 'grief' | 'love'
  | 'nervousness' | 'optimism' | 'realization' | 'relief' | 'remorse'
  | 'surprise' | 'neutral' | 'distress';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  emotion?: EmotionResult; // Add emotion to track per message
}
