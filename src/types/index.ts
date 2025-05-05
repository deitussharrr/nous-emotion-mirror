
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

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface LlamaModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface LlamaResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

