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

export const analyzeEmotion = async (text: string) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text }),
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
    console.error("Error analyzing emotion:", error);
    throw error;
  }
};
