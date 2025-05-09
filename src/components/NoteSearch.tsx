
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { JournalEntry } from '@/types';
import ConversationSummary from '@/components/ConversationSummary';
import { Input } from '@/components/ui/input';
import { deleteEntry } from '@/lib/localStorage';
import { toast } from '@/components/ui/use-toast';

interface NoteSearchProps {
  entries: JournalEntry[];
}

const NoteSearch: React.FC<NoteSearchProps> = ({ entries }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast({
      title: "Note deleted",
      description: "Your note has been removed.",
    });
  };
  
  // Filter entries based on search query
  const filteredEntries = entries.filter(entry => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = entry.title?.toLowerCase().includes(searchLower);
    const textMatch = entry.text.toLowerCase().includes(searchLower);
    const emotionMatch = entry.emotion.label.toLowerCase().includes(searchLower);
    
    return titleMatch || textMatch || emotionMatch;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-nousText-secondary flex items-center gap-2">
          <span className="bg-nousPurple/20 h-8 w-8 flex items-center justify-center rounded-full">
            <Search className="h-4 w-4" />
          </span>
          Search Notes
        </h2>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-nousText-muted" />
        </div>
        <Input
          type="text"
          placeholder="Search by title, content or emotion..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-nousText-primary"
        />
      </div>
      
      <div className="space-y-4">
        {searchQuery && filteredEntries.length === 0 ? (
          <div className="text-center p-8 rounded-lg bg-white/5 border border-white/10">
            <p className="text-nousText-muted">No notes found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <ConversationSummary key={entry.id} entry={entry} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
};

export default NoteSearch;
