
// src/lib/analyzeEmotion.ts

import { EmotionType } from "../types";

// Updated with a public model without token requirement
const EMOTION_API_URL = "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions-onnx";
const API_KEY = "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";

export const getEmotionColor = (emotion: EmotionType): string => {
  // Extended color palette for raw emotions
  switch (emotion) {
    case "joy": return "#FFD43B";
    case "sadness": return "#5C7CFA";
    case "anger": return "#FA5252";
    case "fear": return "#BE4BDB";
    case "surprise": return "#20C997";
    case "love": return "#FF8787";
    case "neutral": return "#CED4DA";
    case "admiration": return "#82B1FF";
    case "amusement": return "#98FB98";
    case "annoyance": return "#FF8A65";
    case "approval": return "#90CAF9";
    case "caring": return "#FFCC80";
    case "confusion": return "#B39DDB";
    case "curiosity": return "#81D4FA";
    case "desire": return "#F48FB1";
    case "disappointment": return "#CE93D8";
    case "disapproval": return "#EF9A9A";
    case "disgust": return "#A5D6A7";
    case "embarrassment": return "#FFAB91";
    case "excitement": return "#FFF59D";
    case "gratitude": return "#80CBC4";
    case "grief": return "#90A4AE";
    case "nervousness": return "#E1BEE7";
    case "optimism": return "#C5E1A5";
    case "pride": return "#FFE082";
    case "realization": return "#80DEEA";
    case "relief": return "#B2DFDB";
    case "remorse": return "#BCAAA4";
    default: return "#7f5af0";
  }
};

export const analyzeEmotion = async (text: string) => {
  const response = await fetch(EMOTION_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status: ${response.status}`);
  }

  const data = await response.json();
  
  // Direct use of model output
  if (Array.isArray(data) && data.length > 0) {
    // Get all emotions from the results
    const emotions = data[0];
    
    // Log all detected emotions
    console.log("All detected emotions:", emotions);
    
    // Get the top emotion
    const topEmotion = emotions.reduce((prev: any, curr: any) => {
      return prev.score > curr.score ? prev : curr;
    });
    
    console.log("Top emotion:", topEmotion.label, "with score:", topEmotion.score);
    
    return {
      label: topEmotion.label as EmotionType,
      score: topEmotion.score,
      color: getEmotionColor(topEmotion.label as EmotionType),
      emotions: emotions // Return all emotions for reference
    };
  }
  
  throw new Error("Invalid response format from emotion API");
};
