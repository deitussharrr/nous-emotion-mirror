
import React from 'react';
import { format } from 'date-fns';
import { JournalEntry, EmotionType } from '@/types';
import EmotionGraph from './EmotionGraph';

interface DailyEmotionsProps {
  entries: JournalEntry[];
  date: string;
}

const DailyEmotions: React.FC<DailyEmotionsProps> = ({ entries, date }) => {
  // Create a data point for each entry in the day, ensuring they're sorted by time
  const emotionData = entries
    .map(entry => ({
      timestamp: entry.timestamp,
      label: entry.emotion.label as EmotionType,
      score: entry.emotion.score
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Calculate average emotion for the day
  const averageEmotion = entries.reduce((acc, entry) => {
    return acc + entry.emotion.score;
  }, 0) / entries.length;

  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <span className="bg-nousPurple/30 h-7 w-7 flex items-center justify-center rounded-full">
            📊
          </span>
          {format(new Date(date), 'EEEE, MMMM d')}
        </h3>
        <span 
          className="text-sm px-3 py-1 rounded-full bg-white/10"
          title="Average emotion score"
        >
          Average: {(averageEmotion * 100).toFixed(0)}%
        </span>
      </div>
      <div className="h-[180px]">
        <EmotionGraph emotionData={emotionData} dayView />
      </div>
    </div>
  );
};

export default DailyEmotions;
