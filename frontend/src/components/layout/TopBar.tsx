'use client'
import React, { useEffect } from 'react';
import { Settings, Globe } from 'lucide-react';
import { useEnvironmentStore } from '@/stores/useEnvironmentStore';
import EnvironmentManager from '../environments/EnvironmentManager';
import { useState } from 'react';

export default function TopBar() {
  const { environments, activeEnvironmentId, fetchEnvironments, activateEnvironment } = useEnvironmentStore();
  const [isEnvManagerOpen, setIsEnvManagerOpen] = useState(false);

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#181818] border-b border-[#383838]">
      <div className="flex items-center gap-2">
        <div className="bg-[#FF6C37] text-white p-1 rounded-md font-bold text-xs">API</div>
        <span className="font-semibold text-gray-200">Postman Clone</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#202020] border border-[#383838] rounded-md px-2 py-1">
          <Globe size={14} className="text-gray-400" />
          <select 
            className="bg-transparent text-sm text-gray-200 outline-none cursor-pointer w-40"
            value={activeEnvironmentId || ''}
            onChange={(e) => activateEnvironment(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>{env.name}</option>
            ))}
          </select>
          <button 
            className="text-gray-400 hover:text-white ml-2"
            onClick={() => setIsEnvManagerOpen(true)}
            title="Manage Environments"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {isEnvManagerOpen && (
        <EnvironmentManager onClose={() => setIsEnvManagerOpen(false)} />
      )}
    </div>
  );
}
