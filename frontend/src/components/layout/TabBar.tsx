'use client'
import React from 'react';
import { X, Plus } from 'lucide-react';
import { useTabStore } from '@/stores/useTabStore';

const methodColors: Record<string, string> = {
  GET: 'text-[#0CBB52]',
  POST: 'text-[#FFB400]',
  PUT: 'text-[#097BED]',
  PATCH: 'text-[#F3C142]',
  DELETE: 'text-[#EB2013]',
};

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, removeTab, addTab } = useTabStore();

  return (
    <div className="flex items-center border-b border-[var(--border-color)] bg-[var(--bg-sidebar)] overflow-x-auto overflow-y-hidden" style={{ minHeight: '36px' }}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-2 px-4 py-2 border-r border-[var(--border-color)] cursor-pointer min-w-40 max-w-64 border-t-2 ${
            activeTabId === tab.id ? 'bg-[var(--bg-panel)] border-t-[var(--accent-color)]' : 'bg-[var(--bg-sidebar)] border-t-transparent hover:bg-[var(--bg-hover)]'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className={`text-xs font-bold ${methodColors[tab.method] || 'text-gray-400'}`}>
            {tab.method}
          </span>
          <span className="text-sm truncate flex-1 text-gray-200">
            {tab.name} {tab.isDirty && '*'}
          </span>
          <button
            className="text-gray-500 hover:text-white rounded-md hover:bg-[var(--border-color)] p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              removeTab(tab.id);
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button 
        className="p-2 text-gray-400 hover:text-white"
        onClick={() => addTab()}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
