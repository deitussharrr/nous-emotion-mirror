
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EmotionType } from "../types";
import { getEmotionColor } from "../lib/analyzeEmotion";

interface EmotionGraphProps {
  emotionData: { label: EmotionType; score: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const emotion = payload[0].name;
    const score = Math.round(payload[0].value * 100);
    return (
      <div className="p-2 bg-white/10 backdrop-blur-md rounded-md border border-white/20 shadow-lg">
        <p className="capitalize font-medium">{emotion}</p>
        <p className="text-sm opacity-80">{score}% of entries</p>
      </div>
    );
  }
  return null;
};

const EmotionGraph: React.FC<EmotionGraphProps> = ({ emotionData }) => {
  const chartData = emotionData.map(item => ({
    name: item.label,
    value: item.score,
    fill: getEmotionColor(item.label),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#CED4DA' }}
          tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
        <YAxis 
          tick={{ fill: '#CED4DA' }}
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EmotionGraph;
