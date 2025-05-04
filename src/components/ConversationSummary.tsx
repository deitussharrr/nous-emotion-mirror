
import React from 'react';
import { format } from 'date-fns';
import { JournalEntry } from '@/types';
import { EmotionType } from '@/types';

interface ConversationSummaryProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({ entry, onDelete }) => {
  return (
    <div
      className="p-4 rounded-lg bg-white/5 border border-white/10 mb-3 relative group hover:bg-white/10 transition-colors"
      style={{ borderLeftColor: entry.emotion.color, borderLeftWidth: '4px' }}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <div 
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${entry.emotion.color}30` }}
          >
            <span>{getEmotionEmoji(entry.emotion.label)}</span>
          </div>
          <div>
            <span className="font-medium text-nousText-primary">You</span>
            <span className="text-xs text-nousText-muted ml-2">
              {format(new Date(entry.timestamp), 'p')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span 
              className="text-xs font-medium px-2 py-1 rounded-full" 
              style={{ backgroundColor: `${entry.emotion.color}20`, color: entry.emotion.color }}
            >
              {entry.emotion.label}
            </span>
            <span className="text-xs text-nousText-muted ml-2">
              {Math.round((entry.emotion.score || 0) * 100)}% confidence
            </span>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
            onClick={() => onDelete(entry.id)}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="ml-10 space-y-3">
        <div className="text-nousText-secondary bg-white/5 rounded-lg p-3">
          <p className="whitespace-pre-wrap">{entry.text}</p>
        </div>
        
        <div className="text-nousText-secondary">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="h-6 w-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${entry.emotion.color}20` }}
            >
              <span className="text-sm">🪞</span>
            </div>
            <span className="font-medium text-nousText-primary text-sm">AI Response</span>
            <span className="text-xs text-nousText-muted">
              {format(new Date(entry.timestamp), 'p')}
            </span>
          </div>
          
          <div className="ml-8 bg-white/5 rounded-lg p-3 border-l-2" style={{ borderLeftColor: entry.emotion.color }}>
            <p className="text-nousText-secondary">{entry.emotion.feedback}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get emoji based on emotion
function getEmotionEmoji(emotion: string): string {
  switch (emotion.toLowerCase()) {
    case "joy": return "😊";
    case "sadness": return "😢";
    case "anger": return "😠";
    case "fear": return "😨";
    case "surprise": return "😲";
    case "love": return "❤️";
    case "neutral": return "😐";
    default: return "🤔";
  }
}

export default ConversationSummary;
