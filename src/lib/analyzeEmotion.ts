import { EmotionType } from "../types";

const API_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";
const API_TOKEN = "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";

// Get feedback based on emotion that feels more like a therapist
export const getEmotionFeedback = (emotion: EmotionType, score: number): string => {
  const intensity = score > 0.8 ? "strongly " : score > 0.6 ? "quite " : "";
  
  switch (emotion) {
    case "joy":
      return `I can sense that you're ${intensity}feeling joy. It's wonderful to see you experiencing positive emotions. What's bringing you this happiness?`;
    case "sadness":
      return `I notice that you're ${intensity}feeling sad. It's completely okay to feel this way. Would you like to talk more about what's troubling you?`;
    case "anger":
      return `I can feel that you're ${intensity}angry. Your feelings are valid. Let's try to understand what's causing this anger and how we can address it.`;
    case "fear":
      return `I sense that you're ${intensity}experiencing fear or anxiety. Remember that you're safe here. Can you tell me more about what's causing these feelings?`;
    case "surprise":
      return `You seem ${intensity}surprised. Sometimes unexpected things can throw us off balance. Would you like to explore this feeling further?`;
    case "neutral":
      return "I sense that you're feeling quite balanced right now. This can be a good time for reflection. What's on your mind?";
    default:
      return "Thank you for sharing. Would you like to tell me more about how you're feeling?";
  }
};

// Get color for emotion visualization
export const getEmotionColor = (emotion: EmotionType): string => {
  switch (emotion) {
    case "joy":
      return "#FFD43B";
    case "surprise":
      return "#20C997"; 
    case "sadness":
      return "#5C7CFA";
    case "fear":
      return "#BE4BDB";
    case "anger":
      return "#FA5252";
    case "neutral":
      return "#CED4DA";
    default:
      return "#7f5af0";
  }
};

export const analyzeEmotion = async (text: string) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    const result = data[0];
    
    // Get the emotion with highest score
    const highestEmotion = result.reduce((prev: any, current: any) => {
      return (prev.score > current.score) ? prev : current;
    });
    
    const emotionType = highestEmotion.label.toLowerCase() as EmotionType;
    const color = getEmotionColor(emotionType);
    const feedback = getEmotionFeedback(emotionType, highestEmotion.score);

    return {
      label: emotionType,
      score: highestEmotion.score,
      color,
      feedback
    };
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    throw error;
  }
};
