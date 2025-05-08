
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EmotionType } from "../types";
import { format } from "date-fns";

interface EmotionGraphProps {
  emotionData: {
    timestamp: string;
    label: EmotionType;
    score: number;
  }[];
  compact?: boolean;
  dayView?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const emotion = payload[0].payload.label;
    const time = format(new Date(label), 'p');
    const date = format(new Date(label), 'PPP');
    
    return (
      <div className="p-3 bg-white/10 backdrop-blur-md rounded-md border border-white/20 shadow-lg">
        <p className="text-sm text-muted-foreground">{date} at {time}</p>
        <p className="capitalize font-medium flex items-center gap-1">
          <span>{getEmotionEmoji(emotion)}</span>
          <span>{emotion}</span>
          <span className="ml-1 opacity-70">({(payload[0].value * 100).toFixed(0)}%)</span>
        </p>
      </div>
    );
  }
  return null;
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

const EmotionGraph: React.FC<EmotionGraphProps> = ({ emotionData, compact = false, dayView = false }) => {
  const sortedData = [...emotionData].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
      <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="timestamp"
          tick={{ fill: '#CED4DA' }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return dayView ? format(date, 'HH:mm') : format(date, 'MMM d');
          }}
          minTickGap={15}
        />
        <YAxis 
          tick={{ fill: '#CED4DA' }}
          domain={[0, 1]}
          ticks={[0, 0.25, 0.5, 0.75, 1]}
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone"
          dataKey="score"
          stroke="#7f5af0"
          strokeWidth={2}
          dot={{ fill: "#7f5af0", r: 4 }}
          activeDot={{ r: 6, fill: "#9b87f5" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EmotionGraph;
