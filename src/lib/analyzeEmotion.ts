
import { EmotionType } from "../types";

const API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english";
const API_TOKEN = "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";

// Convert HuggingFace sentiment labels to more specific emotions
const mapSentimentToEmotion = (sentiment: string, score: number): EmotionType => {
  if (sentiment === "POSITIVE") {
    if (score > 0.95) return "joy";
    return "surprise";
  } else {
    if (score > 0.95) return "sadness";
    if (score > 0.8) return "fear";
    if (score > 0.6) return "anger";
    return "neutral";
  }
};

// Get feedback based on emotion
export const getEmotionFeedback = (emotion: EmotionType): string => {
  switch (emotion) {
    case "joy":
      return "You're feeling positive and uplifted. This is a great time to engage in activities you enjoy.";
    case "surprise":
      return "You're experiencing a sense of wonder or unexpected positivity. Being open to new experiences could be rewarding now.";
    case "sadness":
      return "You're processing some difficult feelings. Remember to be gentle with yourself and practice self-care.";
    case "fear":
      return "You're experiencing some anxiety or worry. Try some deep breathing and focus on what you can control.";
    case "anger":
      return "You're feeling some frustration. Consider what needs aren't being met and how to address them constructively.";
    case "neutral":
      return "Your emotions are balanced right now. This is a good time for reflection and planning.";
    default:
      return "Take a moment to sit with your feelings and reflect on what they might be telling you.";
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
    const result = Array.isArray(data) ? data[0] : data;
    
    // Transform HuggingFace result to our emotion format
    const emotionType = mapSentimentToEmotion(result[0].label, result[0].score);
    const color = getEmotionColor(emotionType);
    const feedback = getEmotionFeedback(emotionType);

    return {
      label: emotionType,
      score: result[0].score,
      color,
      feedback
    };
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    throw error;
  }
};
