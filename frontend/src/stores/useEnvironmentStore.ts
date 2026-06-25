import { create } from 'zustand'
import { Environment, EnvironmentVariable } from '@/lib/types'
import { fetchApi } from '@/lib/api'

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: number | null;
  isLoading: boolean;
  error: string | null;
  fetchEnvironments: () => Promise<void>;
  createEnvironment: (env: Partial<Environment>) => Promise<void>;
  updateEnvironment: (id: number, env: Partial<Environment>) => Promise<void>;
  deleteEnvironment: (id: number) => Promise<void>;
  activateEnvironment: (id: number | null) => Promise<void>;
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: [],
  activeEnvironmentId: null,
  isLoading: false,
  error: null,
  
  fetchEnvironments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchApi('/api/environments');
      const active = data?.find((e: Environment) => e.is_active);
      
      set({ 
        environments: data || [], 
        activeEnvironmentId: active ? active.id : null,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  createEnvironment: async (env) => {
    try {
      await fetchApi('/api/environments', {
        method: 'POST',
        body: JSON.stringify(env),
      });
      await get().fetchEnvironments();
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  
  updateEnvironment: async (id, env) => {
    try {
      await fetchApi(`/api/environments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(env),
      });
      await get().fetchEnvironments();
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  
  deleteEnvironment: async (id) => {
    try {
      await fetchApi(`/api/environments/${id}`, {
        method: 'DELETE',
      });
      if (get().activeEnvironmentId === id) {
        set({ activeEnvironmentId: null });
      }
      await get().fetchEnvironments();
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
  
  activateEnvironment: async (id) => {
    try {
      await fetchApi(`/api/environments/${id || 0}/activate`, {
        method: 'PUT',
      });
      await get().fetchEnvironments();
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
}));
