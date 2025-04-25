
import React from 'react';
import { EmotionResult } from '../types';

interface EmotionDisplayProps {
  emotion: EmotionResult | null;
  isLoading: boolean;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ emotion, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full p-6 rounded-lg bg-white/5 border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
      </div>
    );
  }
  
  if (!emotion) {
    return (
      <div className="w-full p-6 rounded-lg bg-white/5 border border-white/10">
        <p className="text-nousText-muted text-lg">
          Share your thoughts, and I'll listen...
        </p>
      </div>
    );
  }
  
  const { label, score, color, feedback } = emotion;
  const confidencePercentage = Math.round(score * 100);
  
  return (
    <div 
      className="w-full p-6 rounded-lg bg-white/5 border border-white/10 animate-fade-in"
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 
          className="text-xl font-semibold capitalize"
          style={{ color }}
        >
          {label}
        </h3>
        <span className="text-sm text-nousText-muted">
          {confidencePercentage}% confident
        </span>
      </div>
      
      <div className="w-full h-2 bg-white/10 rounded-full mb-6">
        <div 
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${confidencePercentage}%`, backgroundColor: color }}
        ></div>
      </div>
      
      <p className="text-nousText-secondary text-lg leading-relaxed">{feedback}</p>
    </div>
  );
};

export default EmotionDisplay;
