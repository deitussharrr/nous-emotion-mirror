
import React from 'react';
import { JournalEntry } from '@/types';
import { format } from 'date-fns';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { deleteEntry, exportEntries, importEntries } from '@/lib/localStorage';
import DailyEmotions from '@/components/DailyEmotions';
import ConversationSummary from '@/components/ConversationSummary';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onEntriesUpdate: () => void;
  onContinueNote?: (id: string) => void;
}

const JournalHistory: React.FC<JournalHistoryProps> = ({ entries, onEntriesUpdate, onContinueNote }) => {
  // Group incoming entries by day to reflect latest in-memory state
  const entriesByDay: { [key: string]: JournalEntry[] } = React.useMemo(() => {
    const grouped: { [key: string]: JournalEntry[] } = {};
    entries.forEach((entry) => {
      const day = format(new Date(entry.timestamp), 'yyyy-MM-dd');
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(entry);
    });
    // Ensure order by latest day first
    return Object.fromEntries(
      Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    );
  }, [entries]);
  
  const handleDelete = (id: string) => {
    deleteEntry(id);
    onEntriesUpdate();
    toast({
      title: "Note deleted",
      description: "Your note has been removed.",
    });
  };

  const handleExport = () => {
    const data = exportEntries();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-notes-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Notes exported",
      description: "Your notes have been downloaded.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importEntries(content)) {
        onEntriesUpdate();
        toast({
          title: "Notes imported",
          description: "Your notes have been restored.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "There was an error importing your notes.",
        });
      }
    };
    reader.readAsText(file);
  };

  if (!entries.length) {
    return (
      <div className="text-center p-8 rounded-lg bg-white/5 border border-white/10">
        <p className="text-nousText-muted">Start writing notes to see your entries here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-nousText-secondary flex items-center gap-2">
          <span className="bg-nousPurple/20 h-8 w-8 flex items-center justify-center rounded-full">
            📝
          </span>
          My Notes
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Export notes"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Import notes"
            onClick={() => document.getElementById('import-file')?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
          <input
            type="file"
            id="import-file"
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
        </div>
      </div>
      
      <div className="space-y-8">
        {Object.entries(entriesByDay).map(([day, dayEntries]) => (
          <div key={day} className="space-y-4">
            <DailyEmotions entries={dayEntries} date={day} />
            <div className="space-y-1">
              {dayEntries.map(entry => (
                <ConversationSummary 
                  key={entry.id} 
                  entry={entry} 
                  onDelete={handleDelete}
                  onContinue={onContinueNote}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalHistory;
