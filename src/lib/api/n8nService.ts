
// src/lib/api/n8nService.ts

import { EmotionResult } from '@/types';

interface GroqResponse {
  choices?: Array<{
    message: {
      content: string;
    }
  }>;
  error?: string;
}

// Use Vite environment variables
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Function to send emotion data to Groq (llama-3-8b) and get calming message
export const processEmotionWithOpenRouter = async (
  text: string,
  emotion: EmotionResult,
  entryId: string
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      console.log('Groq API key not configured');
      return generateFallbackMessage(emotion);
    }

    // Compose a prompt for a therapist-like, empathetic, calming message
    const userPrompt = `A journal entry: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}" (emotion: ${emotion.label}, score: ${emotion.score}).`;
    const systemPrompt = `You are an empathetic, supportive AI therapist. 
For the given journal entry and emotion, generate a calming, concise, and validating message (1-2 sentences) to help the user feel supported. 
Never mention that you are an AI or language model. Don't provide medical advice, just emotional support.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 120,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API request failed: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    return (
      (data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      generateFallbackMessage(emotion)
    );
  } catch (error) {
    console.error('Error processing emotion with Groq/Llama3:', error);
    return generateFallbackMessage(emotion);
  }
};

// Fallback message generator if Groq is not available
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

  const messages =
    messageTemplates[emotionLabel as keyof typeof messageTemplates] ||
    defaultMessages;
  return messages[emotionIntensity === 'strong' ? 0 : 1];
};

