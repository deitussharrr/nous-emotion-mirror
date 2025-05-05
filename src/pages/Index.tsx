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
import { generateResponse } from '@/lib/generateResponse';
import { saveEntry, getRecentEntries } from '@/lib/localStorage';
import { JournalEntry, EmotionResult, EmotionType, ConversationMessage } from '@/types';
import { DEFAULT_LLAMA_MODEL } from '@/lib/llamaService';

const Index: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'history' | 'analysis' | 'checkins'>('journal');
  const [useGenZ, setUseGenZ] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([]);

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
      // Pass previous emotion for context if available
      const previousEmotion = currentEmotion?.label;
      
      // Step 1: Analyze emotion
      const emotionResult = await analyzeEmotion(text, useGenZ, previousEmotion);
      
      // Step 2: Generate response based on emotion using Llama-2
      // Update conversation history for better context
      const updatedHistory = [...conversationHistory, { role: "user", content: text }];
      
      toast({
        title: useGenZ ? "Processing with Llama-2..." : "Processing your message with Llama-2...",
        description: useGenZ ? "Hold up, checking your vibe..." : "Analyzing your emotions and generating a response...",
        duration: 3000,
      });
      
      const aiResponse = await generateResponse(
        text, 
        emotionResult, 
        useGenZ, 
        previousEmotion,
        updatedHistory.slice(-6) // Keep only last 3 exchanges (6 messages) for context
      );
      
      // Update conversation history with this exchange
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: aiResponse }
      ]);
      
      // Update emotion result with the generated response
      const completeEmotionResult = {
        ...emotionResult,
        feedback: aiResponse
      };
      
      setCurrentEmotion(completeEmotionResult);
      
      const newEntry: JournalEntry = {
        id: uuidv4(),
        text,
        timestamp: new Date().toISOString(),
        emotion: completeEmotionResult,
      };
      
      saveEntry(newEntry);
      setEntries(prevEntries => [newEntry, ...prevEntries.slice(0, 6)]);
      
      // Show model info in toast
      toast({
        title: useGenZ ? "Vibe check complete!" : "Response generated",
        description: `Using ${DEFAULT_LLAMA_MODEL}`,
      });
    } catch (error) {
      console.error("Error processing message:", error);
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
                // Reset conversation history when switching language styles
                setConversationHistory([]);
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
