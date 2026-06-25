import { create } from 'zustand'
import { KeyValue } from '@/lib/types'

export interface RequestData {
  method: string;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  body_type: string;
  auth_type: string;
  auth: Record<string, any>;
}

const defaultRequestData: RequestData = {
  method: 'GET',
  url: '',
  headers: [],
  params: [],
  body: '',
  body_type: 'none',
  auth_type: 'none',
  auth: {},
};

interface RequestStore {
  requestData: Record<string, RequestData>;
  getRequest: (tabId: string) => RequestData;
  updateRequest: (tabId: string, updates: Partial<RequestData>) => void;
  removeRequest: (tabId: string) => void;
  loadRequest: (tabId: string, data: RequestData) => void;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
  requestData: {},
  
  getRequest: (tabId) => {
    return get().requestData[tabId] || defaultRequestData;
  },
  
  updateRequest: (tabId, updates) => set((state) => {
    const current = state.requestData[tabId] || defaultRequestData;
    return {
      requestData: {
        ...state.requestData,
        [tabId]: { ...current, ...updates }
      }
    };
  }),
  
  removeRequest: (tabId) => set((state) => {
    const newData = { ...state.requestData };
    delete newData[tabId];
    return { requestData: newData };
  }),
  
  loadRequest: (tabId, data) => set((state) => ({
    requestData: {
      ...state.requestData,
      [tabId]: data
    }
  })),
}));
