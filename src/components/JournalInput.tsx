
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JournalInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  lastEmotion?: string;
}

const JournalInput: React.FC<JournalInputProps> = ({ onAnalyze, isLoading, lastEmotion }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length > 0) {
      onAnalyze(text);
      setText(''); // Clear input after sending
    }
  };
  
  // Get placeholder based on conversation context
  const getPlaceholder = () => {
    if (!lastEmotion) return "Type your message here...";
    
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
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
          <textarea
            ref={textareaRef}
            className="w-full px-4 py-3 bg-transparent focus:outline-none
                     text-nousText-primary placeholder-nousText-muted transition-all
                     text-base leading-relaxed resize-none min-h-[60px] max-h-[150px]"
            placeholder={getPlaceholder()}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (text.trim().length > 0) {
                  handleSubmit(e);
                }
              }
            }}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className="rounded-full h-12 w-12 bg-nousPurple hover:bg-nousPurple/80"
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
