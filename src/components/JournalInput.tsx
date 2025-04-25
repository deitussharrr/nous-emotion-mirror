
import React, { useState } from 'react';

interface JournalInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const JournalInput: React.FC<JournalInputProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length > 0) {
      onAnalyze(text);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <textarea
        className="w-full min-h-[300px] p-6 rounded-lg bg-white/5 border border-white/10 
                   focus:border-nousPurple focus:ring focus:ring-nousPurple/20 focus:outline-none
                   resize-none text-nousText-primary placeholder-nousText-muted transition-all
                   text-lg leading-relaxed"
        placeholder="How are you feeling today? Write freely, I'm here to listen..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      
      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || text.trim().length === 0}
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          'Share Your Feelings'
        )}
      </button>
    </form>
  );
};

export default JournalInput;
