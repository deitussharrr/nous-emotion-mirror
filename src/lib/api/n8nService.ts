
// src/lib/api/n8nService.ts

import { EmotionResult } from '@/types';

interface OpenRouterResponse {
  calmingMessage: string;
  success: boolean;
  error?: string;
}

const OPENROUTER_API_URL = process.env.NEXT_PUBLIC_OPENROUTER_API_URL;

// Function to send emotion data to OpenRouter and get calming message
export const processEmotionWithOpenRouter = async (
  text: string,
  emotion: EmotionResult,
  entryId: string,
  model: string = "google/gemma-3-4b-it:free"
): Promise<string> => {
  try {
    if (!OPENROUTER_API_URL) {
      console.log('OpenRouter API URL not configured');
      return generateFallbackMessage(emotion);
    }

    // Call the OpenRouter API with emotion data
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Model': model
      },
      body: JSON.stringify({
        entryId,
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        emotionLabel: emotion.label,
        emotionScore: emotion.score,
        timestamp: new Date().toISOString(),
        requestType: 'calmingMessage',
        systemPrompt: "You are an empathetic AI assistant helping someone process their emotions. "+
          "Provide a short, focused response (1-2 sentences) that acknowledges their feelings without "+
          "being repetitive. Don't ask follow-up questions unless necessary. Your goal is to make the "+
          "person feel heard and validated, not to continue a conversation. Be genuine and supportive."
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API request failed: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.calmingMessage || generateFallbackMessage(emotion);

  } catch (error) {
    console.error('Error processing emotion with OpenRouter:', error);
    return generateFallbackMessage(emotion);
  }
};

// Fallback message generator if OpenRouter is not available
const generateFallbackMessage = (emotion: EmotionResult): string => {
  const emotionLabel = emotion.label.toLowerCase();
  const emotionIntensity = emotion.score > 0.7 ? 'strong' : 'moderate';

  const messageTemplates = {
    joy: [
      'Your happiness is contagious! Keep embracing these positive moments.',
      'What a wonderful feeling to experience! Cherish this joy.'
    ],
    sadness: [
      'I hear you, and it\'s okay to feel this way. Take gentle care of yourself.',
      'Remember that you\'re not alone in feeling this way. This too shall pass.'
    ],
    anger: [
      'I understand you\'re feeling frustrated. Take a deep breath with me.',
      'Your feelings are valid. Let\'s process this together.'
    ],
    fear: [
      'You\'re brave for acknowledging your fears. Let\'s face them together.',
      'Remember that courage isn\'t the absence of fear, but moving forward despite it.'
    ],
    surprise: [
      'Life is full of unexpected moments! How are you processing this surprise?',
      'Sometimes the unexpected can lead to wonderful discoveries.'
    ],
    love: [
      'What a beautiful emotion to experience! Let it fill your heart.',
      'Love has a way of making everything brighter. Embrace this feeling.'
    ],
    neutral: [
      'Taking time to reflect is valuable. What\'s on your mind?',
      'Sometimes a calm mind helps us see things more clearly.'
    ]
  };

  const defaultMessages = [
    'Thank you for sharing your feelings. You\'re doing great.',
    'Every emotion has its purpose. You\'re handling this well.'
  ];

  const messages = messageTemplates[emotionLabel as keyof typeof messageTemplates] || defaultMessages;
  return messages[emotionIntensity === 'strong' ? 0 : 1];
};
