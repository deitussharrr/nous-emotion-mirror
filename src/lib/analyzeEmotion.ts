
// src/lib/analyzeEmotion.ts

import { EmotionType } from "../types";

const API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/bert-base-uncased-emotion";
const API_TOKEN = "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";

export const getEmotionFeedback = (emotion: EmotionType, score: number): string => {
  const intensity = score > 0.8 ? "strongly " : score > 0.6 ? "quite " : "";

  switch (emotion) {
    case "joy":
      return `I sense that you're ${intensity}feeling joy. That's wonderful. What's bringing you this happiness?`;
    case "sadness":
      return `It seems you're ${intensity}feeling sad. It's okay to feel this way. Want to talk about it?`;
    case "anger":
      return `You're ${intensity}angry. Let's explore what's causing this and how we can work through it.`;
    case "fear":
      return `You're ${intensity}feeling fear. You're safe here—can you tell me more about what's troubling you?`;
    case "surprise":
      return `You're ${intensity}surprised. Sometimes surprises can be overwhelming—want to share more?`;
    case "love":
      return `You're ${intensity}feeling love. That's beautiful—would you like to talk about it more?`;
    case "neutral":
      return `You're feeling fairly balanced right now. Is there anything on your mind you'd like to explore?`;
    default:
      return `Thanks for sharing. Want to dive a little deeper into how you're feeling?`;
  }
};

export const getEmotionColor = (emotion: EmotionType): string => {
  switch (emotion) {
    case "joy": return "#FFD43B";
    case "sadness": return "#5C7CFA";
    case "anger": return "#FA5252";
    case "fear": return "#BE4BDB";
    case "surprise": return "#20C997";
    case "love": return "#FF8787";
    case "neutral": return "#CED4DA";
    default: return "#7f5af0";
  }
};

// Function to analyze text sentiment based on simple keyword matching as fallback
const analyzeTextLocally = (text: string) => {
  text = text.toLowerCase();
  const keywords = {
    joy: ["happy", "joy", "glad", "excited", "delighted", "wonderful", "great", "good"],
    sadness: ["sad", "depressed", "unhappy", "miserable", "down", "awful", "terrible", "hurt"],
    anger: ["angry", "mad", "furious", "annoyed", "upset", "frustrated", "irritated"],
    fear: ["afraid", "scared", "terrified", "anxious", "worried", "nervous", "fearful"],
    surprise: ["surprised", "shocked", "amazed", "astonished", "unexpected"],
    love: ["love", "affection", "care", "adore", "fond"],
    neutral: ["okay", "fine", "alright", "neutral", "normal"]
  };
  
  // Count keyword matches for each emotion
  const scores: Record<EmotionType, number> = {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    love: 0,
    neutral: 0
  };
  
  // Calculate keyword matches
  Object.entries(keywords).forEach(([emotion, words]) => {
    words.forEach(word => {
      if (text.includes(word)) {
        scores[emotion as EmotionType] += 1;
      }
    });
  });
  
  // Find emotion with highest score
  let topEmotion: EmotionType = "neutral";
  let highestScore = 0;
  
  Object.entries(scores).forEach(([emotion, score]) => {
    if (score > highestScore) {
      highestScore = score;
      topEmotion = emotion as EmotionType;
    }
  });
  
  // If no emotions detected, use neutral
  if (highestScore === 0) {
    topEmotion = "neutral";
  }
  
  // Calculate normalized score (0.5-0.9 range)
  const normalizedScore = highestScore > 0 ? Math.min(0.5 + (highestScore * 0.1), 0.9) : 0.5;
  
  return {
    label: topEmotion,
    score: normalizedScore
  };
};

export const analyzeEmotion = async (text: string) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text }),
      // Add timeout to prevent long waiting
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    const result = data[0];

    const topEmotion = result.reduce((prev: any, curr: any) => {
      return prev.score > curr.score ? prev : curr;
    });

    const label = topEmotion.label.toLowerCase() as EmotionType;
    const score = topEmotion.score;

    return {
      label,
      score,
      color: getEmotionColor(label),
      feedback: getEmotionFeedback(label, score),
    };
  } catch (error) {
    console.error("Error analyzing emotion, using fallback:", error);
    
    // Use local fallback analysis
    const fallbackResult = analyzeTextLocally(text);
    
    return {
      label: fallbackResult.label,
      score: fallbackResult.score,
      color: getEmotionColor(fallbackResult.label),
      feedback: getEmotionFeedback(fallbackResult.label, fallbackResult.score),
    };
  }
};
