
// src/lib/api/n8nService.ts

import { EmotionResult } from '@/types';

interface OpenRouterResponse {
  calmingMessage: string;
  success: boolean;
  error?: string;
}

const OPENROUTER_API_URL = import.meta.env.VITE_NEXT_PUBLIC_OPENROUTER_API_URL;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

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
      return "Please configure the OpenRouter API URL in your environment variables.";
    }

    // Call the OpenRouter API with emotion data
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
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
    return data.calmingMessage || "No response from LLM.";

  } catch (error) {
    console.error('Error processing emotion with OpenRouter:', error);
    return "Error connecting to OpenRouter. Please try again later.";
  }
};
