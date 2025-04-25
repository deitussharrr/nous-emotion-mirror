
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { JournalEntry } from '../types';

interface EmotionGraphProps {
  entries: JournalEntry[];
}

const EmotionGraph: React.FC<EmotionGraphProps> = ({ entries }) => {
  if (!entries.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center border border-white/10 rounded-lg">
        <p className="text-nousText-muted text-sm">Start journaling to see your emotion trends</p>
      </div>
    );
  }

  // Transform entries for the chart
  const chartData = [...entries]
    .reverse()
    .map(entry => {
      // Format date for display
      const date = new Date(entry.timestamp);
      const formattedDate = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
      
      // Map emotion to a numeric value for the chart
      let emotionValue = 0;
      switch (entry.emotion.label) {
        case 'joy':
          emotionValue = 1;
          break;
        case 'surprise':
          emotionValue = 0.75;
          break;
        case 'neutral':
          emotionValue = 0.5;
          break;
        case 'fear':
          emotionValue = 0.25;
          break;
        case 'anger':
          emotionValue = 0;
          break;
        case 'sadness':
          emotionValue = -0.25;
          break;
        default:
          emotionValue = 0.5;
      }
      
      return {
        date: formattedDate,
        value: emotionValue,
        color: entry.emotion.color
      };
    });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      let emotion = "Neutral";
      const value = payload[0].value;
      
      if (value === 1) emotion = "Joy";
      else if (value === 0.75) emotion = "Surprise";
      else if (value === 0.5) emotion = "Neutral";
      else if (value === 0.25) emotion = "Fear";
      else if (value === 0) emotion = "Anger";
      else if (value === -0.25) emotion = "Sadness";
      
      return (
        <div className="bg-nousBackground p-2 border border-white/10 rounded-md shadow-md">
          <p className="text-xs text-nousText-secondary">{payload[0].payload.date}</p>
          <p className="font-semibold" style={{ color: payload[0].payload.color }}>{emotion}</p>
        </div>
      );
    }
    return null;
  };

  // Get the dominant emotion from recent entries
  const getEmotionSummary = () => {
    if (entries.length === 0) return null;
    
    const emotionCounts: Record<string, number> = {};
    entries.forEach(entry => {
      const emotion = entry.emotion.label;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    let dominantEmotion = 'neutral';
    let maxCount = 0;
    
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }
    
    return dominantEmotion;
  };

  const dominantEmotion = getEmotionSummary();
  
  return (
    <div className="w-full space-y-6">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2A303C" />
            <XAxis 
              dataKey="date" 
              stroke="#8E9196" 
              tick={{ fontSize: 12 }} 
            />
            <YAxis 
              stroke="#8E9196" 
              tick={{ fontSize: 12 }}
              domain={[-0.5, 1.5]}
              ticks={[-0.25, 0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(value) => {
                switch(value) {
                  case 1: return 'Joy';
                  case 0.75: return 'Surprise';
                  case 0.5: return 'Neutral';
                  case 0.25: return 'Fear';
                  case 0: return 'Anger';
                  case -0.25: return 'Sadness';
                  default: return '';
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7f5af0"
              strokeWidth={2}
              activeDot={{ r: 6, fill: "#9b87f5" }}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {dominantEmotion && (
        <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-nousText-secondary text-sm">
            You've been feeling more 
            <span className="font-semibold ml-1" style={{ color: entries[0]?.emotion.color }}>
              {dominantEmotion}
            </span> 
            {entries.length > 1 ? " recently" : " in your last entry"}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionGraph;
