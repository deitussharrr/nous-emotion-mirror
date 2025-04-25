
import { JournalEntry } from "../types";

const STORAGE_KEY = "nous_journal_entries";

export const saveEntry = (entry: JournalEntry): void => {
  try {
    const existingEntries = getEntries();
    const updatedEntries = [entry, ...existingEntries];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error("Error saving journal entry:", error);
  }
};

export const getEntries = (): JournalEntry[] => {
  try {
    const entries = localStorage.getItem(STORAGE_KEY);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error("Error retrieving journal entries:", error);
    return [];
  }
};

export const getRecentEntries = (count: number = 7): JournalEntry[] => {
  const allEntries = getEntries();
  return allEntries.slice(0, count);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error("Error importing journal entries:", error);
    return false;
  }
};
