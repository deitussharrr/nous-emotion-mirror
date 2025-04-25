import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { EmotionType } from "../types";

interface Props {
  emotionData: { label: EmotionType; score: number }[];
}

const EmotionGraph: React.FC<Props> = ({ emotionData }) => {
  const colors: Record<EmotionType, string> = {
    joy: "#FFD43B",
    sadness: "#5C7CFA",
    anger: "#FA5252",
    fear: "#BE4BDB",
    surprise: "#20C997",
    love: "#FF8787", // soft pink for love
    neutral: "#CED4DA",
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={emotionData}
          dataKey="score"
          outerRadius={120}
          fill="#8884d8"
          label
        >
          {emotionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[entry.label as EmotionType]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default EmotionGraph;
