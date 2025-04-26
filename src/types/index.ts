
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

export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'love' | 'neutral';
