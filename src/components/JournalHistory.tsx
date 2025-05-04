import React from 'react';
import { JournalEntry } from '@/types';
import { format } from 'date-fns';
import { Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { deleteEntry, exportEntries, importEntries, getEntriesByDay } from '@/lib/localStorage';
import DailyEmotions from '@/components/DailyEmotions';
import ConversationSummary from '@/components/ConversationSummary';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onEntriesUpdate: () => void;
}

const JournalHistory: React.FC<JournalHistoryProps> = ({ entries, onEntriesUpdate }) => {
  const entriesByDay = getEntriesByDay();
  
  const handleDelete = (id: string) => {
    deleteEntry(id);
    onEntriesUpdate();
    toast({
      title: "Entry deleted",
      description: "Your journal entry has been removed.",
    });
  };

  const handleExport = () => {
    const data = exportEntries();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nous-journal-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Journal exported",
      description: "Your journal entries have been downloaded.",
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
          title: "Journal imported",
          description: "Your journal entries have been restored.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "There was an error importing your journal entries.",
        });
      }
    };
    reader.readAsText(file);
  };

  if (!entries.length) {
    return (
      <div className="text-center p-8">
        <p className="text-nousText-muted">Start journaling to see your entries here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-nousText-secondary">Conversation History</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Export journal"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Import journal"
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
            <div className="space-y-4">
              {dayEntries.map(entry => (
                <ConversationSummary key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalHistory;
