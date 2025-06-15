import { EmotionType, EmotionResult, ConversationMessage } from "../types";
import { triggerEmotionalResponseWorkflow } from "./analyzeEmotion";

// Keep existing OpenAI configuration as backup
const RESPONSE_API_URL = "https://api.openai.com/v1/chat/completions";
const RESPONSE_API_TOKEN = import.meta.env.VITE_OPENAI_API_KEY || ""; 

// System message for therapist-style AI
const SYSTEM_MSG = `You are a compassionate, emotionally intelligent AI therapist. Respond with warmth, empathy, and psychological insight. Keep each reply to one thoughtful sentence. Always encourage the user to share more, explore deeper, or reflect further. Do not offer final solutions—just guide gently, one step at a time.`;

// Enhanced fallback responses with Gen Alpha lingo when both N8N and OpenAI fail
const getFallbackResponse = (
  emotion: EmotionType,
  useGenAlpha: boolean = false,
  previousEmotion?: string,
  emotionScore?: number
): string => {
  const intensity = emotionScore && emotionScore > 0.8 ? "high" : emotionScore && emotionScore < 0.4 ? "low" : "moderate";
  
  if (useGenAlpha) {
    // Gen Alpha style responses with skibidi, sigma, rizz, Ohio energy
    switch (emotion) {
      case "joy":
        if (intensity === "high") {
          return previousEmotion === "sadness"
            ? "YOOO that's absolutely SIGMA behavior! Your mood just went from straight Ohio to maximum rizz! This glow up is giving main character energy! What caused this W transformation, fam? 🔥✨💪"
            : "BRO you're literally radiating sigma energy rn! Your vibes are absolutely FIRE and giving main character! What's got you this hyped? That's some serious rizz right there! 😎🔥";
        }
        return previousEmotion === "sadness"
          ? "Ayy look at this comeback arc! From mid energy to absolutely based! That's some sigma mindset shift right there! What happened, chief? 🌟"
          : "You're lowkey glowing with that positive energy! What's making you feel this fire? That's some good vibes, no cap! 🔥";
      
      case "sadness":
        if (intensity === "high") {
          return "Damn fam, I can feel you're really going through the Ohio arc rn. That's some heavy energy but your feelings are absolutely valid, no cap. You're not alone in this sigma journey, I got you fr. What's weighing on your mind? 💙🫂";
        }
        return previousEmotion === "joy"
          ? "Your energy switched up from W to L real quick but that's just life being sus sometimes, frfr. Emotions be wild like that. What happened to change the vibe? 💙"
          : "I see you're in your feels rn and that's totally valid energy. Sometimes we gotta feel those mid moments. What's on your mind, chief? 🫂";
      
      case "anger":
        if (intensity === "high") {
          return "YOOO you're absolutely PRESSED and giving unhinged energy rn but honestly? That rage is completely valid AF, no cap! Let's channel this sigma energy though. What got you this heated, fam? 🔥💢";
        }
        return "You seem lowkey triggered by something and that's giving some real energy right there. Wanna drop the tea about what's bothering your sigma mindset? I'm here to listen, chief 👀";
      
      case "fear":
        if (intensity === "high") {
          return "Bruh I can sense you're really struggling with anxiety rn and that's giving major Ohio vibes, but fr you're gonna make it through this. We got this together, sigma to sigma. What's scaring you most, fam? 🌸💚";
        }
        return "Getting some sus anxious vibes from you and anxiety is straight mid but you're not grinding alone in this. What's making you feel sketchy about things? 💭";
      
      case "surprise":
        return intensity === "high" 
          ? "NO CAP you're absolutely SHOOK rn! That must've been some crazy plot twist giving main character energy! Drop the lore, what wild thing just happened?! 😱🔥"
          : "Ooh something caught you completely off guard! That's giving unexpected sigma moment vibes! What's the story behind this? 👀";
      
      case "love":
        return intensity === "high"
          ? "BRO STOP IT you're literally radiating maximum rizz energy rn! This is giving absolute sigma romance arc and I'm here for it! Tell me about this person who's got you all soft, that's some wholesome energy! 💕✨"
          : "Ayy you're catching feelings and that's some wholesome sigma energy right there! Love that vibe for you, chief. Who's got your heart feeling happy? 💕";
      
      case "excitement":
        return intensity === "high"
          ? "YOOO you're absolutely BUZZING with hype energy rn! That excitement is giving pure sigma vibes and I'm living for it! What's got you this amped up, fam? 🚀⚡"
          : "You seem excited about something! I'd love to hear what's got you feeling so enthusiastic.";
      
      case "gratitude":
        return "Aww that's some wholesome sigma energy right there! Gratitude is giving main character growth vibes. What's got you feeling blessed, chief? 🙏✨";
      
      case "neutral":
        return previousEmotion ? "Your energy seems to have leveled out to chill mode. You're giving balanced sigma vibes now, how you feeling fr?" : "Just vibing in neutral sigma mode? What's on your mindset today, fam? 💭";
      
      default:
        return intensity === "high"
          ? "I can feel the intensity of whatever you're going through rn and that's some real main character energy. Your feelings are absolutely valid, no cap, and I'm here for this whole arc 💜"
          : "I'm here for whatever you're experiencing, chief. No judgment, just listening to your sigma journey. What's the situation? 💜";
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
      
      case "excitement":
        return intensity === "high"
          ? "I can feel your excitement bubbling over! That energy is wonderful and contagious. What's got you so thrilled?"
          : "You seem excited about something! I'd love to hear what's got you feeling so enthusiastic.";
      
      case "gratitude":
        return "I can sense the gratitude in your message, and that's truly heartwarming. Appreciation is such a beautiful emotion. What's brought this feeling of thankfulness to you?";
      
      case "neutral":
        return previousEmotion ? "Your emotions seem to have found a balance now. How are you feeling overall?" : "How are things going for you today? I'm here to listen to whatever's on your mind.";
      
      default:
        return intensity === "high"
          ? "I can sense you're experiencing something quite intense right now. Whatever you're going through, your feelings are valid and important. I'm here to support you through this."
          : "Thank you for sharing with me. Whatever you're experiencing, I'm here to listen and support you through it.";
    }
  }
};

