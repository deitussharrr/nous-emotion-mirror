// src/lib/analyzeEmotion.ts
import { EmotionType, EmotionResult } from "../types";

// Updated with the bhadresh-savani/bert-base-uncased-emotion model
const EMOTION_API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/bert-base-uncased-emotion";
// NOTE: Make sure to set a valid Hugging Face API Key in the code below!
const API_KEY = "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"; // <-- Your provided Hugging Face API Key!

// N8N Workflow Configuration - Updated URL
const N8N_WORKFLOW_URL = "https://pumped-sincerely-coyote.ngrok-free.app/webhook/emotional-response-webhook";

// --- Add this definition ---
const NEGATIVE_EMOTIONS = [
  "sadness",
  "anger",
  "fear",
  "disgust",
  "grief",
  "remorse",
  "disappointment"
];

export const getEmotionColor = (emotion: EmotionType): string => {
  // Extended color palette for raw emotions including "distress"
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
    case "distress": return "#D72638"; // Bright red for distress/emergency
    default: return "#7f5af0";
  }
};

export const analyzeEmotion = async (text: string) => {
  // --- 1. Explicit check for suicidal ideation / self-harm ---
  const distressPhrases = [
    "kill myself", "end my life", "suicide", "die by suicide",
    "want to die", "don't want to live", "hurt myself", "self-harm", "cut myself", "take my own life",
    "no reason to live", "can't go on", "don't want to be here", "wish i were dead",
    "life isn't worth living", "give up on life", "i want to die", "i'm done with life"
  ];
  const lowerText = text.toLowerCase();

  if (distressPhrases.some(phrase => lowerText.includes(phrase))) {
    // Return special distress emotion
    return {
      label: "distress",
      score: 1.0,
      color: getEmotionColor("distress"),
      emotions: [{ label: "distress", score: 1.0 }],
      flagged: true,
      isCrisis: true
    };
  }

  try {
    console.log("[EmotionAnalysis] Sending request to:", EMOTION_API_URL);
    const response = await fetch(EMOTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ inputs: text }),
    });

    console.log("[EmotionAnalysis] API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      // Add more context for debugging
      console.error(`[EmotionAnalysis] API request failed with status: ${response.status}. Response: ${errorText}`);
      throw new Error(
        `Emotion API error (status ${response.status}): ${errorText}.
        ⚠️ Double check your Hugging Face API key and the bhadresh-savani/bert-base-uncased-emotion model availability at https://huggingface.co/bhadresh-savani/bert-base-uncased-emotion ⚠️`
      );
    }

    const data = await response.json();
    console.log("[EmotionAnalysis] Raw API data:", data);

    // The expected output from bhadresh-savani/bert-base-uncased-emotion is:
    // [
    //   [
    //     { "label": "sadness", "score": 0.98 },
    //     { "label": "joy", "score": 0.01 },
    //     ...
    //   ]
    // ]
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
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

    throw new Error("[EmotionAnalysis] Invalid response format from emotion API");

  } catch (error) {
    console.error("Error analyzing emotion:", error);

    // Fallback to basic sentiment analysis
    let fallbackEmotion: EmotionType = "neutral";
    let fallbackScore = 0.5;

    if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("excited")) {
      fallbackEmotion = "joy";
      fallbackScore = 0.7;
    } else if (lowerText.includes("sad") || lowerText.includes("cry") || lowerText.includes("depressed")) {
      fallbackEmotion = "sadness";
      fallbackScore = 0.7;
    } else if (lowerText.includes("angry") || lowerText.includes("mad") || lowerText.includes("furious")) {
      fallbackEmotion = "anger";
      fallbackScore = 0.7;
    } else if (lowerText.includes("scared") || lowerText.includes("afraid") || lowerText.includes("anxious")) {
      fallbackEmotion = "fear";
      fallbackScore = 0.7;
    }

    return {
      label: fallbackEmotion,
      score: fallbackScore,
      color: getEmotionColor(fallbackEmotion),
      emotions: [{ label: fallbackEmotion, score: fallbackScore }],
      isFallback: true
    };
  }
};

