
import React from 'react';
import { JournalEntry } from '@/types';
import { format } from 'date-fns';

interface JournalHistoryProps {
  entries: JournalEntry[];
}

const JournalHistory: React.FC<JournalHistoryProps> = ({ entries }) => {
  if (!entries.length) {
    return (
      <div className="text-center p-8">
        <p className="text-nousText-muted">Start journaling to see your entries here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-nousText-secondary">Journal History</h2>
      <div className="space-y-4">
        {entries.map(entry => (
          <div
            key={entry.id}
            className="p-6 rounded-lg bg-white/5 border border-white/10"
            style={{ borderLeftColor: entry.emotion.color, borderLeftWidth: '4px' }}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-nousText-muted">
                {format(new Date(entry.timestamp), 'PPpp')}
              </span>
              <span 
                className="text-sm font-medium px-2 py-1 rounded-full" 
                style={{ backgroundColor: `${entry.emotion.color}20`, color: entry.emotion.color }}
              >
                {entry.emotion.label}
              </span>
            </div>
            <p className="text-nousText-primary whitespace-pre-wrap">{entry.text}</p>
            <p className="mt-4 text-sm text-nousText-secondary">{entry.emotion.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalHistory;