// Main function that prioritizes N8N workflow with enhanced error handling
export const generateResponse = async (
  userMessage: string,
  emotionResult: EmotionResult,
  useGenAlpha: boolean = false,
  previousEmotion?: string,
  conversationHistory: ConversationMessage[] = []
): Promise<string | null> => {
  try {
    // First, try the N8N workflow
    console.log("Attempting to use N8N workflow for response generation...");
    const n8nResult = await triggerEmotionalResponseWorkflow(
      userMessage,
      emotionResult,
      useGenAlpha,
      previousEmotion,
      conversationHistory
    );
    
    if (n8nResult.source === 'n8n_workflow' && n8nResult.response) {
      console.log("Successfully generated response using N8N workflow");
      return n8nResult.response;
    }
    
    console.log("N8N workflow did not return a successful response, checking fallback options...");
    
    // If N8N workflow failed but returned a fallback, use it
    if (n8nResult.source === 'local_fallback' && n8nResult.response) {
      console.log("Using N8N local fallback response");
      return n8nResult.response;
    }
    
    // If N8N workflow failed completely, try OpenAI if token is available
    if (RESPONSE_API_TOKEN) {
      console.log("N8N workflow failed, attempting OpenAI fallback...");
      return await generateOpenAIResponse(userMessage, emotionResult, useGenAlpha, previousEmotion, conversationHistory);
    }
    
    // If both N8N and OpenAI are unavailable, do NOT return fallback
    console.log("No successful LLM response from N8N or OpenAI; returning null (NO FALLBACK)");
    return null;
    
  } catch (error) {
    console.error("Error in generateResponse:", error);
    // Do NOT return fallback response; only actual LLM responses or null
    return null;
  }
};

