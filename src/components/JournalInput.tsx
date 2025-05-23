
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationMessage } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import NoteEmotionGraph from '@/components/NoteEmotionGraph';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processEmotionWithOpenRouter } from '@/lib/api/n8nService';

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

  useEffect(() => {
    const fetchCalmingMessage = async () => {
      if (!existingMessages || existingMessages.length === 0) return;
      let userNeedsToShareMore = true;
      const contextMessages = existingMessages.map(msg => msg.content).join(' ');
      while (userNeedsToShareMore) {
        for (let i = existingMessages.length - 1; i >= 0; i--) {
          const message = existingMessages[i];
          if (message.emotion) {
            const response = await processEmotionWithOpenRouter(
              contextMessages,
              message.emotion,
              activeNoteId || 'temp',
              'google/gemma-3-4b-it:free' // Ensure the new LLM model is used
            );
            setCalmingMessage(response);
            userNeedsToShareMore = response.includes('Can you elaborate on that?') || response.includes('Tell me more about how you\'re feeling.');
            break;
          }
        }
      }
    };

    fetchCalmingMessage();
  }, [existingMessages, activeNoteId]);

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