// Enhanced N8N workflow trigger function
export const triggerEmotionalResponseWorkflow = async (
  userMessage: string,
  emotionResult: any,
  useGenAlpha: boolean = false,
  previousEmotion?: string,
  conversationHistory: any[] = []
) => {
  try {
    const workflowPayload = {
      userMessage,
      emotion: emotionResult.label,
      emotionScore: emotionResult.score,
      useGenAlpha,
      previousEmotion,
      conversationHistory: conversationHistory.slice(-5), // Only send last 5 messages for context
      timestamp: new Date().toISOString(),
      // Additional context for better analysis
      textLength: userMessage.length,
      allEmotions: emotionResult.emotions,
      emotionIntensity: emotionResult.score > 0.8 ? 'high' : emotionResult.score < 0.4 ? 'low' : 'moderate'
    };

    console.log("Triggering N8N workflow with payload:", workflowPayload);

    const response = await fetch(N8N_WORKFLOW_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify(workflowPayload),
      signal: AbortSignal.timeout(20000) // 20 second timeout for n8n workflow
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N workflow request failed with status: ${response.status}. Response: ${errorText}`);
    }

    const result = await response.json();
    console.log("N8N workflow response:", result);
    
    if (result.success && result.response) {
      return {
        response: result.response,
        metadata: result.metadata,
        source: 'n8n_workflow'
      };
    } else {
      throw new Error(result.error || "N8N workflow returned unsuccessful response");
    }

  } catch (error) {
    console.error("Error triggering N8N workflow:", error);
    
    // Return fallback response if N8N workflow fails
    return {
      response: getLocalFallbackResponse(emotionResult.label, useGenAlpha, previousEmotion, emotionResult.score),
      metadata: {
        emotion: emotionResult.label,
        emotionScore: emotionResult.score,
        source: 'local_fallback',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      source: 'local_fallback',
      error: error.message
    };
  }
};

// Enhanced local fallback response function with Gen Alpha lingo
const getLocalFallbackResponse = (
  emotion: EmotionType,
  useGenAlpha: boolean = false,
  previousEmotion?: string,
  emotionScore?: number
): string => {
  const intensity = emotionScore && emotionScore > 0.8 ? "high" : emotionScore && emotionScore < 0.4 ? "low" : "moderate";
  
  if (useGenAlpha) {
    // Gen Alpha style responses (skibidi, sigma, rizz, Ohio, etc.)
    switch (emotion) {
      case "joy":
        if (intensity === "high") {
          return previousEmotion === "sadness"
            ? "Yo that's absolutely SIGMA! Your mood just went from Ohio to straight fire! What caused this W glow up, fam? 🔥✨"
            : "BRO you're giving main character energy rn! Your rizz is off the charts! What's got you this hyped, no cap? 😎💪";
        }
        return previousEmotion === "sadness"
          ? "Ayy look at this comeback! From mid to absolutely based! What's the tea? 🌟"
          : "You're lowkey glowing rn! What's making you feel this fire? 🔥";
      
      case "sadness":
        if (intensity === "high") {
          return "Damn fam, I can feel you're really going through it. That's some heavy Ohio energy but you're not alone in this, no cap. What's weighing on your sigma mindset? 💙🫂";
        }
        return previousEmotion === "joy"
          ? "Your vibe switched up real quick. Sometimes we go from W to L real fast, that's life frfr. What happened? 💙"
          : "I see you're in your feels rn. That's valid energy though. What's on your mind, chief? 🫂";
      
      case "anger":
        if (intensity === "high") {
          return "YOOO you're absolutely PRESSED rn! That rage is giving unhinged energy but it's valid AF. What got you this heated, sigma? 🔥💢";
        }
        return "You seem lowkey triggered by something. That's some real energy right there. Wanna spill the tea about what's bothering you? 👀";
      
      case "fear":
        if (intensity === "high") {
          return "Bruh I can sense you're really anxious rn and that's giving major Ohio vibes. But fr you're gonna be okay, we got this together. What's scaring you most, fam? 🌸💚";
        }
        return "Getting some sus anxious vibes from you. Anxiety is mid but you're not alone in this grind. What's making you feel sketchy? 💭";
      
      case "surprise":
        return intensity === "high" 
          ? "NO CAP you're absolutely SHOOK rn! That must've been some crazy plot twist! Drop the lore, what happened?! 😱🔥"
          : "Ooh something caught you off guard! That's some unexpected main character moment! What's the story? 👀";
      
      case "love":
        return intensity === "high"
          ? "BRO STOP you're literally radiating rizz energy rn! This is giving absolute sigma romance vibes! Tell me about this person who's got you all soft! 💕✨"
          : "Ayy you're catching feelings! That's some wholesome sigma energy right there. Who's got your heart happy, chief? 💕";
      
      case "neutral":
        return previousEmotion ? "Your energy seems to have balanced out. You're giving chill vibes now, how you feeling fr?" : "Just vibing in neutral mode? What's on your sigma mindset today, fam? 💭";
      
      default:
        return intensity === "high"
          ? "I can feel the intensity of whatever you're going through rn. That's some real main character energy and your feelings are absolutely valid, no cap 💜"
          : "I'm here for whatever you're experiencing, chief. No judgment, just listening. What's the situation? 💜";
    }
  } else {
    // Regular supportive responses with intensity consideration
    switch (emotion) {
      case "joy":
        if (intensity === "high") {
          return previousEmotion === "sadness"
            ? "What a beautiful transformation! I can feel the joy radiating from your message. It's wonderful to see you emerge from sadness into such happiness. What brought about this positive change?"
            : "Your happiness is absolutely infectious! I can sense the deep joy you're experiencing. What's filling your heart with such wonderful feelings?";
        }
        return previousEmotion === "sadness"
          ? "I notice your mood has brightened from earlier. What helped turn things around for you?"
          : "I can sense your positive energy! What's bringing you this happiness?";
      
      case "sadness":
        if (intensity === "high") {
          return "I can feel the depth of sadness you're experiencing right now, and I want you to know that your pain is completely valid and important. You don't have to carry this burden alone. What's weighing most heavily on your heart?";
        }
        return previousEmotion === "joy"
          ? "I notice your mood has shifted from earlier happiness. That's completely normal - emotions can change throughout the day. Would you like to share what's affecting you?"
          : "It sounds like you're going through something difficult. Your feelings are completely valid. I'm here to listen if you'd like to talk about it.";
      
      case "anger":
        if (intensity === "high") {
          return "I can sense the intensity of your anger, and I want you to know that these feelings are completely valid. Strong emotions often signal that something important to you has been affected. What would help you feel heard and understood right now?";
        }
        return "I notice some frustration in your message. It's completely okay to feel angry - those emotions are telling you something important. Would you like to explore what's bothering you?";
      
      case "fear":
        if (intensity === "high") {
          return "I can tell you're experiencing significant anxiety or fear right now, and that must feel overwhelming. It's completely understandable to feel this way. You're safe here, and we can work through this together. What's causing you the most worry?";
        }
        return "It seems like you might be feeling anxious or worried about something. Those feelings are completely natural and valid. What's on your mind?";
      
      case "surprise":
        return intensity === "high" 
          ? "That must have been quite a shock! Big surprises can be overwhelming to process. How are you feeling about this unexpected development?"
          : "That sounds unexpected! How are you processing this surprise?";
      
      case "love":
        return intensity === "high"
          ? "I can feel the warmth and depth of love in your message - it's truly beautiful. Those deep connections with others are one of life's greatest gifts. Would you like to share more about this special bond?"
          : "I can sense the warmth and affection in your words. Those positive connections are so important. Would you like to share more?";
      
      case "neutral":
        return previousEmotion ? "Your emotions seem to have found a balance now. How are you feeling overall?" : "How are things going for you today? I'm here to listen to whatever's on your mind.";
      
      default:
        return intensity === "high"
          ? "I can sense you're experiencing something quite intense right now. Whatever you're going through, your feelings are valid and important. I'm here to support you through this."
          : "Thank you for sharing with me. Whatever you're experiencing, I'm here to listen and support you through it.";
    }
  }
};

// --- Update the comforting message for 'distress' ---
export const generateComfortingMessage = (emotion: EmotionResult): string => {
  const emotionLabel = emotion.label.toLowerCase();

  if (emotionLabel === 'distress') {
    // UPDATED: Always calm, validating message. No hotline, just kindness.
    return "You're going through something really hard right now. Remember, feelings are like waves and this one will pass too—I'm here with you, and you're not alone. Would you like to share more about what's on your mind?";
  }

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
