
export interface JournalEntry {
  id: string;
  title?: string;
  text: string;
  timestamp: string;
  emotion: EmotionResult;
  messages: ConversationMessage[]; // Adding messages array
}

export interface EmotionResult {
  label: EmotionType;
  score: number;
  color: string;
  feedback?: string;
  emotions?: Array<{label: EmotionType; score: number}>;
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
  | 'joy' | 'sadness' | 'anger'
  | 'admiration' | 'amusement' | 'annoyance' | 'approval' | 'caring'
  | 'curiosity' | 'desire' | 'disappointment' | 'disapproval' | 'disgust'
  | 'embarrassment' | 'excitement' | 'fear' | 'grief' | 'love' | 'gratitude'
  | 'nervousness' | 'optimism' | 'realization' | 'relief' | 'remorse' | 'pride' | 'confusion'
  | 'surprise' | 'neutral' | 'distress';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  emotion?: EmotionResult; // Add emotion to track per message
}
