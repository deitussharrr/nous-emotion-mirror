
import React from 'react';
import { EmotionResult } from '../types';

interface EmotionDisplayProps {
  emotion: EmotionResult | null;
  isLoading: boolean;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ emotion, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full p-4 rounded-lg bg-white/5 border border-white/10 animate-pulse mt-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-full mb-1"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!emotion) {
    return (
      <div className="w-full p-4 rounded-lg bg-white/5 border border-white/10 mt-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-nousPurple/30 flex items-center justify-center">
            <span className="text-lg">🤔</span>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-nousText-muted">
              Share your thoughts, and I'll listen...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const { label, score, color, feedback } = emotion;
  const emoji = getEmotionEmoji(label);
  
  return (
    <div className="w-full p-4 rounded-lg bg-white/5 border border-white/10 mt-4 animate-fade-in">
      <div className="flex gap-3">
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}30` }}
        >
          <span className="text-lg">{emoji}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium capitalize" style={{ color }}>
              {label}
            </h3>
            <span className="text-xs text-nousText-muted">
              {Math.round(score * 100)}% confident
            </span>
          </div>
          <p className="text-nousText-secondary text-sm leading-relaxed">{feedback}</p>
        </div>
      </div>
    </div>
  );
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

export default EmotionDisplay;
