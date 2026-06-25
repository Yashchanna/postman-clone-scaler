import { create } from 'zustand'
import { HistoryEntry } from '@/lib/types'
import { fetchApi } from '@/lib/api'

interface HistoryState {
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteHistoryEntry: (id: number) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  isLoading: false,
  error: null,
  
  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchApi('/api/history');
      set({ history: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  clearHistory: async () => {
    try {
      await fetchApi('/api/history', { method: 'DELETE' });
      set({ history: [] });
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  
  deleteHistoryEntry: async (id) => {
    try {
      await fetchApi(`/api/history/${id}`, { method: 'DELETE' });
      await get().fetchHistory();
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}));
