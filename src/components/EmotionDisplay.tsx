
import React from 'react';
import { EmotionResult } from '../types';

interface EmotionDisplayProps {
  emotion: EmotionResult | null;
  isLoading: boolean;
  previousEmotions?: EmotionResult[];
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ emotion, isLoading, previousEmotions = [] }) => {
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
              Share your thoughts to see emotion analysis...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const { label, score, color, emotions } = emotion;
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
          </div>
          {emotions && (
            <div className="mt-2">
              <p className="text-xs text-nousText-muted mb-1">All detected emotions:</p>
              <div className="flex flex-wrap gap-1">
                {emotions.slice(0, 5).map((emotion: any, index: number) => (
                  <span 
                    key={index} 
                    className="text-xs px-2 py-0.5 rounded-full bg-white/10"
                    title={`${emotion.label}: ${(emotion.score * 100).toFixed(1)}%`}
                  >
                    {emotion.label}: {(emotion.score * 100).toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get emoji based on emotion
function getEmotionEmoji(emotion: string): string {
  switch (emotion.toLowerCase()) {
    // Basic emotions
    case "joy": return "😊";
    case "sadness": return "😢";
    case "anger": return "😠";
    case "fear": return "😨";
    case "surprise": return "😲";
    case "love": return "❤️";
    case "neutral": return "😐";
    case "distress": return "🚨";
    
    // Extended emotions
    case "admiration": return "🤩";
    case "amusement": return "😄";
    case "annoyance": return "😒";
    case "approval": return "👍";
    case "caring": return "🤗";
    case "confusion": return "🤔";
    case "curiosity": return "🧐";
    case "desire": return "😍";
    case "disappointment": return "😞";
    case "disapproval": return "👎";
    case "disgust": return "🤢";
    case "embarrassment": return "😳";
    case "excitement": return "🤩";
    case "gratitude": return "🙏";
    case "grief": return "💔";
    case "nervousness": return "😰";
    case "optimism": return "🌈";
    case "pride": return "🦚";
    case "realization": return "💡";
    case "relief": return "😌";
    case "remorse": return "😔";
    default: return "🤔";
  }
}

export default EmotionDisplay;
