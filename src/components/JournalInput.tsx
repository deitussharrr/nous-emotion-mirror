import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationMessage } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import NoteEmotionGraph from '@/components/NoteEmotionGraph';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processEmotionWithOpenRouter } from '@/lib/api/n8nService';
import { generateSupportiveMessageWithGroqLlama8b } from "@/lib/generateResponse";
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import WhisperApiVoiceInput from "./WhisperApiVoiceInput";

interface JournalInputProps {
  onAnalyze: (text: string, title?: string, messages?: ConversationMessage[]) => void;
  isLoading: boolean;
  lastEmotion?: string;
  activeNoteId?: string;
  existingMessages: ConversationMessage[];
}

const JournalInput: React.FC<JournalInputProps> = ({ 
  onAnalyze, 
  isLoading, 
  lastEmotion, 
  activeNoteId,
  existingMessages = []
}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (text.trim().length > 0) {
      // Create a new message
      const newMessage: ConversationMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
      };
      
      // Combine existing messages with new message
      const updatedMessages = [...existingMessages, newMessage];
      
      onAnalyze(text, title || undefined, updatedMessages);
      setText(''); // Clear input after sending
      // Don't clear title if we're adding to an existing note
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid newline
      handleSubmit();
    }
    // Shift+Enter will naturally create a new line as we don't prevent default
  };
  
  // Get placeholder based on conversation context
  const getPlaceholder = () => {
    if (!lastEmotion) return "Write your note here...";
    
    switch(lastEmotion.toLowerCase()) {
      case "joy":
        return "What's making you happy right now?";
      case "sadness":
        return "I'm here to listen. What's on your mind?";
      case "anger":
        return "Want to talk about what's bothering you?";
      case "fear":
        return "Let's talk through what's worrying you...";
      case "surprise":
        return "Tell me more about what surprised you...";
      case "love":
        return "I'd love to hear more about those feelings...";
      default:
        return "What's on your mind today?";
    }
  };

  // Get comforting message based on the last message emotion
  const [calmingMessage, setCalmingMessage] = useState<string | null>(null);

  // NEW: Therapist reflection via Groq Llama 8B
  useEffect(() => {
    const fetchTherapistMessage = async () => {
      if (!existingMessages || existingMessages.length === 0) return;
      // Find the most recent user message with analyzed emotions 
      for (let i = existingMessages.length - 1; i >= 0; i--) {
        const msg = existingMessages[i];
        // Check standard GoEmotions detection format
        if (msg.emotion && (msg.emotion.emotions || msg.emotion.label)) {
          let emotionLabels: string[] = [];
          if (Array.isArray(msg.emotion.emotions)) {
            // Sort by score, take top 4
            emotionLabels = msg.emotion.emotions
              .slice()
              .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
              .map(e => e.label)
              .filter(Boolean)
              .slice(0, 4);
          } else if (msg.emotion.label) {
            emotionLabels = [msg.emotion.label];
          }
          if (emotionLabels.length > 0) {
            setCalmingMessage("Reflecting on your message...");
            const therapistMsg = await generateSupportiveMessageWithGroqLlama8b(emotionLabels);
            setCalmingMessage(therapistMsg);
            return;
          }
        }
      }
      setCalmingMessage(null);
    };

    fetchTherapistMessage();
  }, [existingMessages]);

  const renderComfortingMessage = () => {
    if (!calmingMessage) return null;
    
    return (
      <Alert className="mb-4 bg-white/5 border-nousPurple">
        <AlertDescription className="text-nousText-primary">
          {calmingMessage}
        </AlertDescription>
      </Alert>
    );
  };

  // --- Voice Input Logic with Web Speech API (browser-only, free) ---
  const isSpeechRecognitionSupported =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Called when mic button is pressed
  const startVoiceInput = () => {
    if (!isSpeechRecognitionSupported) {
      toast({
        title: "Voice input unavailable",
        description: "Your browser does not support speech-to-text (Web Speech API). Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = true; // display words as you speak
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        toast({
          title: "Could not transcribe speech",
          description: event.error,
          variant: "destructive",
        });
      }
      setIsRecording(false);
      recognition.stop();
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // Called when user taps mic button again (to stop)
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
    }
  };

  // --- mic button: toggles recording ---
  const micButton = (
    <button
      type="button"
      aria-label={isRecording ? "Stop voice input" : "Record voice input"}
      onClick={isRecording ? stopVoiceInput : startVoiceInput}
      disabled={isLoading}
      className={`rounded-full bg-nousPurple/80 hover:bg-nousPurple/90 transition-colors p-3 mr-2 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}
      style={{ outline: isRecording ? '2px solid #c4a7e7' : undefined }}
    >
      {isRecording
        ? <MicOff className="h-5 w-5 text-white" />
        : <Mic className="h-5 w-5 text-white" />
      }
    </button>
  );

  // --- handle WhisperAPI transcription ---
  const handleWhisperTranscribe = (transcribed: string) => {
    if (transcribed && transcribed.trim()) {
      setText((prev) => prev.trim() ? prev + "\n" + transcribed : transcribed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      {!activeNoteId && (
        <input
          type="text"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none
                  text-nousText-primary placeholder-nousText-muted transition-all text-lg font-medium"
          placeholder="Note title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      )}
      
      {/* Display message history and comforting message side by side */}
      {existingMessages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4 max-h-[300px] overflow-y-auto">
            {existingMessages.map((message, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  message.role === 'user' ? 'bg-white/10 ml-12' : 'bg-nousPurple/20'
                }`}
              >
                <p className="text-sm text-nousText-muted mb-1">
                  {message.role === 'user' ? 'You' : 'Assistant'}:
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
          
          {/* Comforting message panel */}
          <div className="rounded-xl bg-nousPurple/10 border border-nousPurple/20 p-4 space-y-4 flex items-center">
            {renderComfortingMessage()}
          </div>
        </div>
      )}
      
      {/* Add Emotion Graph for this note */}
      {existingMessages.length > 1 && (
        <NoteEmotionGraph messages={existingMessages} />
      )}
      
      <div className="flex gap-2">
        {micButton}
        <WhisperApiVoiceInput
          onTranscribe={handleWhisperTranscribe}
          disabled={isLoading}
        />
        <div className="flex-1 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
          <Textarea
            ref={textareaRef}
            className="w-full px-4 py-3 bg-transparent focus:outline-none
                      text-nousText-primary placeholder-nousText-muted transition-all
                      text-base leading-relaxed resize-none min-h-[120px] max-h-[300px]"
            placeholder={getPlaceholder()}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            rows={3}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className="rounded-full h-12 w-12 bg-nousPurple hover:bg-nousPurple/80 self-start"
          disabled={isLoading || text.trim().length === 0}
        >
          {isLoading ? (
            <svg 
              className="animate-spin h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </form>
  );
};

export default JournalInput;
