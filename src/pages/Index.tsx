
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Book, History, ChartLine, Bell, Search } from 'lucide-react';

import Logo from '@/components/Logo';
import JournalInput from '@/components/JournalInput';
import EmotionDisplay from '@/components/EmotionDisplay';
import EmotionGraph from '@/components/EmotionGraph';
import JournalHistory from '@/components/JournalHistory';
import LanguageToggle from '@/components/LanguageToggle';
import CheckInPreferences from '@/components/CheckInPreferences';
import NoteSearch from '@/components/NoteSearch';

import { analyzeEmotion } from '@/lib/analyzeEmotion';
import { saveEntry, getRecentEntries } from '@/lib/localStorage';
import { JournalEntry, EmotionResult, EmotionType } from '@/types';

const Index: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'history' | 'analysis' | 'search' | 'checkins'>('journal');
  const [useGenZ, setUseGenZ] = useState<boolean>(false);

  // Process entries to get emotion data for the graph
  const getEmotionData = () => {
    return entries.map(entry => ({
      timestamp: entry.timestamp,
      label: entry.emotion.label as EmotionType,
      score: entry.emotion.score
    }));
  };

  const handleAnalyzeEmotion = async (text: string, title?: string) => {
    setIsLoading(true);
    try {
      // Analyze emotion directly from the model
      const emotionResult = await analyzeEmotion(text);
      
      // Save the raw emotion result
      setCurrentEmotion(emotionResult);
      
      const newEntry: JournalEntry = {
        id: uuidv4(),
        title,
        text,
        timestamp: new Date().toISOString(),
        emotion: emotionResult,
      };
      
      saveEntry(newEntry);
      setEntries(prevEntries => [newEntry, ...prevEntries.slice(0, 6)]);
      
      toast({
        title: "Note saved",
        description: `Detected mood: ${emotionResult.label} (${Math.round(emotionResult.score * 100)}%)`,
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
  }, []);
  
  // Get previous emotions for context awareness
  const previousEmotions = entries.slice(0, 3).map(entry => entry.emotion);
  
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
              title="New Note"
            >
              <Book className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'history' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
              title="My Notes"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'search' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
              title="Search Notes"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'analysis' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
              title="Mood Analysis"
            >
              <ChartLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'checkins' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
              title="Settings"
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
              
              <JournalInput 
                onAnalyze={handleAnalyzeEmotion} 
                isLoading={isLoading}
                lastEmotion={currentEmotion?.label}
              />
              <EmotionDisplay 
                emotion={currentEmotion} 
                isLoading={isLoading}
                previousEmotions={previousEmotions}
              />
            </div>
          )}
          
          {activeTab === 'history' && (
            <JournalHistory entries={entries} onEntriesUpdate={refreshEntries} />
          )}
          
          {activeTab === 'search' && (
            <NoteSearch entries={entries} />
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
