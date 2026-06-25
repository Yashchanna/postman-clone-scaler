import { create } from 'zustand'
import { Tab, KeyValue } from '@/lib/types'

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab?: Partial<Tab>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [],
  activeTabId: null,
  
  addTab: (tab) => {
    const newId = crypto.randomUUID();
    const newTab: Tab = {
      id: newId,
      name: 'Untitled Request',
      method: 'GET',
      isActive: true,
      isDirty: false,
      ...tab,
    };
    
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newId,
    }));
    return newId;
  },
  
  removeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let newActiveId = state.activeTabId;
      
      if (id === state.activeTabId) {
        if (newTabs.length > 0) {
          const index = state.tabs.findIndex((t) => t.id === id);
          newActiveId = newTabs[Math.min(index, newTabs.length - 1)].id;
        } else {
          newActiveId = null;
        }
      }
      
      return { tabs: newTabs, activeTabId: newActiveId };
    });
  },
  
  setActiveTab: (id) => set({ activeTabId: id }),
  
  updateTab: (id, updates) => set((state) => ({
    tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t))
  })),
}));
