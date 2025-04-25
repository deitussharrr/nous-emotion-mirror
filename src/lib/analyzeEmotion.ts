// src/lib/analyzeEmotion.ts

import { pipeline } from "@huggingface/transformers";

const API_TOKEN = "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";

const emotionClassifier = await pipeline("text-classification", "bhadresh-savani/bert-base-uncased-emotion", {
  token: API_TOKEN,
  return_all_scores: true,
});

export const analyzeEmotion = async (text: string) => {
  try {
    const results = await emotionClassifier(text);
    const sortedResults = results[0].sort((a, b) => b.score - a.score);
    const topEmotion = sortedResults[0];

    return {
      label: topEmotion.label.toLowerCase(),
      score: topEmotion.score,
      allEmotions: sortedResults.map((res) => ({
        label: res.label.toLowerCase(),
        score: res.score,
      })),
    };
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    throw error;
  }
};
