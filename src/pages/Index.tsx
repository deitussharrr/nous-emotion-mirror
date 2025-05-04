
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Book, History, ChartLine, Bell } from 'lucide-react';

import Logo from '@/components/Logo';
import JournalInput from '@/components/JournalInput';
import EmotionDisplay from '@/components/EmotionDisplay';
import EmotionGraph from '@/components/EmotionGraph';
import JournalHistory from '@/components/JournalHistory';
import LanguageToggle from '@/components/LanguageToggle';
import CheckInPreferences from '@/components/CheckInPreferences';

import { analyzeEmotion } from '@/lib/analyzeEmotion';
import { saveEntry, getRecentEntries } from '@/lib/localStorage';
import { JournalEntry, EmotionResult, EmotionType } from '@/types';

const Index: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'history' | 'analysis' | 'checkins'>('journal');
  const [useGenZ, setUseGenZ] = useState<boolean>(false);

  // Process entries to get emotion data for the graph
  const getEmotionData = () => {
    return entries.map(entry => ({
      timestamp: entry.timestamp,
      label: entry.emotion.label as EmotionType,
      score: entry.emotion.score
    }));
  };

  const handleAnalyzeEmotion = async (text: string) => {
    setIsLoading(true);
    try {
      const emotionResult = await analyzeEmotion(text, useGenZ);
      setCurrentEmotion(emotionResult);
      
      const newEntry: JournalEntry = {
        id: uuidv4(),
        text,
        timestamp: new Date().toISOString(),
        emotion: emotionResult,
      };
      
      saveEntry(newEntry);
      setEntries(prevEntries => [newEntry, ...prevEntries.slice(0, 6)]);
      
      toast({
        title: useGenZ ? "Vibe check complete!" : "Entry saved",
        description: useGenZ ? "Your feels have been analyzed and saved." : "Your journal entry has been analyzed and saved.",
      });
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      toast({
        variant: "destructive",
        title: useGenZ ? "Oof, that didn't work" : "Analysis failed",
        description: useGenZ ? "There was an error checking your vibe. Try again?" : "There was an error analyzing your emotions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEntries = () => {
    const loadedEntries = getRecentEntries();
    setEntries(loadedEntries);
  };
  
  useEffect(() => {
    refreshEntries();
    
    // Check for saved preferences
    const savedGenZPref = localStorage.getItem('useGenZ');
    if (savedGenZPref) {
      setUseGenZ(savedGenZPref === 'true');
    }
    
    // Simulate a notification check-in after 3 seconds for demo purposes
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        toast({
          title: useGenZ ? "Hey bestie! 👋" : "Welcome to Emotion Mirror",
          description: useGenZ 
            ? "Drop your thoughts here and let's check your vibe!" 
            : "I'm here to listen whenever you want to share how you're feeling.",
          duration: 5000,
        });
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [useGenZ]);
  
  return (
    <div className="min-h-screen bg-nousBackground text-nousText-primary">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <header className="flex items-center justify-between">
          <Logo />
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('journal')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'journal' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
            >
              <Book className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'history' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'analysis' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
            >
              <ChartLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'checkins' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
            >
              <Bell className="w-5 h-5" />
            </button>
          </nav>
        </header>
        
        <main className="space-y-6">
          {activeTab === 'journal' && (
            <div className="space-y-6">
              <LanguageToggle useGenZ={useGenZ} setUseGenZ={(value) => {
                setUseGenZ(value);
                localStorage.setItem('useGenZ', String(value));
              }} />
              
              <JournalInput onAnalyze={handleAnalyzeEmotion} isLoading={isLoading} />
              <EmotionDisplay emotion={currentEmotion} isLoading={isLoading} />
            </div>
          )}
          
          {activeTab === 'history' && (
            <JournalHistory entries={entries} onEntriesUpdate={refreshEntries} />
          )}
          
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-nousText-secondary">Emotion Timeline</h2>
              <EmotionGraph emotionData={getEmotionData()} />
            </div>
          )}

          {activeTab === 'checkins' && (
            <CheckInPreferences />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
