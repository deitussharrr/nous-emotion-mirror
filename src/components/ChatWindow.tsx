
import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { JournalEntry, ConversationMessage } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatWindowProps {
  entries: JournalEntry[];
  date: string;
  onDelete?: (id: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ entries, date, onDelete }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Convert journal entries to conversation messages format
  const messages: ConversationMessage[] = entries.flatMap(entry => [
    {
      role: 'user',
      content: entry.text,
      timestamp: entry.timestamp
    },
    {
      role: 'assistant',
      content: entry.emotion.feedback,
      timestamp: entry.timestamp
    }
  ]);

  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden flex flex-col">
      <div className="p-3 border-b border-white/10 flex justify-between items-center sticky top-0 bg-white/5 backdrop-blur-md">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <span className="bg-nousPurple/30 h-7 w-7 flex items-center justify-center rounded-full">
            💬
          </span>
          {format(new Date(date), 'EEEE, MMMM d')}
        </h3>
        <span 
          className="text-xs px-3 py-1 rounded-full bg-white/10"
        >
          {entries.length} messages
        </span>
      </div>

      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          {sortedMessages.map((message, index) => {
            const entryId = message.role === 'user' && index < sortedMessages.length - 1 ? 
              entries.find(e => e.text === message.content)?.id : undefined;
              
            return (
              <div 
                key={`${message.timestamp}-${index}`} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.role === 'user' 
                      ? 'bg-nousPurple/30 rounded-tr-none' 
                      : 'bg-white/10 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className={`h-6 w-6 rounded-full flex items-center justify-center 
                        ${message.role === 'user' ? 'bg-nousPurple/20' : 'bg-white/10'}`}
                    >
                      <span className="text-sm">
                        {message.role === 'user' ? '👤' : '🤖'}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {message.role === 'user' ? 'You' : 'AI'}
                    </span>
                    <span className="text-xs text-nousText-muted">
                      {message.timestamp ? format(new Date(message.timestamp), 'p') : ''}
                    </span>
                    
                    {message.role === 'user' && entryId && onDelete && (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 text-xs ml-auto"
                        onClick={() => onDelete(entryId)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatWindow;
