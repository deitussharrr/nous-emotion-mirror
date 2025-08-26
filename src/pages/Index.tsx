import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Book, History, ChartLine, Bell, Search, AlertTriangle } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

import Logo from '@/components/Logo';
import JournalInput from '@/components/JournalInput';
import EmotionDisplay from '@/components/EmotionDisplay';
import EmotionGraph from '@/components/EmotionGraph';
import JournalHistory from '@/components/JournalHistory';
import LanguageToggle from '@/components/LanguageToggle';
import CheckInPreferences from '@/components/CheckInPreferences';
import NoteSearch from '@/components/NoteSearch';
import EmergencyContactForm from '@/components/EmergencyContactForm';
import AIConfiguration from '@/components/AIConfiguration';

import { analyzeEmotion, triggerAIEmotionalResponse } from '@/lib/analyzeEmotion';
import { saveEntry, getRecentEntries } from '@/lib/localStorage';
import { triggerEmergencyResponse, isExtremelyNegative } from '@/lib/triggerEmergencyResponse';
import { JournalEntry, EmotionResult, EmotionType, ConversationMessage } from '@/types';

const Index: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'history' | 'analysis' | 'search' | 'checkins' | 'emergency'>('journal');
  const [useGenZ, setUseGenZ] = useState<boolean>(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNoteMessages, setActiveNoteMessages] = useState<ConversationMessage[]>([]);
  const [activeNoteTitle, setActiveNoteTitle] = useState<string>('');

  // Process entries to get emotion data for the graph - from both entry emotions and message emotions
  const getEmotionData = () => {
    const allEmotions: {
      timestamp: string;
      label: EmotionType;
      score: number;
      messageContent?: string;
    }[] = [];
    
    entries.forEach(entry => {
      // Add emotion from the entry itself
      if (entry.emotion) {
        allEmotions.push({
          timestamp: entry.timestamp,
          label: entry.emotion.label as EmotionType,
          score: entry.emotion.score,
          messageContent: entry.text.slice(0, 50) + (entry.text.length > 50 ? '...' : '')
        });
      }
      
      // Also add emotions from individual messages if they exist
      if (entry.messages && entry.messages.length > 0) {
        entry.messages.forEach(message => {
          if (message.emotion) {
            allEmotions.push({
              timestamp: message.timestamp || entry.timestamp,
              label: message.emotion.label as EmotionType,
              score: message.emotion.score,
              messageContent: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
            });
          }
        });
      }
    });
    
    // Sort by timestamp and remove duplicates (keep the latest emotion for each timestamp)
    const uniqueEmotions = allEmotions.reduce((acc, emotion) => {
      const existing = acc.find(e => e.timestamp === emotion.timestamp);
      if (!existing) {
        acc.push(emotion);
      }
      return acc;
    }, [] as typeof allEmotions);
    
    return uniqueEmotions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const handleAnalyzeEmotion = async (text: string, title?: string, messages?: ConversationMessage[]) => {
    setIsLoading(true);
    try {
      // Analyze emotion directly from the model
      const emotionResult = await analyzeEmotion(text);
      
      // Save the raw emotion result
      setCurrentEmotion(emotionResult);
      
      // Get conversation history for context
      const conversationHistory = messages?.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString()
      })) || [];
      
      // Get previous emotion for context
      const previousEmotion = entries.length > 0 ? entries[0].emotion.label : undefined;
      
      // Generate AI-powered customized response
      const aiResponse = await triggerAIEmotionalResponse(
        text,
        emotionResult,
        useGenZ,
        previousEmotion,
        conversationHistory
      );
      
      // Add AI response to messages
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date().toISOString(),
        emotion: emotionResult
      };
      
      // Process messages - ensure the latest message has the emotion analysis
      const processedMessages = messages?.map((msg, idx) => {
        // For this example, we'll use the same emotion result for all messages
        // In a real app, you'd analyze each message separately
        if (!msg.timestamp) {
          msg.timestamp = new Date().toISOString();
        }
        
        // Only add emotion to the latest message if it's missing
        if (idx === messages.length - 1 && !msg.emotion) {
          msg.emotion = emotionResult;
        }
        
        return msg;
      }) || [];
      
      // Add AI response to processed messages
      const messagesWithAI = [...processedMessages, aiMessage];
      
      let entryId = activeNoteId;
      
      if (activeNoteId) {
        // Update existing note
        const updatedEntries = entries.map(entry => {
          if (entry.id === activeNoteId) {
            return {
              ...entry,
              text: text, // Keep this for backward compatibility
              timestamp: new Date().toISOString(), // Update timestamp
              emotion: emotionResult, // Keep this for backward compatibility
              messages: messagesWithAI
            };
          }
          return entry;
        });
        
        setEntries(updatedEntries);
        setActiveNoteMessages(messagesWithAI);
        
        // Update entries in local storage
        updatedEntries.forEach(entry => saveEntry(entry));
        
        toast({
          title: "Note updated",
          description: `Updated mood: ${emotionResult.label} (${Math.round(emotionResult.score * 100)}%)`,
        });
      } else {
        // Create new note
        entryId = uuidv4();
        const newEntry: JournalEntry = {
          id: entryId,
          title,
          text: text, // Keep this for backward compatibility
          timestamp: new Date().toISOString(),
          emotion: emotionResult, // Keep this for backward compatibility
          messages: messagesWithAI
        };
        
        saveEntry(newEntry);
        setEntries(prevEntries => [newEntry, ...prevEntries.slice(0, 6)]);
        
        // Set this new note as active for continuing conversation
        setActiveNoteId(newEntry.id);
        setActiveNoteTitle(title || '');
        setActiveNoteMessages(messagesWithAI);
        
        toast({
          title: "Note saved",
          description: `Detected mood: ${emotionResult.label} (${Math.round(emotionResult.score * 100)}%)`,
        });
      }
      
      // Check if this entry should trigger the emergency response system
      // This happens AFTER saving/updating the entry
      if (isExtremelyNegative(emotionResult)) {
        // Notify the user that emergency contact may be notified
        toast({
          variant: "destructive",
          title: "Support Alert",
          description: "This entry indicates distress. Your emergency contact may be notified if enabled.",
        });
        
        // Trigger the emergency response system
        await triggerEmergencyResponse(text, emotionResult, entryId);
      }
      
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
  
  const handleContinueNote = (id: string) => {
    const selectedNote = entries.find(entry => entry.id === id);
    if (selectedNote) {
      setActiveTab('journal');
      setActiveNoteId(id);
      setActiveNoteTitle(selectedNote.title || '');
      setActiveNoteMessages(selectedNote.messages || []);
      setCurrentEmotion(selectedNote.emotion);
    }
  };
  
  const startNewNote = () => {
    setActiveNoteId(null);
    setActiveNoteTitle('');
    setActiveNoteMessages([]);
    setCurrentEmotion(null);
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
    <div className="min-h-screen bg-nousBackground text-nousText-primary bg-animated">
      <Analytics />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <header className="glass-header rounded-xl px-4 py-3 flex items-center justify-between animate-fade-in relative overflow-hidden">
          <div className="grid-overlay"></div>
          <Logo />
          <nav className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('journal');
                // Don't reset active note, so users can go back to history and continue the same note
              }}
              className={`nav-button ${activeTab === 'journal' ? 'nav-button--active' : ''}`}
              title="New Note"
            >
              <Book className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`nav-button ${activeTab === 'history' ? 'nav-button--active' : ''}`}
              title="My Notes"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`nav-button ${activeTab === 'search' ? 'nav-button--active' : ''}`}
              title="Search Notes"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`nav-button ${activeTab === 'analysis' ? 'nav-button--active' : ''}`}
              title="Mood Analysis"
            >
              <ChartLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={`nav-button ${activeTab === 'checkins' ? 'nav-button--active' : ''}`}
              title="Settings"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`nav-button ${activeTab === 'emergency' ? 'nav-button--active' : ''}`}
              title="Emergency Response Settings"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </nav>
        </header>
        
        <main className="space-y-6 pb-20">
          {activeTab === 'journal' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {activeNoteId && (
                <div className="lg:col-span-3 glass-card rounded-lg p-4 flex justify-between items-center">
                  <h2 className="text-xl font-medium">
                    {activeNoteTitle || 'Continuing your note...'}
                  </h2>
                  <button 
                    onClick={startNewNote}
                    className="text-sm text-nousText-muted hover:text-nousText-primary px-3 py-1 rounded-md hover:bg-white/5"
                  >
                    Start new note
                  </button>
                </div>
              )}
              
              <div className="lg:col-span-2 glass-card card-gradient rounded-lg p-4">
                <JournalInput 
                  onAnalyze={handleAnalyzeEmotion} 
                  isLoading={isLoading}
                  lastEmotion={currentEmotion?.label}
                  activeNoteId={activeNoteId || undefined}
                  existingMessages={activeNoteMessages}
                />
              </div>
              <div className="glass-card card-gradient rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm uppercase tracking-wide text-nousText-muted holo-text">Style</h3>
                  <LanguageToggle useGenZ={useGenZ} setUseGenZ={(value) => {
                    setUseGenZ(value);
                    localStorage.setItem('useGenZ', String(value));
                  }} />
                </div>
                <EmotionDisplay 
                  emotion={currentEmotion} 
                  isLoading={isLoading}
                  previousEmotions={entries.slice(0, 3).map(entry => entry.emotion)}
                />
              </div>
              {false && (
                <div className="lg:col-span-3 glass-card card-gradient rounded-lg p-4">
                  <EmotionGraph emotionData={getEmotionData()} />
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <JournalHistory entries={entries} onEntriesUpdate={refreshEntries} onContinueNote={handleContinueNote} />
          )}
          
          {activeTab === 'search' && (
            <NoteSearch entries={entries} onContinueNote={handleContinueNote} />
          )}
          
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-nousText-secondary">Emotion Timeline</h2>
              <p className="text-sm text-nousText-muted">Tracking emotions across all messages</p>
              <EmotionDisplay 
                emotion={currentEmotion} 
                isLoading={isLoading}
                previousEmotions={entries.slice(0, 3).map(entry => entry.emotion)}
              />
              <EmotionGraph emotionData={getEmotionData()} />
            </div>
          )}

          {activeTab === 'checkins' && (
            <div className="space-y-6">
              <CheckInPreferences />
              <AIConfiguration />
            </div>
          )}
          
          {/* Add new tab for emergency settings */}
          {activeTab === 'emergency' && (
            <EmergencyContactForm />
          )}
        </main>
        {/* Mobile bottom nav */}
        <nav className="fixed bottom-3 left-0 right-0 z-40 mx-auto max-w-md w-[calc(100%-1.5rem)] sm:hidden">
          <div className="glass-header rounded-2xl px-3 py-2 flex items-center justify-around">
            <button onClick={() => setActiveTab('journal')} className={`nav-button ${activeTab === 'journal' ? 'nav-button--active' : ''}`}>
              <Book className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('history')} className={`nav-button ${activeTab === 'history' ? 'nav-button--active' : ''}`}>
              <History className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('search')} className={`nav-button ${activeTab === 'search' ? 'nav-button--active' : ''}`}>
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('analysis')} className={`nav-button ${activeTab === 'analysis' ? 'nav-button--active' : ''}`}>
              <ChartLine className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('checkins')} className={`nav-button ${activeTab === 'checkins' ? 'nav-button--active' : ''}`}>
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Index;
