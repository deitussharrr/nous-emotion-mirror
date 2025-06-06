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

import { analyzeEmotion } from '@/lib/analyzeEmotion';
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

  // Process entries to get emotion data for the graph - ONLY from messages
  const getEmotionData = () => {
    const allMessageEmotions: {
      timestamp: string;
      label: EmotionType;
      score: number;
      messageContent?: string;
    }[] = [];
    
    entries.forEach(entry => {
      // Only add emotions from individual messages
      if (entry.messages && entry.messages.length > 0) {
        entry.messages.forEach(message => {
          if (message.emotion) {
            allMessageEmotions.push({
              timestamp: message.timestamp || entry.timestamp,
              label: message.emotion.label as EmotionType,
              score: message.emotion.score,
              messageContent: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
            });
          }
        });
      }
    });
    
    return allMessageEmotions;
  };

  const handleAnalyzeEmotion = async (text: string, title?: string, messages?: ConversationMessage[]) => {
    setIsLoading(true);
    try {
      // Analyze emotion directly from the model
      const emotionResult = await analyzeEmotion(text);
      
      // Save the raw emotion result
      setCurrentEmotion(emotionResult);
      
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
              messages: processedMessages
            };
          }
          return entry;
        });
        
        setEntries(updatedEntries);
        setActiveNoteMessages(processedMessages);
        
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
          messages: processedMessages
        };
        
        saveEntry(newEntry);
        setEntries(prevEntries => [newEntry, ...prevEntries.slice(0, 6)]);
        
        // Set this new note as active for continuing conversation
        setActiveNoteId(newEntry.id);
        setActiveNoteTitle(title || '');
        setActiveNoteMessages(processedMessages);
        
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
    <div className="min-h-screen bg-nousBackground text-nousText-primary">
      <Analytics />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <header className="flex items-center justify-between">
          <Logo />
          <nav className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('journal');
                // Don't reset active note, so users can go back to history and continue the same note
              }}
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
            <button
              onClick={() => setActiveTab('emergency')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'emergency' ? 'bg-nousPurple text-white' : 'text-nousText-muted hover:bg-white/5'
              }`}
              title="Emergency Response Settings"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </nav>
        </header>
        
        <main className="space-y-6">
          {activeTab === 'journal' && (
            <div className="space-y-6">
              {activeNoteId && (
                <div className="flex justify-between items-center">
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
              
              <LanguageToggle useGenZ={useGenZ} setUseGenZ={(value) => {
                setUseGenZ(value);
                localStorage.setItem('useGenZ', String(value));
              }} />
              
              <JournalInput 
                onAnalyze={handleAnalyzeEmotion} 
                isLoading={isLoading}
                lastEmotion={currentEmotion?.label}
                activeNoteId={activeNoteId || undefined}
                existingMessages={activeNoteMessages}
              />
              <EmotionDisplay 
                emotion={currentEmotion} 
                isLoading={isLoading}
                previousEmotions={entries.slice(0, 3).map(entry => entry.emotion)}
              />
              <EmotionGraph emotionData={getEmotionData()} />
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
            <CheckInPreferences />
          )}
          
          {/* Add new tab for emergency settings */}
          {activeTab === 'emergency' && (
            <EmergencyContactForm />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
