'use client'
import React, { useEffect } from 'react';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useTabStore } from '@/stores/useTabStore';
import { useRequestStore } from '@/stores/useRequestStore';
import { Trash2 } from 'lucide-react';
import { KeyValue } from '@/lib/types';

const methodColors: Record<string, string> = {
  GET: 'text-[#0CBB52]',
  POST: 'text-[#FFB400]',
  PUT: 'text-[#097BED]',
  PATCH: 'text-[#F3C142]',
  DELETE: 'text-[#EB2013]',
};

export default function HistoryList() {
  const { history, fetchHistory, clearHistory, deleteHistoryEntry } = useHistoryStore();
  const { addTab } = useTabStore();
  const { loadRequest } = useRequestStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleOpenHistory = (entry: any) => {
    const tabId = addTab({
      name: entry.url,
      method: entry.method,
    });
    
    // Parse headers safely
    let headers: KeyValue[] = [];
    try {
      headers = JSON.parse(entry.request_headers || '[]');
      if (!Array.isArray(headers)) headers = [];
    } catch(e) {}
    
    loadRequest(tabId, {
      method: entry.method,
      url: entry.url,
      headers: headers.length > 0 ? headers : [{ id: crypto.randomUUID(), key: '', value: '', enabled: true }],
      params: [{ id: crypto.randomUUID(), key: '', value: '', enabled: true }], // Assuming URL contains params already
      body: entry.request_body || '',
      body_type: entry.body_type || 'none',
      auth_type: 'none',
      auth: {},
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-2 py-1 mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase">Today</span>
        <button onClick={clearHistory} className="text-gray-500 hover:text-white" title="Clear All History">
          <Trash2 size={14} />
        </button>
      </div>
      
      {history.length === 0 ? (
        <div className="text-center text-gray-500 text-sm mt-4">History is empty</div>
      ) : (
        <div className="flex-1 overflow-auto">
          {history.map((entry) => (
            <div 
              key={entry.id} 
              className="flex flex-col py-2 px-2 hover:bg-[var(--border-color)] cursor-pointer border-b border-[#333]"
              onClick={() => handleOpenHistory(entry)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${methodColors[entry.method] || 'text-gray-400'}`}>
                  {entry.method}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${entry.status_code >= 200 && entry.status_code < 300 ? 'text-green-500' : 'text-red-500'}`}>
                    {entry.status_code}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteHistoryEntry(entry.id); }}
                    className="text-gray-600 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <span className="text-sm truncate text-gray-300" title={entry.url}>{entry.url}</span>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
