
import { EmotionResult } from "@/types";

// Define threshold for triggering emergency response
const NEGATIVE_EMOTIONS = ['sadness', 'anger', 'fear', 'disgust', 'grief', 'remorse', 'disappointment'];
const THRESHOLD_SCORE = 0.7; // Emotions with score above this will trigger alert

export const isExtremelyNegative = (emotion: EmotionResult): boolean => {
  // Check if the primary emotion is negative and above threshold
  if (NEGATIVE_EMOTIONS.includes(emotion.label.toLowerCase()) && emotion.score > THRESHOLD_SCORE) {
    return true;
  }
  
  // Check if any of the top emotions is extremely negative
  if (emotion.emotions) {
    for (const subEmotion of emotion.emotions) {
      if (
        NEGATIVE_EMOTIONS.includes(subEmotion.label.toLowerCase()) && 
        subEmotion.score > THRESHOLD_SCORE
      ) {
        return true;
      }
    }
  }
  
  return false;
};

export const triggerEmergencyResponse = async (
  text: string, 
  emotion: EmotionResult,
  entryId: string
): Promise<void> => {
  try {
    // Check if emergency contact is set up
    const contactJson = localStorage.getItem('emergencyContact');
    const webhookUrl = localStorage.getItem('n8nWebhookUrl');
    
    if (!contactJson || !webhookUrl) {
      console.log('Emergency contact or webhook URL not configured');
      return;
    }
    
    const contact = JSON.parse(contactJson);
    
    // Don't trigger if not enabled
    if (!contact.enabled) {
      return;
    }
    
    // If emotion meets criteria for emergency, trigger webhook
    if (isExtremelyNegative(emotion)) {
      console.log('Triggering emergency response for highly negative emotion:', emotion.label);
      
      // Call the n8n webhook with relevant data
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId,
          text: text.substring(0, 200) + (text.length > 200 ? '...' : ''), // Send truncated text for privacy
          emotionLabel: emotion.label,
          emotionScore: emotion.score,
          timestamp: new Date().toISOString(),
          contact: {
            name: contact.name,
            email: contact.email,
            phone: contact.phone || null
          }
        }),
        mode: 'no-cors' // Use no-cors mode to handle CORS issues
      });
      
      console.log('Emergency response triggered successfully');
    }
  } catch (error) {
    console.error('Error triggering emergency response:', error);
  }
};
