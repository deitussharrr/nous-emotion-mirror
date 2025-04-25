
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

import Logo from '@/components/Logo';
import JournalInput from '@/components/JournalInput';
import EmotionDisplay from '@/components/EmotionDisplay';
import EmotionGraph from '@/components/EmotionGraph';

import { analyzeEmotion } from '@/lib/analyzeEmotion';
import { saveEntry, getRecentEntries } from '@/lib/localStorage';
import { JournalEntry, EmotionResult } from '@/types';

const Index: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load entries from localStorage on component mount
    const loadedEntries = getRecentEntries();
    setEntries(loadedEntries);
  }, []);

  const handleAnalyzeEmotion = async (text: string) => {
    setIsLoading(true);

    try {
      const emotionResult = await analyzeEmotion(text);
      setCurrentEmotion(emotionResult);
      
      // Create and save new entry
      const newEntry: JournalEntry = {
        id: uuidv4(),
        text,
        timestamp: new Date().toISOString(),
        emotion: emotionResult,
      };
      
      saveEntry(newEntry);
      
      // Update entries state to include the new entry
      setEntries(prevEntries => [newEntry, ...prevEntries.slice(0, 6)]);
      
      toast({
        title: "Analysis complete",
        description: `Your entry was analyzed as: ${emotionResult.label}`,
      });
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was an error analyzing your emotions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-nousBackground text-nousText-primary py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex justify-between items-center">
          <Logo />
          <p className="text-sm text-nousText-muted">Your AI Emotional Mirror</p>
        </header>
        
        {/* Main content */}
        <main className="space-y-12">
          {/* Journal section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-nousText-secondary">How are you feeling?</h2>
            <JournalInput onAnalyze={handleAnalyzeEmotion} isLoading={isLoading} />
          </section>
          
          {/* Emotion display */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-nousText-secondary">Your Emotional State</h2>
            <EmotionDisplay emotion={currentEmotion} isLoading={isLoading} />
          </section>
          
          {/* Emotion timeline */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-nousText-secondary">Emotion Timeline</h2>
            <EmotionGraph entries={entries} />
          </section>
        </main>
        
        {/* Footer */}
        <footer className="pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-nousText-muted">
            Nous © {new Date().getFullYear()} | Your emotional data stays in your browser
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
