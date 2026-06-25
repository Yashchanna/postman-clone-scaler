import { create } from 'zustand'
import { Collection, SavedRequest } from '@/lib/types'
import { fetchApi } from '@/lib/api'

interface CollectionState {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  createCollection: (name: string, description?: string) => Promise<void>;
  updateCollection: (id: number, name: string, description?: string) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  saveRequest: (requestData: Partial<SavedRequest>) => Promise<SavedRequest>;
  deleteRequest: (id: number) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  isLoading: false,
  error: null,
  
  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchApi('/api/collections');
      set({ collections: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  createCollection: async (name, description) => {
    try {
      await fetchApi('/api/collections', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      await get().fetchCollections();
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  
  updateCollection: async (id, name, description) => {
    try {
      await fetchApi(`/api/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
      });
      await get().fetchCollections();
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  
  deleteCollection: async (id) => {
    try {
      await fetchApi(`/api/collections/${id}`, {
        method: 'DELETE',
      });
      await get().fetchCollections();
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  
  saveRequest: async (requestData) => {
    try {
      let response;
      if (requestData.id) {
        response = await fetchApi(`/api/requests/${requestData.id}`, {
          method: 'PUT',
          body: JSON.stringify(requestData),
        });
      } else {
        response = await fetchApi('/api/requests', {
          method: 'POST',
          body: JSON.stringify(requestData),
        });
      }
      await get().fetchCollections();
      return response;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  
  deleteRequest: async (id) => {
    try {
      await fetchApi(`/api/requests/${id}`, {
        method: 'DELETE',
      });
      await get().fetchCollections();
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}));
