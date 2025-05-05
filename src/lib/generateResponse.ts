
import { ConversationMessage, EmotionResult, EmotionType } from "@/types";
import { generateLlamaResponse } from "./llamaService";

export const generateResponse = async (
  text: string,
  emotionResult: EmotionResult,
  useGenZ: boolean,
  previousEmotion?: string,
  conversationHistory: ConversationMessage[] = []
): Promise<string> => {
  try {
    // Prepare conversation context for the Llama model
    const hasEmotionShift = previousEmotion && previousEmotion !== emotionResult.label;
    
    let promptContext = "";
    if (conversationHistory.length > 0) {
      promptContext = "Previous conversation:\n";
      conversationHistory.forEach(msg => {
        promptContext += `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}\n`;
      });
      promptContext += "\n";
    }
    
    // Craft a prompt for Llama-2
    let prompt = `${promptContext}The user shared: "${text}"\n\n`;
    prompt += `Their current emotion is: ${emotionResult.label} (confidence: ${Math.round(emotionResult.score * 100)}%)\n`;
    
    if (hasEmotionShift) {
      prompt += `Note: Their emotion has changed from ${previousEmotion} to ${emotionResult.label}.\n`;
    }
    
    prompt += `Style guide: ${useGenZ ? "Use GenZ slang, be casual and trendy, use emojis." : "Be empathetic, supportive, and professional."}\n\n`;
    prompt += "Write a brief, compassionate response acknowledging their emotional state and encouraging further discussion:";
    
    // Generate response using Llama-2
    const llamaResponse = await generateLlamaResponse(prompt, {
      temperature: useGenZ ? 0.8 : 0.7,
      maxTokens: 256
    });
    
    // Clean up the response
    let cleanedResponse = llamaResponse
      .replace("[Response generated using Llama-2-13b model]", "")
      .trim();
      
    return cleanedResponse;
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Fallback response generator in case the Llama API fails
    console.log("Using fallback response generator");
    let response = "";
    
    const emotion = emotionResult.label.toLowerCase() as EmotionType;
    const intensity = emotionResult.score > 0.8 ? "very " : emotionResult.score > 0.5 ? "" : "somewhat ";
    
    if (useGenZ) {
      // GenZ style responses
      switch (emotion) {
        case "joy":
          response = `Yasss! You're ${intensity}happy rn and that's a total vibe! 🔥 Keep that energy up! Wanna share what's got you so hyped?`;
          break;
        case "sadness":
          response = `Oof, I can tell you're ${intensity}down bad rn. 😔 It's okay to not be okay. Wanna talk about what's going on?`;
          break;
        case "anger":
          response = `I see you're ${intensity}pressed about something. 😤 That's valid! Let it out - what's got you heated?`;
          break;
        case "fear":
          response = `Ngl, seems like you're ${intensity}stressed. 😰 We all get those anxiety vibes sometimes. What's making you nervous?`;
          break;
        case "surprise":
          response = `Wait, you're ${intensity}shook! 😲 That's wild! What's got you so surprised?`;
          break;
        case "love":
          response = `You're giving major heart eyes energy! 💖 Love to see it! Who's got you feeling all the feels?`;
          break;
        default:
          response = `I'm picking up ${intensity}neutral vibes from you. What's on your mind? I'm all ears!`;
      }
    } else {
      // Professional style responses
      switch (emotion) {
        case "joy":
          response = `I notice you're feeling ${intensity}joyful. It's wonderful to see you in good spirits. Would you like to share what's bringing you happiness?`;
          break;
        case "sadness":
          response = `I sense that you're feeling ${intensity}sad. It's perfectly normal to feel down sometimes. Would you like to talk about what's troubling you?`;
          break;
        case "anger":
          response = `I can see that you're feeling ${intensity}angry. Your feelings are valid, and it's important to acknowledge them. Would you like to discuss what's frustrating you?`;
          break;
        case "fear":
          response = `I notice you're experiencing ${intensity}fear or anxiety. These feelings can be challenging, but recognizing them is a positive step. Would you like to explore what's causing this concern?`;
          break;
        case "surprise":
          response = `You seem ${intensity}surprised. Unexpected events can certainly catch us off guard. Would you like to talk more about what surprised you?`;
          break;
        case "love":
          response = `I can see you're expressing ${intensity}love or affection. These positive connections are important in our lives. Would you like to share more about these feelings?`;
          break;
        default:
          response = `I'm noticing a ${intensity}neutral tone in your message. I'm here to listen if you'd like to explore your thoughts further.`;
      }
    }
    
    return response;
  }
};
