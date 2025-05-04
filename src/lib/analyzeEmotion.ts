// src/lib/analyzeEmotion.ts

import { EmotionType } from "../types";

const API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/bert-base-uncased-emotion";
const API_TOKEN = "hf_aHZswSWTQu4vr4xnSDxMaL";

// Contextual responses based on conversation flow
export const getEmotionFeedback = (
  emotion: EmotionType,
  score: number,
  useGenZ: boolean = false,
  previousEmotion?: string
): string => {
  const intensity = score > 0.8 ? "strongly " : score > 0.6 ? "quite " : "";
  const emotionShift = previousEmotion && previousEmotion !== emotion;
  
  if (useGenZ) {
    // Gen Z style responses with contextual awareness
    switch (emotion) {
      case "joy":
        if (emotionShift && previousEmotion === "sadness") {
          return `Ayy, we love to see this energy shift! You're ${intensity}in your happy era now. Keep that vibe going!`;
        }
        return `Yaaaas! You're ${intensity}vibing with joy rn! That's fire. What's got you so hyped?`;
      
      case "sadness":
        if (emotionShift && previousEmotion === "joy") {
          return `Dang, your mood just did a 180. You were in your happy era but now ${intensity}in your feels. Wanna talk about what changed?`;
        }
        return `Ngl, you're ${intensity}in your feels right now. It's totally valid to be in your sad era. Wanna talk about it?`;
      
      case "anger":
        if (emotionShift) {
          return `I can tell you're ${intensity}pressed now. Something just switched up? Let's unpack what's got you triggered.`;
        }
        return `You're ${intensity}pressed about something. Valid. Let's unpack what's got you triggered.`;
      
      case "fear":
        if (emotionShift) {
          return `Your vibe just shifted. Now you're ${intensity}anxious? No worries, we can work through this together.`;
        }
        return `You're ${intensity}lowkey anxious rn. But it's chill, I'm here for you. What's got you spooked?`;
      
      case "surprise":
        return `That's ${intensity}wild! You're shook. Sometimes unexpected stuff hits different. Tea?`;
      
      case "love":
        return `You're ${intensity}catching feels! We stan that energy. Who's the main character in this story?`;
      
      case "neutral":
        if (emotionShift && (previousEmotion === "anger" || previousEmotion === "sadness" || previousEmotion === "fear")) {
          return `Seems like you're chilling out a bit. That's good to see. What's on your mind now?`;
        }
        return `You're just chillin' rn. Nothing too extra. Anything on your mind you wanna vibe with?`;
      
      default:
        return `Thanks for the update! No cap, I'm here to listen. Spill?`;
    }
  } else {
    // Regular friendly responses with contextual awareness
    switch (emotion) {
      case "joy":
        if (emotionShift && previousEmotion === "sadness") {
          return `I notice your mood has improved! You're ${intensity}feeling joy now. I'm glad to see this shift. What helped turn things around?`;
        }
        return `I see you're ${intensity}feeling joy! That's wonderful. What's bringing you this happiness?`;
      
      case "sadness":
        if (emotionShift && previousEmotion === "joy") {
          return `I notice your mood has shifted from joy to sadness. Something happened that changed how you're feeling?`;
        }
        return `I notice you're ${intensity}feeling sad. It's okay to feel down sometimes. Want to talk about what's going on?`;
      
      case "anger":
        if (emotionShift) {
          return `I sense that you've become ${intensity}angry. What changed in the last few moments?`;
        }
        return `You seem ${intensity}angry. That's completely valid. Let's explore what's bothering you.`;
      
      case "fear":
        if (emotionShift) {
          return `Your emotions seem to have shifted toward anxiety or fear. Let's take a breath together. What's causing this feeling?`;
        }
        return `I can tell you're ${intensity}feeling anxious or scared. You're safe here—can you share what's on your mind?`;
      
      case "surprise":
        return `You're ${intensity}surprised! Sometimes unexpected things can be a lot to process. Want to talk about it?`;
      
      case "love":
        return `It looks like you're ${intensity}feeling love. That's beautiful—would you like to share more?`;
      
      case "neutral":
        if (emotionShift && (previousEmotion === "anger" || previousEmotion === "sadness" || previousEmotion === "fear")) {
          return `You seem calmer now. How are you feeling about things at this moment?`;
        }
        return `You seem pretty balanced right now. How's everything going in your world today?`;
      
      default:
        return `Thanks for sharing. I'm here to listen whenever you need a friend.`;
    }
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

export const analyzeEmotion = async (text: string, useGenZ: boolean = false, previousEmotion?: string) => {
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
      feedback: getEmotionFeedback(label, score, useGenZ, previousEmotion),
    };
  } catch (error) {
    console.error("Error analyzing emotion, using fallback:", error);
    
    // Use local fallback analysis
    const fallbackResult = analyzeTextLocally(text);
    
    return {
      label: fallbackResult.label,
      score: fallbackResult.score,
      color: getEmotionColor(fallbackResult.label),
      feedback: getEmotionFeedback(fallbackResult.label, fallbackResult.score, useGenZ, previousEmotion),
    };
  }
};
