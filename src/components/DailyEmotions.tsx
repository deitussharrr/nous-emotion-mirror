
import React from 'react';
import { format } from 'date-fns';
import { JournalEntry } from '@/types';
import EmotionGraph from './EmotionGraph';

interface DailyEmotionsProps {
  entries: JournalEntry[];
  date: string;
}

const DailyEmotions: React.FC<DailyEmotionsProps> = ({ entries, date }) => {
  const emotionData = entries.map(entry => ({
    timestamp: entry.timestamp,
    label: entry.emotion.label as EmotionType,
    score: entry.emotion.score
  }));

  // Calculate average emotion for the day
  const averageEmotion = entries.reduce((acc, entry) => {
    return acc + entry.emotion.score;
  }, 0) / entries.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Emotions on {format(new Date(date), 'PPP')}
        </h3>
        <span 
          className="text-sm px-3 py-1 rounded-full bg-white/10"
          title="Average emotion score"
        >
          Average: {(averageEmotion * 100).toFixed(0)}%
        </span>
      </div>
      <EmotionGraph emotionData={emotionData} compact />
    </div>
  );
};

export default DailyEmotions;
