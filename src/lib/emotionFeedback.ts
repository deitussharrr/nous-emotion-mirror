// src/lib/emotionFeedback.ts

export const getEmotionFeedback = (emotion: string, score: number): string => {
  const intensity = score > 0.8 ? "strongly " : score > 0.6 ? "quite " : "";

  switch (emotion) {
    case "joy":
      return `I sense that you're ${intensity}feeling joy. It's wonderful to see you experiencing positive emotions. What's bringing you this happiness?`;
    case "sadness":
      return `It seems you're ${intensity}feeling sad. It's okay to feel this way. Would you like to talk more about what's troubling you?`;
    case "anger":
      return `You're ${intensity}feeling angry. Your feelings are valid. Let's try to understand what's causing this anger and how we can address it.`;
    case "fear":
      return `I notice you're ${intensity}experiencing fear or anxiety. Remember, you're not alone. Can you share more about what's causing these feelings?`;
    case "surprise":
      return `You're ${intensity}surprised. Sometimes unexpected events can be overwhelming. Would you like to discuss it further?`;
    case "love":
      return `You're ${intensity}feeling love. That's a beautiful emotion. Would you like to share more about it?`;
    default:
      return "Thank you for sharing. Would you like to tell me more about how you're feeling?";
  }
};
