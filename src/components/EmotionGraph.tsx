
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EmotionType } from "../types";
import { getEmotionColor } from "../lib/analyzeEmotion";
import { format } from "date-fns";

interface EmotionGraphProps {
  emotionData: {
    timestamp: string;
    label: EmotionType;
    score: number;
  }[];
  compact?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const emotion = payload[0].payload.label;
    const date = format(new Date(label), 'PPP');
    return (
      <div className="p-2 bg-white/10 backdrop-blur-md rounded-md border border-white/20 shadow-lg">
        <p className="text-sm text-muted">{date}</p>
        <p className="capitalize font-medium">{emotion}</p>
      </div>
    );
  }
  return null;
};

const EmotionGraph: React.FC<EmotionGraphProps> = ({ emotionData, compact = false }) => {
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
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
        />
        <YAxis 
          tick={{ fill: '#CED4DA' }}
          domain={['dataMin', 'dataMax']}
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
