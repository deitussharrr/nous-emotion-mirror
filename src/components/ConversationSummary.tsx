
import React from 'react';
import { format } from 'date-fns';
import { JournalEntry } from '@/types';
import EmotionGraph from '@/components/EmotionGraph';
import { EmotionType } from '@/types';

interface ConversationSummaryProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({ entry, onDelete }) => {
  // Format data for the emotion graph
  const emotionData = [{
    timestamp: entry.timestamp,
    label: entry.emotion.label as EmotionType,
    score: entry.emotion.score
  }];

  return (
    <div
      className="p-6 rounded-lg bg-white/5 border border-white/10 relative group space-y-4"
      style={{ borderLeftColor: entry.emotion.color, borderLeftWidth: '4px' }}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm text-nousText-muted">
          {format(new Date(entry.timestamp), 'PPP p')}
        </span>
        <div className="flex items-center gap-2">
          <span 
            className="text-sm font-medium px-2 py-1 rounded-full" 
            style={{ backgroundColor: `${entry.emotion.color}20`, color: entry.emotion.color }}
          >
            {entry.emotion.label}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
            onClick={() => onDelete(entry.id)}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium text-nousText-primary">Conversation Summary</h4>
        <div className="text-sm text-nousText-secondary">
          <div className="mb-2 p-3 bg-white/5 rounded-lg">
            <p className="italic">"{entry.text}"</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p>{entry.emotion.feedback}</p>
          </div>
        </div>
      </div>
      
      <div className="pt-2">
        <h4 className="font-medium text-nousText-primary mb-2">Emotional Response</h4>
        <div className="h-[120px]">
          <EmotionGraph emotionData={emotionData} compact />
        </div>
      </div>
    </div>
  );
};

export default ConversationSummary;
