
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationMessage } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import NoteEmotionGraph from '@/components/NoteEmotionGraph';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateSupportiveMessageWithGroqLlama8b } from "@/lib/generateResponse";
import { useToast } from '@/components/ui/use-toast';

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
      const newMessage: ConversationMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
      };
      const updatedMessages = [...existingMessages, newMessage];
      onAnalyze(text, title || undefined, updatedMessages);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getPlaceholder = () => {
    if (!lastEmotion) return "Write your note here...";
    switch(lastEmotion.toLowerCase()) {
      case "joy": return "What's making you happy right now?";
      case "sadness": return "I'm here to listen. What's on your mind?";
      case "anger": return "Want to talk about what's bothering you?";
      case "fear": return "Let's talk through what's worrying you...";
      case "surprise": return "Tell me more about what surprised you...";
      case "love": return "I'd love to hear more about those feelings...";
      default: return "What's on your mind today?";
    }
  };

  // Therapist calming message, improved to use both analyzed emotion and corresponding text
  const [calmingMessage, setCalmingMessage] = useState<string | null>(null);

  useEffect(() => {
    // Respond to the latest user message with both text and analyzed emotion
    const fetchTherapistMessage = async () => {
      if (!existingMessages || existingMessages.length === 0) return;

      // Find the latest user message that has an emotion
      for (let i = existingMessages.length - 1; i >= 0; i--) {
        const msg = existingMessages[i];
        if (msg.role === 'user' && msg.emotion) {
          let emotionLabels: string[] = [];
          if (Array.isArray(msg.emotion.emotions)) {
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
            // Pass both the text and primary emotions to the prompt (combine in one string)
            // We'll adjust generateSupportiveMessageWithGroqLlama8b so it now takes (emotionLabels: string[], text?: string)
            const inputText = msg.content;
            // Format the emotion labels and text into the prompt
            const combinedLabels = [...emotionLabels];
            // Call API with both text and emotions, the emotion labels are still prioritized
            const therapistMsg = await generateSupportiveMessageWithGroqLlama8b(combinedLabels, inputText);
            setCalmingMessage(therapistMsg || null);
            return;
          }
        }
      }
      setCalmingMessage(null);
    };
    fetchTherapistMessage();
    // Only rerun when the last user message (with emotion) changes
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
          <div className="rounded-xl bg-nousPurple/10 border border-nousPurple/20 p-4 space-y-4 flex items-center">
            {renderComfortingMessage()}
          </div>
        </div>
      )}
      {existingMessages.length > 1 && (
        <NoteEmotionGraph messages={existingMessages} />
      )}
      <div className="flex gap-2">
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

