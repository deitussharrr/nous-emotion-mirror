
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EmotionType } from "../types";
import { format } from "date-fns";

interface EmotionGraphProps {
  emotionData: {
    timestamp: string;
    label: EmotionType;
    score: number;
    messageContent?: string;
  }[];
  compact?: boolean;
  dayView?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const emotion = payload[0].payload.label;
    const time = format(new Date(label), 'p');
    const date = format(new Date(label), 'PPP');
    const messageContent = payload[0].payload.messageContent;
    
    return (
      <div className="p-3 bg-white/10 backdrop-blur-md rounded-md border border-white/20 shadow-lg max-w-xs">
        <p className="text-sm text-muted-foreground">{date} at {time}</p>
        <p className="capitalize font-medium flex items-center gap-1">
          <span>{getEmotionEmoji(emotion)}</span>
          <span>{emotion}</span>
          <span className="ml-1 opacity-70">({(payload[0].value * 100).toFixed(0)}%)</span>
        </p>
        {messageContent && (
          <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">{messageContent}</p>
        )}
      </div>
    );
  }
  return null;
};

// Helper function to get emoji based on Gen Z emotion
function getEmotionEmoji(emotion: string): string {
  switch (emotion.toLowerCase()) {
    // Gen Z emotions
    case "vibing": return "✨";
    case "bossed": return "👑";
    case "stressed": return "😰";
    case "blessed": return "🙏";
    case "mood": return "😌";
    case "cringe": return "😬";
    case "savage": return "😈";
    case "soft": return "🥺";
    case "lit": return "🔥";
    case "depressed": return "😔";
    case "anxious": return "😟";
    case "confident": return "😎";
    case "overwhelmed": return "😵";
    case "grateful": return "🥰";
    case "frustrated": return "😤";
    case "inspired": return "💡";
    case "lonely": return "🥺";
    case "peaceful": return "😌";
    case "angry": return "😠";
    case "excited": return "🤩";
    case "tired": return "😴";
    case "hopeful": return "🤞";
    case "confused": return "🤔";
    case "proud": return "💪";
    case "nervous": return "😰";
    case "happy": return "😊";
    case "sad": return "😢";
    
    // Legacy emotions
    case "joy": return "😊";
    case "sadness": return "😢";
    case "anger": return "😠";
    case "fear": return "😨";
    case "surprise": return "😲";
    case "love": return "❤️";
    case "neutral": return "😐";
    case "admiration": return "🤩";
    case "amusement": return "😄";
    case "annoyance": return "😒";
    case "approval": return "👍";
    case "caring": return "🤗";
    case "confusion": return "🤔";
    case "curiosity": return "🤨";
    case "desire": return "😍";
    case "disappointment": return "😞";
    case "disapproval": return "👎";
    case "disgust": return "🤢";
    case "embarrassment": return "😳";
    case "excitement": return "🤩";
    case "gratitude": return "🙏";
    case "grief": return "😭";
    case "nervousness": return "😰";
    case "optimism": return "🤞";
    case "pride": return "💪";
    case "realization": return "💡";
    case "relief": return "😌";
    case "remorse": return "😔";
    case "distress": return "🚨";
    
    default: return "🤔";
  }
}

const EmotionGraph: React.FC<EmotionGraphProps> = ({ emotionData, compact = false, dayView = false }) => {
  // Handle empty or insufficient data
  if (!emotionData || emotionData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-nousText-muted text-sm">
        No emotion data available
      </div>
    );
  }

  // Ensure we have at least 2 data points for a meaningful line chart
  if (emotionData.length === 1) {
    // For single data point, create a small bar or point visualization
    const singleData = emotionData[0];
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl mb-2">{getEmotionEmoji(singleData.label)}</div>
          <div className="text-sm text-nousText-muted capitalize">{singleData.label}</div>
          <div className="text-lg font-medium">{(singleData.score * 100).toFixed(0)}%</div>
        </div>
      </div>
    );
  }

  const sortedData = [...emotionData].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Ensure all scores are valid numbers
  const validData = sortedData.filter(item => 
    typeof item.score === 'number' && !isNaN(item.score) && item.score >= 0 && item.score <= 1
  );

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-nousText-muted text-sm">
        Invalid emotion data
      </div>
    );
  }

  // Add test data if we have very few data points to ensure chart renders
  let chartData = validData;
  if (validData.length < 2) {
    // Create a simple test data point to ensure chart renders
    const testData = {
      timestamp: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      label: validData[0]?.label || 'neutral' as EmotionType,
      score: 0.5,
      messageContent: 'Test data point'
    };
    chartData = [...validData, testData];
  }

  try {
    return (
      <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="timestamp"
            tick={{ fill: '#CED4DA' }}
            tickFormatter={(value) => {
              try {
                const date = new Date(value);
                if (isNaN(date.getTime())) return 'Invalid';
                return dayView ? format(date, 'HH:mm') : format(date, 'MMM d');
              } catch {
                return 'Invalid';
              }
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
            connectNulls={false}
            data={chartData}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  } catch (error) {
    console.error('Error rendering emotion graph:', error);
    // Fallback to simple SVG chart
    return (
      <div className="w-full h-full flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 400 200" className="max-w-full">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7f5af0" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#7f5af0" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          
          {/* Background grid */}
          <g stroke="#CED4DA" strokeOpacity="0.1" strokeWidth="1">
            {[0, 50, 100, 150, 200].map(y => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} />
            ))}
            {[0, 100, 200, 300, 400].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="200" />
            ))}
          </g>
          
          {/* Chart line */}
          {chartData.length > 1 && (
            <g>
              <path
                d={chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 400;
                  const y = 200 - (point.score * 200);
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="#7f5af0"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 400;
                const y = 200 - (point.score * 200);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#7f5af0"
                    className="hover:r-6 transition-all"
                  />
                );
              })}
            </g>
          )}
          
          {/* Labels */}
          <text x="200" y="20" textAnchor="middle" fill="#CED4DA" fontSize="12">
            Emotion Timeline
          </text>
          <text x="20" y="100" textAnchor="middle" fill="#CED4DA" fontSize="10" transform="rotate(-90 20 100)">
            Score
          </text>
        </svg>
      </div>
    );
  }
};

export default EmotionGraph;
