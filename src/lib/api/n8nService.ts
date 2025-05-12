// src/lib/api/n8nService.ts

import { EmotionResult } from '@/types';
import { toast } from '@/components/ui/use-toast';

// OpenRouter API configuration with correct authentication
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = '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';

// Function to send emotion data to OpenRouter and get calming message
export const processEmotionWithOpenRouter = async (
  text: string,
  emotion: EmotionResult,
  entryId: string
): Promise<string> => {
  try {
    // Debug logs to help identify the issue
    console.log('OpenRouter API URL:', OPENROUTER_API_URL);
    console.log('OpenRouter API KEY exists:', !!OPENROUTER_API_KEY);
    console.log('Using model:', model);

    // Call the OpenRouter API with emotion data - adding specific required headers
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
<<<<<<< HEAD
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 
        'HTTP-Referer': 'https://emotion-journal.vercel.app', // Adding a fixed domain for OpenRouter
        'X-Title': 'Emotion Journal'
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an empathetic AI assistant helping someone process their emotions. "+
              "Provide a short, focused response (1-2 sentences) that acknowledges their feelings without "+
              "being repetitive. Don't ask follow-up questions unless necessary. Your goal is to make the "+
              "person feel heard and validated, not to continue a conversation. Be genuine and supportive."
          },
          {
            role: "user",
            content: `I'm feeling ${emotion.label} (confidence: ${Math.round(emotion.score * 100)}%) about this: "${text.substring(0, 200) + (text.length > 200 ? '...' : '')}"`
          }
        ],
        model: model
=======
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Model': "google/gemma-3-4b-it:free"
      },
      body: JSON.stringify({
        entryId,
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        emotionLabel: emotion.label,
        emotionScore: emotion.score,
        timestamp: new Date().toISOString(),
        requestType: 'calmingMessage'
>>>>>>> parent of 80c3cc6 (Fix: Improve AI response with Gemini and OpenRouter)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API request failed: ${response.status}`, errorText);
      return `Error connecting to OpenRouter (${response.status}). Please check your API key.`;
    }

    const data = await response.json();
    console.log('OpenRouter API response:', data);
    
    // Extract the content from the response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content || "No response from LLM.";
    }
    
    return "Unexpected response format from OpenRouter.";
  } catch (error) {
    console.error('Error processing emotion with OpenRouter:', error);
    return "Error connecting to OpenRouter. Please try again later.";
  }
};
<<<<<<< HEAD
=======

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
>>>>>>> parent of 80c3cc6 (Fix: Improve AI response with Gemini and OpenRouter)
