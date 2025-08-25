// src/lib/analyzeEmotion.ts
import { EmotionType, EmotionResult } from "../types";

// Updated with the facebook/bart-large-mnli model for Gen Z emotion detection
const EMOTION_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
// NOTE: Make sure to set a valid Hugging Face API Key in the code below!
const API_KEY = "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"; // <-- Your provided Hugging Face API Key!

// Gen Z specific emotion categories with modern language
const GENZ_EMOTION_CATEGORIES = [
  "vibing",           // Feeling good, relaxed, in the zone
  "bossed",           // Feeling confident, powerful, successful
  "stressed",         // Anxious, overwhelmed, under pressure
  "blessed",          // Grateful, thankful, feeling fortunate
  "mood",             // General emotional state, can be positive or negative
  "cringe",           // Embarrassed, second-hand embarrassment
  "savage",           // Bold, fearless, unapologetic
  "soft",             // Emotional, vulnerable, caring
  "lit",              // Excited, hyped, energetic
  "depressed",        // Sad, down, low energy
  "anxious",          // Worried, nervous, uneasy
  "confident",        // Self-assured, bold, proud
  "overwhelmed",      // Too much to handle, stressed out
  "grateful",         // Thankful, appreciative
  "frustrated",       // Annoyed, irritated, fed up
  "inspired",         // Motivated, creative, energized
  "lonely",           // Feeling isolated, missing connection
  "peaceful",         // Calm, content, at ease
  "angry",            // Mad, furious, heated
  "excited",          // Thrilled, pumped, stoked
  "tired",            // Exhausted, drained, sleepy
  "hopeful",          // Optimistic, looking forward to something
  "confused",         // Uncertain, unclear, puzzled
  "proud",            // Accomplished, satisfied with achievements
  "nervous",          // Anxious, jittery, uneasy
  "happy",            // Joyful, cheerful, glad
  "sad",              // Unhappy, sorrowful, down
  "neutral"           // Balanced, neither positive nor negative
];

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
  // Gen Z emotion color palette with modern, vibrant colors
  switch (emotion) {
    // Positive/High Energy Emotions
    case "vibing": return "#00D4AA";      // Teal - fresh and energetic
    case "bossed": return "#FF6B6B";      // Coral - bold and confident
    case "lit": return "#FFE66D";         // Bright yellow - energetic and hyped
    case "blessed": return "#4ECDC4";     // Mint green - grateful and peaceful
    case "confident": return "#FF8E53";   // Orange - bold and self-assured
    case "inspired": return "#A8E6CF";    // Light green - creative and motivated
    case "excited": return "#FFD93D";     // Golden yellow - thrilled and pumped
    case "hopeful": return "#6C5CE7";     // Purple - optimistic and forward-looking
    case "proud": return "#FD79A8";       // Pink - accomplished and satisfied
    case "happy": return "#00B894";       // Green - joyful and cheerful
    case "peaceful": return "#74B9FF";    // Light blue - calm and content
    case "grateful": return "#55A3FF";    // Blue - thankful and appreciative
    
    // Neutral Emotions
    case "mood": return "#A29BFE";        // Lavender - general emotional state
    case "neutral": return "#DFE6E9";     // Light gray - balanced
    case "soft": return "#FDCB6E";        // Soft yellow - vulnerable and caring
    case "savage": return "#E17055";      // Rust - bold and fearless
    
    // Negative/Stressed Emotions
    case "stressed": return "#FF7675";    // Red - overwhelmed and under pressure
    case "anxious": return "#FAB1A0";     // Light red - worried and nervous
    case "overwhelmed": return "#E84393"; // Magenta - too much to handle
    case "frustrated": return "#FF9F43";  // Orange-red - annoyed and irritated
    case "lonely": return "#6C5CE7";      // Purple - isolated and disconnected
    case "angry": return "#D63031";       // Dark red - mad and furious
    case "tired": return "#636E72";       // Dark gray - exhausted and drained
    case "confused": return "#B2BEC3";    // Gray - uncertain and unclear
    case "nervous": return "#FD79A8";     // Pink - anxious and jittery
    case "sad": return "#74B9FF";         // Blue - unhappy and sorrowful
    case "depressed": return "#5F27CD";   // Dark purple - down and low energy
    
    // Special Cases
    case "cringe": return "#FF9FF3";      // Light pink - embarrassed
    case "distress": return "#D72638";    // Bright red for emergency
    
    // Legacy emotions (keeping for backward compatibility)
    case "joy": return "#00D4AA";
    case "sadness": return "#74B9FF";
    case "anger": return "#D63031";
    case "fear": return "#E84393";
    case "surprise": return "#FFE66D";
    case "love": return "#FD79A8";
    case "admiration": return "#74B9FF";
    case "amusement": return "#FFE66D";
    case "annoyance": return "#FF9F43";
    case "approval": return "#4ECDC4";
    case "caring": return "#FDCB6E";
    case "confusion": return "#B2BEC3";
    case "curiosity": return "#A8E6CF";
    case "desire": return "#FD79A8";
    case "disappointment": return "#FF7675";
    case "disapproval": return "#FF9F43";
    case "disgust": return "#00B894";
    case "embarrassment": return "#FF9FF3";
    case "excitement": return "#FFE66D";
    case "gratitude": return "#55A3FF";
    case "grief": return "#6C5CE7";
    case "nervousness": return "#FD79A8";
    case "optimism": return "#6C5CE7";
    case "pride": return "#FD79A8";
    case "realization": return "#A8E6CF";
    case "relief": return "#4ECDC4";
    case "remorse": return "#FF7675";
    
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
    console.log("[EmotionAnalysis] Sending request to BART-large-MNLI for Gen Z emotion detection");
    
    // Prepare the request for BART-large-MNLI zero-shot classification
    const requestBody = {
      inputs: text,
      parameters: {
        candidate_labels: GENZ_EMOTION_CATEGORIES,
        multi_label: false, // Get single best emotion
        hypothesis_template: "This text expresses the emotion of {}." // Template for zero-shot classification
      }
    };

    const response = await fetch(EMOTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[EmotionAnalysis] API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EmotionAnalysis] API request failed with status: ${response.status}. Response: ${errorText}`);
      throw new Error(
        `Emotion API error (status ${response.status}): ${errorText}.
        ⚠️ Double check your Hugging Face API key and the facebook/bart-large-mnli model availability at https://huggingface.co/facebook/bart-large-mnli ⚠️`
      );
    }

    const data = await response.json();
    console.log("[EmotionAnalysis] Raw API data:", data);

    // The expected output from BART-large-MNLI is:
    // {
    //   "sequence": "input text",
    //   "labels": ["emotion1", "emotion2", ...],
    //   "scores": [0.95, 0.03, ...]
    // }
    if (data.labels && data.scores && Array.isArray(data.labels) && Array.isArray(data.scores)) {
      // Get the top emotion
      const topIndex = data.scores.indexOf(Math.max(...data.scores));
      const topEmotion = data.labels[topIndex];
      const topScore = data.scores[topIndex];

      console.log("Top Gen Z emotion:", topEmotion, "with score:", topScore);

      // Get top 3 emotions for context
      const topEmotions = data.labels
        .map((label: string, index: number) => ({
          label: label as EmotionType,
          score: data.scores[index]
        }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);

      return {
        label: topEmotion as EmotionType,
        score: topScore,
        color: getEmotionColor(topEmotion as EmotionType),
        emotions: topEmotions // Return top 3 emotions for reference
      };
    }

    throw new Error("[EmotionAnalysis] Invalid response format from BART-large-MNLI API");

  } catch (error) {
    console.error("Error analyzing emotion:", error);

    // Fallback to Gen Z language pattern detection
    let fallbackEmotion: EmotionType = "mood";
    let fallbackScore = 0.5;

    // Gen Z positive expressions
    if (lowerText.includes("vibing") || lowerText.includes("bossed") || lowerText.includes("lit") || 
        lowerText.includes("blessed") || lowerText.includes("fire") || lowerText.includes("goals")) {
      fallbackEmotion = "vibing";
      fallbackScore = 0.8;
    } else if (lowerText.includes("stressed") || lowerText.includes("overwhelmed") || lowerText.includes("anxiety")) {
      fallbackEmotion = "stressed";
      fallbackScore = 0.8;
    } else if (lowerText.includes("cringe") || lowerText.includes("embarrassed") || lowerText.includes("awkward")) {
      fallbackEmotion = "cringe";
      fallbackScore = 0.7;
    } else if (lowerText.includes("savage") || lowerText.includes("bold") || lowerText.includes("confident")) {
      fallbackEmotion = "savage";
      fallbackScore = 0.8;
    } else if (lowerText.includes("soft") || lowerText.includes("vulnerable") || lowerText.includes("caring")) {
      fallbackEmotion = "soft";
      fallbackScore = 0.7;
    } else if (lowerText.includes("depressed") || lowerText.includes("sad") || lowerText.includes("down")) {
      fallbackEmotion = "depressed";
      fallbackScore = 0.8;
    } else if (lowerText.includes("anxious") || lowerText.includes("nervous") || lowerText.includes("worried")) {
      fallbackEmotion = "anxious";
      fallbackScore = 0.8;
    } else if (lowerText.includes("excited") || lowerText.includes("pumped") || lowerText.includes("stoked")) {
      fallbackEmotion = "excited";
      fallbackScore = 0.8;
    } else if (lowerText.includes("tired") || lowerText.includes("exhausted") || lowerText.includes("drained")) {
      fallbackEmotion = "tired";
      fallbackScore = 0.7;
    } else if (lowerText.includes("hopeful") || lowerText.includes("optimistic") || lowerText.includes("looking forward")) {
      fallbackEmotion = "hopeful";
      fallbackScore = 0.7;
    } else if (lowerText.includes("confused") || lowerText.includes("uncertain") || lowerText.includes("puzzled")) {
      fallbackEmotion = "mood";
      fallbackScore = 0.6;
    } else if (lowerText.includes("proud") || lowerText.includes("accomplished") || lowerText.includes("achievement")) {
      fallbackEmotion = "proud";
      fallbackScore = 0.8;
    } else if (lowerText.includes("grateful") || lowerText.includes("thankful") || lowerText.includes("appreciate")) {
      fallbackEmotion = "grateful";
      fallbackScore = 0.7;
    } else if (lowerText.includes("inspired") || lowerText.includes("motivated") || lowerText.includes("creative")) {
      fallbackEmotion = "inspired";
      fallbackScore = 0.8;
    } else if (lowerText.includes("lonely") || lowerText.includes("isolated") || lowerText.includes("alone")) {
      fallbackEmotion = "lonely";
      fallbackScore = 0.8;
    } else if (lowerText.includes("peaceful") || lowerText.includes("calm") || lowerText.includes("content")) {
      fallbackEmotion = "peaceful";
      fallbackScore = 0.7;
    } else if (lowerText.includes("angry") || lowerText.includes("furious") || lowerText.includes("heated")) {
      fallbackEmotion = "angry";
      fallbackScore = 0.8;
    } else if (lowerText.includes("frustrated") || lowerText.includes("annoyed") || lowerText.includes("irritated")) {
      fallbackEmotion = "frustrated";
      fallbackScore = 0.7;
    } else if (lowerText.includes("happy") || lowerText.includes("joy") || lowerText.includes("cheerful")) {
      fallbackEmotion = "happy";
      fallbackScore = 0.7;
    } else if (lowerText.includes("sad") || lowerText.includes("unhappy") || lowerText.includes("sorrowful")) {
      fallbackEmotion = "sad";
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
  useGenZ: boolean = false,
  previousEmotion?: string,
  conversationHistory: any[] = []
) => {
  try {
    const workflowPayload = {
      userMessage,
      emotion: emotionResult.label,
      emotionScore: emotionResult.score,
      useGenZ,
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
      response: getLocalFallbackResponse(emotionResult.label, useGenZ, previousEmotion, emotionResult.score),
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

// Enhanced local fallback response function with Gen Z lingo
const getLocalFallbackResponse = (
  emotion: EmotionType,
  useGenZ: boolean = false,
  previousEmotion?: string,
  emotionScore?: number
): string => {
  const intensity = emotionScore && emotionScore > 0.8 ? "high" : emotionScore && emotionScore < 0.4 ? "low" : "moderate";
  
  if (useGenZ) {
    // Gen Z style responses with modern slang
    switch (emotion) {
      case "vibing":
        if (intensity === "high") {
          return previousEmotion === "depressed" || previousEmotion === "sad"
            ? "OMG the glow up is REAL! You went from being in your feels to absolutely VIBING! What's got you feeling this good? ✨🔥"
            : "You're literally radiating main character energy rn! The vibes are immaculate! What's making you feel this blessed? 💫";
        }
        return "You're giving such good energy rn! Love to see you in your element. What's got you feeling this way? ✨";
      
      case "bossed":
        return intensity === "high"
          ? "YASSS you absolutely BOSSED that! That confidence is everything! You're giving main character energy and I'm here for it! 👑✨"
          : "You're definitely in your boss era! Love the confidence you're radiating. What's got you feeling this powerful? 💪";
      
      case "stressed":
        if (intensity === "high") {
          return "Babe, I can feel you're really going through it rn. That stress is valid AF and you don't have to carry it alone. What's weighing on you? 💙🫂";
        }
        return "Stress is literally the worst, I feel you. Sometimes we just need to vent it out. What's got you feeling this overwhelmed? 💭";
      
      case "blessed":
        return intensity === "high"
          ? "You're literally living your best life rn! That gratitude energy is everything! What are you feeling blessed about today? 🙏✨"
          : "Love that you're feeling grateful! It's such a beautiful mindset. What's making you feel blessed? 💕";
      
      case "cringe":
        return "Oof, we've all been there! That second-hand embarrassment is real but it's totally normal. What happened that made you feel this way? 😬";
      
      case "savage":
        return intensity === "high"
          ? "You're absolutely UNHINGED rn and I'm living for it! That savage energy is everything! What's got you feeling this bold? 😈🔥"
          : "You're definitely in your savage era! Love the confidence. What's making you feel this fearless? 💪";
      
      case "soft":
        return "Aww, you're being so vulnerable rn and that's beautiful. It's okay to be soft and feel your feelings. What's got you feeling this way? 🥺💕";
      
      case "lit":
        return intensity === "high"
          ? "You're absolutely LIT rn! That energy is contagious! What's got you feeling this hyped? 🔥✨"
          : "You're definitely feeling the vibes! Love the energy you're bringing. What's got you excited? 💫";
      
      case "depressed":
        if (intensity === "high") {
          return "I can feel you're really going through it rn, and I want you to know that your feelings are completely valid. You don't have to go through this alone. What's weighing on your heart? 💙🫂";
        }
        return "Depression is literally the worst, I'm so sorry you're feeling this way. Your feelings are valid and you're not alone. What's on your mind? 💙";
      
      case "anxious":
        if (intensity === "high") {
          return "Anxiety is literally the worst, I feel you so hard rn. That worry is valid and you're not alone in this. What's making you feel this anxious? 💭💙";
        }
        return "Anxiety can be so overwhelming, I totally get it. Sometimes we just need to talk it out. What's on your mind? 💭";
      
      case "overwhelmed":
        return "Being overwhelmed is literally the worst feeling ever. Sometimes life just gives us too much to handle at once. What's got you feeling this way? 💙";
      
      case "inspired":
        return intensity === "high"
          ? "You're literally radiating creative energy rn! That inspiration is everything! What's got you feeling this motivated? 💡✨"
          : "Love that you're feeling inspired! It's such a beautiful feeling. What's motivating you? 💫";
      
      case "lonely":
        return "Feeling lonely is literally the worst, I'm so sorry you're going through that. You're not alone in feeling this way, even if it feels like it. What's on your mind? 💙🫂";
      
      case "peaceful":
        return "You're literally in your zen era rn and I'm here for it! That peaceful energy is everything. What's got you feeling this calm? 😌✨";
      
      case "angry":
        if (intensity === "high") {
          return "You're absolutely PRESSED rn and that's valid AF! Sometimes we just need to feel our anger. What's got you feeling this heated? 🔥💢";
        }
        return "Anger is a totally valid emotion, don't let anyone tell you otherwise. What's got you feeling this way? 💭";
      
      case "excited":
        return intensity === "high"
          ? "You're literally BUZZING rn and I'm living for it! That excitement is everything! What's got you feeling this hyped? 🤩✨"
          : "Love that you're feeling excited! It's such a good energy. What are you looking forward to? 💫";
      
      case "tired":
        return "Being tired is literally the worst, I feel you so hard. Sometimes we just need to rest and that's totally okay. What's got you feeling this drained? 😴💙";
      
      case "hopeful":
        return "You're literally radiating hope rn and it's beautiful! That optimism is everything. What are you feeling hopeful about? 🤞✨";
      
      case "confused":
        return "Being confused is literally the worst feeling ever, I totally get it. Sometimes things just don't make sense and that's okay. What's got you feeling this way? 🤔💭";
      
      case "proud":
        return intensity === "high" 
          ? "You should be absolutely PROUD of yourself rn! That accomplishment energy is everything! What are you feeling proud about? 💪✨"
          : "Love that you're feeling proud! It's such a beautiful feeling. What are you proud of? 💫";
      
      case "nervous":
        return "Being nervous is literally the worst, I feel you. Sometimes we just need to talk through our worries. What's making you feel this anxious? 😰💭";
      
      case "happy":
        return intensity === "high"
          ? "You're literally radiating happiness rn and it's everything! That joy is contagious! What's got you feeling this good? 😊✨"
          : "Love that you're feeling happy! It's such a beautiful energy. What's bringing you joy? 💫";
      
      case "sad":
        if (intensity === "high") {
          return "I can feel you're really going through it rn, and I want you to know that your sadness is completely valid. You don't have to carry this alone. What's weighing on your heart? 💙🫂";
        }
        return "Being sad is literally the worst, I'm so sorry you're feeling this way. Your feelings are valid and you're not alone. What's on your mind? 💙";
      
      case "mood":
        return "You're literally in your feels rn and that's totally valid. Sometimes we just need to feel our emotions. What's on your mind? 💭";
      
      default:
        return intensity === "high"
          ? "I can feel the intensity of whatever you're going through rn. That's some real main character energy and your feelings are absolutely valid! 💜"
          : "I'm here for whatever you're experiencing, no judgment. What's on your mind? 💜";
    }
  } else {
    // Regular supportive responses with intensity consideration
    switch (emotion) {
      case "vibing":
        if (intensity === "high") {
          return previousEmotion === "depressed" || previousEmotion === "sad"
            ? "What a beautiful transformation! I can feel the positive energy radiating from your message. It's wonderful to see you emerge from sadness into such a good mood. What brought about this positive change?"
            : "Your positive energy is absolutely infectious! I can sense the deep contentment you're experiencing. What's filling your heart with such wonderful feelings?";
        }
        return "I can sense your positive energy! What's bringing you this contentment?";
      
      case "bossed":
        return intensity === "high"
          ? "I can feel the confidence and power radiating from your message! That self-assurance is truly inspiring. What's got you feeling this confident?"
          : "I can sense your confidence! That self-assurance is wonderful to see. What's making you feel this powerful?";
      
      case "stressed":
        if (intensity === "high") {
          return "I can feel the depth of stress you're experiencing right now, and I want you to know that your feelings are completely valid. You don't have to carry this burden alone. What's weighing most heavily on your mind?";
        }
        return "It sounds like you're going through a stressful time. Your feelings are completely valid. I'm here to listen if you'd like to talk about it.";
      
      case "blessed":
        return intensity === "high"
          ? "I can feel the deep gratitude and appreciation in your message. That sense of being blessed is truly beautiful. What are you feeling grateful for today?"
          : "I can sense your gratitude! That appreciation for life's blessings is wonderful. What's making you feel blessed?";
      
      case "cringe":
        return "It sounds like you experienced something embarrassing or awkward. Those feelings are completely normal - we all have cringe moments. What happened that made you feel this way?";
      
      case "savage":
        return intensity === "high"
          ? "I can sense the boldness and fearlessness in your message! That confidence is truly inspiring. What's got you feeling this bold?"
          : "I can sense your boldness! That confidence is wonderful to see. What's making you feel this fearless?";
      
      case "soft":
        return "I can feel the vulnerability and tenderness in your message. It's beautiful that you're allowing yourself to be soft and feel your emotions. What's got you feeling this way?";
      
      case "lit":
        return intensity === "high"
          ? "I can feel the excitement and energy radiating from your message! That enthusiasm is absolutely contagious. What's got you feeling this hyped?"
          : "I can sense your excitement! That energy is wonderful. What's got you feeling this way?";
      
      case "depressed":
        if (intensity === "high") {
          return "I can feel the depth of sadness you're experiencing right now, and I want you to know that your pain is completely valid and important. You don't have to carry this burden alone. What's weighing most heavily on your heart?";
        }
        return "It sounds like you're going through something difficult. Your feelings are completely valid. I'm here to listen if you'd like to talk about it.";
      
      case "anxious":
        if (intensity === "high") {
          return "I can tell you're experiencing significant anxiety right now, and that must feel overwhelming. It's completely understandable to feel this way. You're safe here, and we can work through this together. What's causing you the most worry?";
        }
        return "It seems like you might be feeling anxious about something. Those feelings are completely natural and valid. What's on your mind?";
      
      case "overwhelmed":
        return "I can sense you're feeling overwhelmed, and that's completely understandable. Sometimes life gives us more than we can handle at once. What's got you feeling this way?";
      
      case "inspired":
        return intensity === "high"
          ? "I can feel the inspiration and motivation radiating from your message! That creative energy is truly beautiful. What's got you feeling this motivated?"
          : "I can sense your inspiration! That motivation is wonderful to see. What's inspiring you?";
      
      case "lonely":
        return "I can sense you're feeling lonely, and that's completely understandable. Feeling isolated can be incredibly difficult. You're not alone in feeling this way, even if it feels like it. What's on your mind?";
      
      case "peaceful":
        return "I can feel the calm and contentment in your message. That peaceful energy is truly beautiful. What's got you feeling this way?";
      
      case "angry":
        if (intensity === "high") {
          return "I can sense the intensity of your anger, and I want you to know that these feelings are completely valid. Strong emotions often signal that something important to you has been affected. What would help you feel heard and understood right now?";
        }
        return "I notice some anger in your message. It's completely okay to feel angry - those emotions are telling you something important. Would you like to explore what's bothering you?";
      
      case "excited":
        return intensity === "high"
          ? "I can feel the excitement radiating from your message! That enthusiasm is absolutely contagious. What's got you feeling this hyped?"
          : "I can sense your excitement! That energy is wonderful. What are you looking forward to?";
      
      case "tired":
        return "I can sense you're feeling tired, and that's completely understandable. Sometimes we just need to rest and that's totally okay. What's got you feeling this drained?";
      
      case "hopeful":
        return "I can feel the hope and optimism in your message. That positive outlook is truly beautiful. What are you feeling hopeful about?";
      
      case "confused":
        return "I can sense you're feeling confused, and that's completely understandable. Sometimes things just don't make sense and that's okay. What's got you feeling this way?";
      
      case "proud":
        return intensity === "high" 
          ? "I can feel the pride radiating from your message! That sense of accomplishment is truly inspiring. What are you feeling proud about?"
          : "I can sense your pride! That accomplishment is wonderful to see. What are you proud of?";
      
      case "nervous":
        return "I can sense you're feeling nervous, and that's completely understandable. Sometimes we just need to talk through our worries. What's making you feel this anxious?";
      
      case "happy":
        return intensity === "high"
          ? "I can feel the happiness radiating from your message! That joy is absolutely infectious. What's got you feeling this good?"
          : "I can sense your happiness! That joy is wonderful. What's bringing you happiness?";
      
      case "sad":
        if (intensity === "high") {
          return "I can feel the depth of sadness you're experiencing right now, and I want you to know that your pain is completely valid and important. You don't have to carry this burden alone. What's weighing most heavily on your heart?";
        }
        return "It sounds like you're going through something difficult. Your feelings are completely valid. I'm here to listen if you'd like to talk about it.";
      
      case "mood":
        return "I can sense you're in your feelings right now, and that's completely normal. Sometimes we just need to feel our emotions. What's on your mind?";
      
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

// AI-powered customized response generation
export const generateAICustomizedResponse = async (
  userMessage: string,
  emotionResult: EmotionResult,
  useGenZ: boolean = false,
  previousEmotion?: string,
  conversationHistory: any[] = []
): Promise<string> => {
  try {
    // Create a detailed prompt for AI response generation
    const prompt = createAIPrompt(userMessage, emotionResult, useGenZ, previousEmotion, conversationHistory);
    
    // Get API key from localStorage or environment
    const apiKey = typeof window !== 'undefined' 
      ? localStorage.getItem('openai_api_key') || (window as any).OPENAI_API_KEY
      : process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Use OpenAI API or similar AI service for response generation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
              body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an empathetic AI companion that creates completely unique, fresh responses every time. Never repeat the same phrases or use template-like language. Each response should feel like a real person having a genuine conversation. Be creative, varied, and authentic in your language. Avoid repetitive patterns and make every response feel one-of-a-kind.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.9, // Higher temperature for more creativity and variety
          presence_penalty: 0.6, // Encourage new topics and ideas
          frequency_penalty: 0.8 // Discourage repetitive language
        })
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content.trim();
    
    // Add extra variety by occasionally modifying the response
    const varietyEnhancers = [
      // Add random emojis for Gen Z style
      (text: string) => useGenZ ? text.replace(/\./g, (match, index) => 
        Math.random() > 0.7 ? match + [' ✨', ' 💫', ' 🔥', ' 💪', ' 🎯', ' 🌟'][Math.floor(Math.random() * 6)] : match
      ) : text,
      
      // Add random conversational fillers
      (text: string) => Math.random() > 0.8 ? 
        ['You know what? ', 'Honestly, ', 'I gotta say, ', 'Listen, '][Math.floor(Math.random() * 4)] + text : text,
      
      // Add random emphasis
      (text: string) => Math.random() > 0.85 ? 
        text.replace(/\b(\w+)\b/g, (match, word) => 
          Math.random() > 0.9 ? `*${match}*` : match
        ) : text,
      
      // Add random follow-up variations
      (text: string) => {
        const followUps = [
          ' What do you think?',
          ' How does that sound?',
          ' What\'s your take on that?',
          ' Does that resonate with you?',
          ' What\'s your perspective?'
        ];
        return Math.random() > 0.75 ? text + followUps[Math.floor(Math.random() * followUps.length)] : text;
      }
    ];
    
    // Apply random variety enhancers
    varietyEnhancers.forEach(enhancer => {
      if (Math.random() > 0.5) {
        aiResponse = enhancer(aiResponse);
      }
    });
    
    return aiResponse;

  } catch (error) {
    console.error('Error generating AI response:', error);
    // Fallback to local response if AI fails
    return getLocalFallbackResponse(emotionResult.label, useGenZ, previousEmotion, emotionResult.score);
  }
};

// Create detailed prompt for AI response generation
const createAIPrompt = (
  userMessage: string,
  emotionResult: EmotionResult,
  useGenZ: boolean,
  previousEmotion?: string,
  conversationHistory: any[] = []
): string => {
  const emotion = emotionResult.label;
  const score = emotionResult.score;
  const intensity = score > 0.8 ? 'high' : score < 0.4 ? 'low' : 'moderate';
  
  let languageStyle = useGenZ 
    ? 'Use Gen Z language with modern slang, emojis, and casual expressions like "rn", "literally", "vibes", etc.'
    : 'Use traditional, supportive language with proper grammar and empathetic tone.';

  // Add context about emotion intensity
  const intensityContext = `The emotion intensity is ${intensity}. `;
  
  // Add context about emotion transition if available
  const transitionContext = previousEmotion && previousEmotion !== emotion
    ? `The user\'s emotion has changed from ${previousEmotion} to ${emotion}. `
    : '';

  // Add conversation history context
  const historyContext = conversationHistory.length > 0
    ? `Recent conversation context: ${conversationHistory.slice(-3).map(msg => msg.content).join(' | ')}. `
    : '';

  // Create a more dynamic, creative prompt that encourages variety
  const creativePrompts = [
    `You're an empathetic AI companion responding to someone who wrote: "${userMessage}"
    
    Emotion detected: ${emotion} (${intensity} intensity, score: ${score})
    ${transitionContext}${historyContext}
    
    Language style: ${languageStyle}
    
    Create a unique, fresh response that:
    - Feels completely natural and unrehearsed
    - Shows genuine understanding of their specific emotion
    - Uses creative, varied language (avoid repetitive phrases)
    - Includes a thoughtful follow-up question
    - Stays under 150 words
    - Feels like a real friend responding, not a template
    
    Be creative and authentic in your response:`,
    
    `A user just shared: "${userMessage}"
    
    I detected they're feeling: ${emotion} (${intensity} level)
    ${transitionContext}${historyContext}
    
    Respond in ${useGenZ ? 'Gen Z style' : 'traditional style'}.
    
    Write a completely unique response that:
    - Sounds like a real person, not a chatbot
    - Acknowledges their specific emotion in a fresh way
    - Uses varied vocabulary and sentence structures
    - Asks an engaging follow-up question
    - Keeps it conversational and under 150 words
    
    Make it feel like a genuine, one-of-a-kind response:`,
    
    `Someone wrote: "${userMessage}"
    
    Emotion analysis: ${emotion} (${intensity} intensity)
    ${transitionContext}${historyContext}
    
    Style: ${languageStyle}
    
    Craft a response that's:
    - Completely original and unrepeatable
    - Emotionally attuned to their specific feeling
    - Written in natural, varied language
    - Engaging and conversation-starting
    - Under 150 words
    - Authentic and human-like
    
    Create something unique and personal:`
  ];

  // Randomly select a creative prompt to ensure variety
  const randomPrompt = creativePrompts[Math.floor(Math.random() * creativePrompts.length)];
  
  return randomPrompt;
};

// Enhanced trigger function that uses AI for responses
export const triggerAIEmotionalResponse = async (
  userMessage: string,
  emotionResult: EmotionResult,
  useGenZ: boolean = false,
  previousEmotion?: string,
  conversationHistory: any[] = []
) => {
  try {
    // Try AI-generated response first
    const aiResponse = await generateAICustomizedResponse(
      userMessage, 
      emotionResult, 
      useGenZ, 
      previousEmotion, 
      conversationHistory
    );

    return {
      response: aiResponse,
      metadata: {
        emotion: emotionResult.label,
        emotionScore: emotionResult.score,
        source: 'ai_generated',
        timestamp: new Date().toISOString(),
        useGenZ,
        previousEmotion
      },
      source: 'ai_generated'
    };

  } catch (error) {
    console.error('Error with AI response generation:', error);
    
    // Fallback to N8N workflow or local response
    try {
      return await triggerEmotionalResponseWorkflow(
        userMessage, 
        emotionResult, 
        useGenZ, 
        previousEmotion, 
        conversationHistory
      );
    } catch (n8nError) {
      console.error('N8N workflow also failed:', n8nError);
      
      // Final fallback to local response
      return {
        response: getLocalFallbackResponse(emotionResult.label, useGenZ, previousEmotion, emotionResult.score),
        metadata: {
          emotion: emotionResult.label,
          emotionScore: emotionResult.score,
          source: 'local_fallback',
          timestamp: new Date().toISOString(),
          error: error.message
        },
        source: 'local_fallback'
      };
    }
  }
};
