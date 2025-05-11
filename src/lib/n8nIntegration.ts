// src/lib/n8nIntegration.ts

import { EmotionResult } from "@/types";

// Function to send emotion data to n8n and get calming message
export const processEmotionWithN8n = async (
  text: string,
  emotion: EmotionResult,
  entryId: string
): Promise<string> => {
  try {
    const webhookUrl = localStorage.getItem('n8nWebhookUrl');
    if (!webhookUrl) {
      console.log('n8n webhook URL not configured');
      return generateFallbackMessage(emotion);
    }

    // Call the n8n webhook with emotion data
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entryId,
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        emotionLabel: emotion.label,
        emotionScore: emotion.score,
        timestamp: new Date().toISOString(),
        requestType: 'calmingMessage'
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.calmingMessage || generateFallbackMessage(emotion);

  } catch (error) {
    console.error('Error processing emotion with n8n:', error);
    return generateFallbackMessage(emotion);
  }
};

// Fallback message generator if n8n is not available
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