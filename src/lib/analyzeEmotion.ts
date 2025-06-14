// src/lib/analyzeEmotion.ts
import { EmotionType } from "../types";
import { pipeline } from "@huggingface/transformers";

// Groq Llama-3 API endpoint and key for response generation only
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// BERT model emotions mapping (based on codewithdark/bert-Gomotions)
const BERT_EMOTION_MAPPING: Record<string, EmotionType> = {
  'admiration': 'admiration',
  'amusement': 'amusement', 
  'anger': 'anger',
  'annoyance': 'annoyance',
  'approval': 'approval',
  'caring': 'caring',
  'confusion': 'confusion',
  'curiosity': 'curiosity',
  'desire': 'desire',
  'disappointment': 'disappointment',
  'disapproval': 'disapproval',
  'disgust': 'disgust',
  'embarrassment': 'embarrassment',
  'excitement': 'excitement',
  'fear': 'fear',
  'gratitude': 'gratitude',
  'grief': 'grief',
  'joy': 'joy',
  'love': 'love',
  'nervousness': 'nervousness',
  'neutral': 'neutral',
  'optimism': 'optimism',
  'pride': 'pride',
  'realization': 'realization',
  'relief': 'relief',
  'remorse': 'remorse',
  'sadness': 'sadness',
  'surprise': 'surprise'
};

// Helper: emotion color (keep same)
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

// N8N workflow URL
const N8N_WORKFLOW_URL = import.meta.env.VITE_N8N_WORKFLOW_URL || "";

// Initialize BERT emotion classifier
let emotionClassifier: any = null;

const initializeEmotionClassifier = async () => {
  if (!emotionClassifier) {
    try {
      emotionClassifier = await pipeline(
        'text-classification',
        'codewithdark/bert-Gomotions',
        { device: 'webgpu' }
      );
      console.log('BERT emotion classifier initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize with WebGPU, falling back to CPU:', error);
      emotionClassifier = await pipeline(
        'text-classification', 
        'codewithdark/bert-Gomotions'
      );
    }
  }
  return emotionClassifier;
};

// Use BERT for emotion analysis
export const analyzeEmotion = async (text: string) => {
  try {
    console.log('Analyzing emotion with BERT model:', text);
    
    // Initialize and use BERT classifier
    const classifier = await initializeEmotionClassifier();
    const results = await classifier(text);
    
    console.log('BERT emotion results:', results);
    
    // Convert BERT results to our format
    const allEmotions = Object.keys(BERT_EMOTION_MAPPING).map(emotion => {
      const bertResult = results.find((r: any) => 
        r.label.toLowerCase() === emotion.toLowerCase()
      );
      return {
        label: emotion as EmotionType,
        score: bertResult ? bertResult.score : 0
      };
    });
    
    // Normalize scores to sum to 1
    const total = allEmotions.reduce((sum, emotion) => sum + emotion.score, 0);
    if (total > 0) {
      allEmotions.forEach(emotion => {
        emotion.score = emotion.score / total;
      });
    }
    
    // Find top emotion
    const topEmotion = allEmotions.reduce((prev, curr) => 
      curr.score > prev.score ? curr : prev
    );
    
    console.log('Processed emotion data:', {
      topEmotion: topEmotion.label,
      score: topEmotion.score,
      allEmotions
    });
    
    return {
      label: topEmotion.label,
      score: topEmotion.score,
      color: getEmotionColor(topEmotion.label),
      emotions: allEmotions
    };
    
  } catch (error) {
    console.error('Error analyzing emotion with BERT:', error);
    
    // Fallback to basic sentiment
    const lowerText = text.toLowerCase();
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

// Keep Mixtral for response generation
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
      conversationHistory: conversationHistory.slice(-5),
      timestamp: new Date().toISOString(),
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
      signal: AbortSignal.timeout(20000)
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
    
    return {
      response: await getLocalFallbackResponseWithMixtral(emotionResult.label, useGenAlpha, previousEmotion, emotionResult.score, userMessage),
      metadata: {
        emotion: emotionResult.label,
        emotionScore: emotionResult.score,
        source: 'mixtral_fallback',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      source: 'mixtral_fallback',
      error: error.message
    };
  }
};

// Use Mixtral for generating responses when N8N fails
const getLocalFallbackResponseWithMixtral = async (
  emotion: EmotionType,
  useGenAlpha: boolean = false,
  previousEmotion?: string,
  emotionScore?: number,
  userMessage?: string
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      return getStaticFallbackResponse(emotion, useGenAlpha, previousEmotion, emotionScore);
    }

    const intensity = emotionScore && emotionScore > 0.8 ? "high" : emotionScore && emotionScore < 0.4 ? "low" : "moderate";
    const style = useGenAlpha ? "Gen Alpha slang (rizz, sigma, Ohio, skibidi, no cap, etc.)" : "warm and supportive";
    
    const systemPrompt = `You are an empathetic AI companion. Respond to the user's message in a ${style} style. 
    
    Context:
    - Detected emotion: ${emotion} (${intensity} intensity)
    - Previous emotion: ${previousEmotion || 'none'}
    - User message: "${userMessage}"
    
    Keep your response conversational, supportive, and around 2-3 sentences.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage || `I'm feeling ${emotion}` }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    if (!response.ok) throw new Error('Mixtral API failed');

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      return content.trim();
    } else {
      throw new Error('No content from Mixtral');
    }
    
  } catch (error) {
    console.error('Error getting Mixtral response:', error);
    return getStaticFallbackResponse(emotion, useGenAlpha, previousEmotion, emotionScore);
  }
};

// Static fallback when both N8N and Mixtral fail
const getStaticFallbackResponse = (
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