// Enhanced OpenAI function for fallback with Gen Alpha awareness
const generateOpenAIResponse = async (
  userMessage: string,
  emotionResult: EmotionResult,
  useGenAlpha: boolean = false,
  previousEmotion?: string,
  conversationHistory: ConversationMessage[] = []
): Promise<string> => {
  const style = useGenAlpha 
    ? "Gen Alpha style (using modern slang like 'sigma', 'rizz', 'Ohio', 'no cap', 'fam', 'chief', 'based', etc. Be supportive but use this contemporary language)" 
    : "supportive and empathetic";
  
  const emotionContext = previousEmotion && previousEmotion !== emotionResult.label 
    ? `The user's emotion has shifted from ${previousEmotion} to ${emotionResult.label}.` 
    : `The user is expressing ${emotionResult.label}.`;
  
  const intensityContext = emotionResult.score > 0.8 
    ? "The emotion is very intense." 
    : emotionResult.score < 0.4 
    ? "The emotion is subtle." 
    : "The emotion is moderate.";
  
  // Build conversation history for context
  const messages = [
    {
      role: "system",
      content: `You are an emotionally intelligent AI assistant that responds to users in a ${style}. ${emotionContext} ${intensityContext} 

Key guidelines:
- Acknowledge their emotional state authentically
- ${useGenAlpha ? "Use Gen Alpha slang naturally but remain supportive and caring" : "Use empathetic, supportive language"}
- Encourage further conversation
- Keep responses concise (1-3 sentences)
- Focus on emotional support and validation
- Ask open-ended questions to help them process their feelings

Respond in a way that makes them feel heard and understood.`
    },
    ...conversationHistory.slice(-3).map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: "user",
      content: userMessage
    }
  ];

  const response = await fetch(RESPONSE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESPONSE_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API request failed with status: ${response.status}. Error: ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Invalid response format from OpenAI API");
  }
  
  return data.choices[0].message.content.trim();
};

/**
 * Generates a therapist-style supportive message using Groq's Mixtral-8x7b model
 * @param emotions  Array of the top N detected GoEmotions labels (strings)
 * @returns Therapist-style supportive message (string) or null on failure
 */
export async function generateSupportiveMessageWithGroqLlama8b(
  emotions: string[] = [],
  userMessage?: string
): Promise<string | null> {
  // Use a therapist style, one sentence, always encouraging the user to share more
  const systemPrompt = `You are a compassionate, emotionally intelligent AI therapist. Respond with warmth, empathy, and psychological insight. Reply in a SINGLE concise sentence. Always encourage the user to share more, explore deeper, or reflect further. Do not offer solutions—just guide gently, one question or gentle nudge at a time.`;

  const instructions =
    emotions.length > 0
      ? `The user's most prominent emotion(s): ${emotions.join(", ")}. Give a one-sentence, open-ended, supportive therapist reflection according to the system prompt.`
      : `Provide a one-sentence, open-ended, supportive therapist reflection according to the system prompt.`;

  const body = {
    model: "mixtral-8x7b-32768",  // <--- Use Mixtral on Groq
    messages: [
      { role: "system", content: systemPrompt },
      ...(userMessage
        ? [{ role: "user", content: userMessage }]
        : []),
      { role: "user", content: instructions },
    ],
    temperature: 0.8,
    max_tokens: 80,
    stream: false,
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Groq API error:", err);
    // Return null if Mixtral fails (no fallback)
    return null;
  }

  const data = await response.json();
  // The API should return the text in data.choices[0].message.content
  const msg = (data?.choices && data.choices[0]?.message?.content) ? data.choices[0].message.content.trim() : null;
  if (!msg) {
    // No fallback
    return null;
  }
  // Clean up potential prefixed "output: ..." formatting
  const match = msg.match(/^"?output\s*:\s*["“”']?(.*)["“”']?$/i);
  if (match) return match[1].replace(/^["“”']|["“”']$/g, "");
  if (msg.startsWith('"') && msg.endsWith('"')) return msg.slice(1, -1);
  return msg;
}
