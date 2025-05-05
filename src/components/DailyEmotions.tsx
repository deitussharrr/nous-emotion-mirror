
import React, { useState } from 'react';
import { format } from 'date-fns';
import { JournalEntry, EmotionType } from '@/types';
import EmotionGraph from './EmotionGraph';
import ChatWindow from './ChatWindow';
import { Button } from '@/components/ui/button';
import { ChartLine, MessageCircle } from 'lucide-react';

interface DailyEmotionsProps {
  entries: JournalEntry[];
  date: string;
  onDelete?: (id: string) => void;
}

const DailyEmotions: React.FC<DailyEmotionsProps> = ({ entries, date, onDelete }) => {
  const [view, setView] = useState<'chart' | 'chat'>('chat');
  
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
    <div className="rounded-lg bg-white/5 border border-white/10 mb-4 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <span className="bg-nousPurple/30 h-7 w-7 flex items-center justify-center rounded-full">
            {view === 'chart' ? '📊' : '💬'}
          </span>
          {format(new Date(date), 'EEEE, MMMM d')}
        </h3>
        
        <div className="flex items-center gap-2">
          <span 
            className="text-sm px-3 py-1 rounded-full bg-white/10"
            title="Average emotion score"
          >
            Average: {(averageEmotion * 100).toFixed(0)}%
          </span>
          
          <div className="flex bg-white/5 rounded-lg p-1">
            <Button 
              variant={view === 'chat' ? "default" : "ghost"}
              size="sm"
              className="rounded-lg h-8 px-2"
              onClick={() => setView('chat')}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
            <Button 
              variant={view === 'chart' ? "default" : "ghost"}
              size="sm"
              className="rounded-lg h-8 px-2"
              onClick={() => setView('chart')}
            >
              <ChartLine className="h-4 w-4 mr-1" />
              Chart
            </Button>
          </div>
        </div>
      </div>
      
      {view === 'chart' ? (
        <div className="h-[180px] p-4">
          <EmotionGraph emotionData={emotionData} dayView />
        </div>
      ) : (
        <ChatWindow entries={entries} date={date} onDelete={onDelete} />
      )}
    </div>
  );
};

export default DailyEmotions;
