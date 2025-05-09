
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
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${entry.emotion.color}30` }}
          >
            <span>{getEmotionEmoji(entry.emotion.label)}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-nousText-primary text-lg">
              {entry.title || `Note from ${format(new Date(entry.timestamp), 'MMM d, yyyy')}`}
            </h3>
            <span className="text-xs text-nousText-muted">
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
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
            onClick={() => onDelete(entry.id)}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="space-y-3 pl-10">
        <div className="text-nousText-secondary bg-white/5 rounded-lg p-3">
          <p className="whitespace-pre-wrap">{entry.text}</p>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.emotion.emotions?.slice(0, 3).map((emotion: any, index: number) => (
            <span 
              key={index} 
              className="text-xs px-2 py-0.5 rounded-full bg-white/10"
              title={`${emotion.label}: ${(emotion.score * 100).toFixed(1)}%`}
            >
              {emotion.label}: {(emotion.score * 100).toFixed(0)}%
            </span>
          ))}
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
    case "admiration": return "🤩";
    case "amusement": return "😄";
    case "annoyance": return "😒";
    case "approval": return "👍";
    case "caring": return "🤗";
    case "confusion": return "🤔";
    case "curiosity": return "🧐";
    case "desire": return "😍";
    case "disappointment": return "😞";
    case "disapproval": return "👎";
    case "disgust": return "🤢";
    case "embarrassment": return "😳";
    case "excitement": return "🤩";
    case "gratitude": return "🙏";
    case "grief": return "💔";
    case "nervousness": return "😰";
    case "optimism": return "🌈";
    case "pride": return "🦚";
    case "realization": return "💡";
    case "relief": return "😌";
    case "remorse": return "😔";
    default: return "🤔";
  }
}

export default ConversationSummary;
