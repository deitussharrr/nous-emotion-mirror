
import { JournalEntry, ConversationMessage } from "../types";
import { format } from "date-fns";

const STORAGE_KEY = "nous_journal_entries";

export const saveEntry = (entry: JournalEntry): void => {
  try {
    // First check if entry already exists to replace it
    const existingEntries = getEntries();
    const existingIndex = existingEntries.findIndex(e => e.id === entry.id);
    
    let updatedEntries;
    if (existingIndex >= 0) {
      // Update existing entry
      updatedEntries = [...existingEntries];
      updatedEntries[existingIndex] = entry;
    } else {
      // Add new entry
      updatedEntries = [entry, ...existingEntries];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error("Error saving journal entry:", error);
  }
};

export const getEntries = (): JournalEntry[] => {
  try {
    const entries = localStorage.getItem(STORAGE_KEY);
    const parsedEntries = entries ? JSON.parse(entries) : [];
    
    // Ensure all entries have a messages array (for backward compatibility)
    return parsedEntries.map((entry: JournalEntry) => {
      if (!entry.messages) {
        return {
          ...entry,
          messages: entry.text ? [{
            role: 'user',
            content: entry.text,
            timestamp: entry.timestamp
          }] : []
        };
      }
      return entry;
    });
  } catch (error) {
    console.error("Error retrieving journal entries:", error);
    return [];
  }
};

export const getEntriesByDay = () => {
  const entries = getEntries();
  const entriesByDay: { [key: string]: JournalEntry[] } = {};
  
  entries.forEach((entry) => {
    const day = format(new Date(entry.timestamp), 'yyyy-MM-dd');
    if (!entriesByDay[day]) {
      entriesByDay[day] = [];
    }
    entriesByDay[day].push(entry);
  });
  
  return entriesByDay;
};

export const clearEntries = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing journal entries:", error);
  }
};

export const deleteEntry = (id: string): void => {
  try {
    const entries = getEntries();
    const updatedEntries = entries.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error("Error deleting journal entry:", error);
  }
};

export const exportEntries = (): string => {
  const entries = getEntries();
  return JSON.stringify(entries);
};

export const importEntries = (jsonString: string): boolean => {
  try {
    const entries = JSON.parse(jsonString);
    if (!Array.isArray(entries)) throw new Error('Invalid format');
    
    // Ensure all imported entries have messages array
    const updatedEntries = entries.map((entry: JournalEntry) => {
      if (!entry.messages) {
        return {
          ...entry,
          messages: entry.text ? [{
            role: 'user',
            content: entry.text,
            timestamp: entry.timestamp
          }] : []
        };
      }
      return entry;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error("Error importing journal entries:", error);
    return false;
  }
};

export const getRecentEntries = (count = 7): JournalEntry[] => {
  const all = getEntries();
  return all.slice(0, count); // Return the most recent entries
};
