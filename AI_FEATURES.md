# 🤖 AI-Powered Emotional Response System

## Overview
The emotion mirror now includes AI-powered customized responses that generate personalized, context-aware replies based on the user's input and detected emotions.

## Features

### 🧠 **AI-Generated Responses**
- **OpenRouter Integration**: Uses Mistral Small 3.2B (24B Instruct) for natural, empathetic responses
- **Context Awareness**: Considers conversation history and emotion transitions
- **Emotion-Specific**: Tailored responses for each of the 27+ Gen Z emotions
- **Language Style**: Adapts between Gen Z slang and traditional language
- **Intensity Matching**: Responses vary based on emotion intensity (high/moderate/low)

### 🔄 **Fallback System**
1. **Primary**: AI-generated response (OpenRouter + Mistral)
2. **Secondary**: N8N workflow response
3. **Tertiary**: Local fallback responses

### 🎯 **Response Customization**
- **Emotion Context**: Each emotion has specific response guidelines
- **Conversation History**: Considers recent messages for context
- **Emotion Transitions**: Acknowledges changes in emotional state
- **Follow-up Questions**: Encourages continued conversation

## Setup

### Required API Keys
```bash
# OpenRouter API Key (for AI responses)
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Hugging Face API Key (for emotion detection)
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
```

### Environment Variables
Add these to your `.env` file:
```env
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
HUGGINGFACE_API_KEY=hf-your-huggingface-key
N8N_WORKFLOW_URL=your-n8n-webhook-url
```

## How It Works

### 1. **Emotion Detection**
- Analyzes user input using Hugging Face's `facebook/bart-large-mnli` model
- Detects one of 27+ Gen Z emotions with confidence scores
- Falls back to keyword-based detection if API fails

### 2. **AI Response Generation**
- Creates detailed prompts with emotion context
- Sends to OpenRouter API with Mistral model
- Generates personalized, empathetic responses
- Includes follow-up questions to encourage conversation

### 3. **Context Integration**
- **Previous Emotions**: Tracks emotional state changes
- **Conversation History**: Uses recent messages for context
- **Language Preference**: Adapts to Gen Z or traditional style
- **Emotion Intensity**: Adjusts response tone based on confidence scores

## Response Examples

### Gen Z Style (High Intensity "Bossed")
```
"YASSS you absolutely BOSSED that! That confidence is everything! 
You're giving main character energy and I'm here for it! 👑✨ 
What's got you feeling this powerful?"
```

### Traditional Style (Moderate "Stressed")
```
"I can sense you're going through a stressful time. Your feelings are 
completely valid. I'm here to listen if you'd like to talk about it. 
What's weighing most heavily on your mind?"
```

### AI-Generated (Context-Aware)
```
"Wow, I can feel the shift in your energy! You went from feeling 
overwhelmed to absolutely crushing it! That transformation is 
incredible. What changed that got you feeling so confident? 
You're literally radiating success vibes right now! 💪✨"
```

## Emotion Categories

### Positive/High Energy
- `vibing`, `bossed`, `lit`, `blessed`, `confident`, `inspired`, `excited`, `hopeful`, `proud`, `happy`, `peaceful`, `grateful`

### Neutral/General
- `mood`, `neutral`, `soft`, `savage`

### Negative/Stressed
- `stressed`, `anxious`, `overwhelmed`, `frustrated`, `lonely`, `angry`, `tired`, `confused`, `nervous`, `sad`, `depressed`

### Special Cases
- `cringe`, `distress` (emergency)

## Error Handling

### Graceful Degradation
1. **AI API Fails** → Falls back to N8N workflow
2. **N8N Fails** → Falls back to local responses
3. **All Fail** → Shows error message to user

### Rate Limiting
- Implements timeout handling (20 seconds)
- Retries with exponential backoff
- User-friendly error messages

## Benefits

### 🎯 **Personalization**
- Responses tailored to specific emotions
- Context-aware conversation flow
- Language style adaptation

### 🧠 **Intelligence**
- Learns from conversation patterns
- Adapts to user preferences
- Maintains conversation continuity

### 🛡️ **Reliability**
- Multiple fallback layers
- Graceful error handling
- Consistent user experience

### 💬 **Engagement**
- Natural conversation flow
- Follow-up questions
- Emotional validation

## Future Enhancements

### Planned Features
- **Memory**: Long-term conversation memory
- **Learning**: Adapt to user's communication style
- **Multimodal**: Support for voice and image emotions
- **Analytics**: Response effectiveness tracking
- **Customization**: User-defined response preferences

### Technical Improvements
- **Caching**: Cache common responses
- **Optimization**: Reduce API latency
- **Scaling**: Handle multiple concurrent users
- **Security**: Enhanced API key management
