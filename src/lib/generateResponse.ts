
import { EmotionType, EmotionResult, ConversationMessage } from "../types";

const RESPONSE_API_URL = "https://api.openai.com/v1/chat/completions";
// This is just a placeholder API token - in a real app, this should be stored securely
const RESPONSE_API_TOKEN = ""; 

// Fallback responses when the API fails
const getFallbackResponse = (
  emotion: EmotionType,
  useGenZ: boolean = false,
  previousEmotion?: string
): string => {
  const responseStyle = useGenZ ? "genZ" : "supportive";
  
  // Simple fallback responses when API is unavailable
  if (useGenZ) {
    // Gen Z style responses
    switch (emotion) {
      case "joy":
        return previousEmotion === "sadness"
          ? "Yooo, look at this mood glow up! From sad to happy vibes! What changed?"
          : "You're totally giving happy vibes rn! What's got you so hyped?";
      
      case "sadness":
        return previousEmotion === "joy"
          ? "Dang, your mood just switched up. Everything good?"
          : "Seems like you're in your feels. Wanna talk about it?";
      
      case "anger":
        return "You're giving pressed energy. What's got you triggered?";
      
      case "fear":
        return "Getting anxious vibes. No cap, what's stressing you out?";
      
      case "surprise":
        return "That's wild! You're shook, huh?";
      
      case "love":
        return "You're catching feelings! Who's the main character in this story?";
      
      case "neutral":
        return previousEmotion ? "Seems like your vibe's evened out a bit. What's up?" : "Just chillin'? What's on your mind?";
      
      default:
        return "Thanks for the update! No cap, I'm here to listen. Spill?";
    }
  } else {
    // Regular supportive responses
    switch (emotion) {
      case "joy":
        return previousEmotion === "sadness"
          ? "I notice your mood has brightened! What helped turn things around?"
          : "I see you're feeling positive! What's bringing you this happiness?";
      
      case "sadness":
        return previousEmotion === "joy"
          ? "I notice your mood has shifted. Would you like to talk about what changed?"
          : "It sounds like you might be feeling down. I'm here if you want to talk about it.";
      
      case "anger":
        return "I sense some frustration in your message. Would you like to explore what's bothering you?";
      
      case "fear":
        return "It seems like you might be feeling anxious about something. Would you like to talk about what's concerning you?";
      
      case "surprise":
        return "That sounds unexpected! How are you feeling about this surprise?";
      
      case "love":
        return "Those are warm feelings you're expressing. Would you like to share more about this connection?";
      
      case "neutral":
        return previousEmotion ? "Your mood seems to have balanced out. How are you feeling now?" : "How are things going for you today?";
      
      default:
        return "Thank you for sharing. I'm here to listen whenever you need someone to talk to.";
    }
  }
};

export const generateResponse = async (
  userMessage: string,
  emotionResult: EmotionResult,
  useGenZ: boolean = false,
  previousEmotion?: string,
  conversationHistory: ConversationMessage[] = []
): Promise<string> => {
  try {
    // Skip API call if no token is provided and use fallback response
    if (!RESPONSE_API_TOKEN) {
      throw new Error("No API token provided");
    }

    const style = useGenZ ? "Gen Z style (using slang like 'bestie', 'vibes', 'no cap', etc.)" : "supportive and empathetic";
    const emotionContext = previousEmotion && previousEmotion !== emotionResult.label 
      ? `The user's emotion has shifted from ${previousEmotion} to ${emotionResult.label}.` 
      : `The user is expressing ${emotionResult.label}.`;
    
    // Build conversation history for context
    const messages = [
      {
        role: "system",
        content: `You are an emotionally intelligent AI assistant that responds to users in a ${style}. ${emotionContext} Respond to the user in a way that acknowledges their emotional state and encourages further conversation. Keep responses concise (1-3 short sentences).`
      },
      ...conversationHistory.map(msg => ({
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
        model: "gpt-3.5-turbo", // Or any other appropriate model
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Response API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
    
  } catch (error) {
    console.error("Error generating response, using fallback:", error);
    // Use fallback response if API fails
    return getFallbackResponse(emotionResult.label as EmotionType, useGenZ, previousEmotion);
  }
};
