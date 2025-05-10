
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

// New function to generate comforting messages based on emotion
export const generateComfortingMessage = (emotion: EmotionResult): string => {
  const emotionLabel = emotion.label.toLowerCase();
  
  // Messages tailored to specific emotions
  if (NEGATIVE_EMOTIONS.includes(emotionLabel)) {
    switch (emotionLabel) {
      case 'sadness':
        return "It's okay to feel sad. Remember that emotions come and go like waves, and this feeling will pass. You're not alone in this journey.";
      case 'anger':
        return "I notice you're feeling frustrated. Taking deep breaths can help process these strong emotions. Your feelings are valid, and it's okay to feel them.";
      case 'fear':
        return "Fear is a natural response to uncertainty. Remember that you've overcome challenges before, and you have the strength to face this too.";
      case 'disgust':
        return "Sometimes we encounter things that feel wrong or uncomfortable. Your emotions are guiding you to understand your values better.";
      case 'grief':
        return "Grief is love with nowhere to go. It's okay to miss what you've lost, and healing happens in its own time. Be gentle with yourself.";
      case 'remorse':
        return "We all make mistakes. Acknowledging them is a sign of growth. Each day is an opportunity to make different choices.";
      case 'disappointment':
        return "Disappointment helps us understand what matters to us. It's okay to feel let down, but remember your worth isn't determined by outcomes.";
      default:
        return "I notice you're having a tough moment. Remember that all emotions are temporary, and it's okay to not be okay sometimes. Take a gentle breath and know you're not alone.";
    }
  }
  
  // For positive or neutral emotions
  if (emotionLabel === 'joy' || emotionLabel === 'love') {
    return "It's wonderful to see you feeling positive! These moments are worth celebrating and remembering when times get tough.";
  } else if (emotionLabel === 'neutral') {
    return "Taking time to reflect and process your thoughts is valuable. How are you really feeling beneath the surface?";
  } else {
    return "Thank you for sharing your thoughts. Writing about your experiences can help provide clarity and perspective.";
  }
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
