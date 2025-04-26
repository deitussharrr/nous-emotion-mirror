
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
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
        <p className="text-sm opacity-80">{score}% confidence</p>
      </div>
    );
  }
  return null;
};

const EmotionGraph: React.FC<EmotionGraphProps> = ({ emotionData }) => {
  // Format data for the pie chart
  const chartData = emotionData.map(item => ({
    name: item.label,
    value: item.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={60}
          paddingAngle={2}
          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getEmotionColor(entry.name as EmotionType)} 
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default EmotionGraph;
