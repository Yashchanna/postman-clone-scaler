'use client'
import React, { useEffect, useState } from 'react';
import { useTabStore } from '@/stores/useTabStore';

export default function ResponseViewer({ activeTabId }: { activeTabId: string | null }) {
  const [response, setResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Body');
  const [bodyView, setBodyView] = useState<'pretty' | 'raw'>('pretty');

  useEffect(() => {
    // Clear response when switching tabs
    setResponse(null);
    setActiveTab('Body');
    
    // Listen for custom event from RequestBuilder
    const handleResponse = (e: any) => {
      setResponse(e.detail);
    };
    
    if (activeTabId) {
      window.addEventListener(`response-${activeTabId}`, handleResponse);
    }
    
    return () => {
      if (activeTabId) {
        window.removeEventListener(`response-${activeTabId}`, handleResponse);
      }
    };
  }, [activeTabId]);

  if (!activeTabId) return null;

  return (
    <div className="flex flex-col h-full w-full border-t border-[#383838]">
      {/* Response Header Area */}
      <div className="flex items-center justify-between bg-[#202020] px-4 pt-2 border-b border-[#383838]">
        <div className="tabs-header border-none">
          {['Body', 'Headers'].map(tab => (
            <div 
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Headers' && response?.headers && <span className="text-xs ml-1 text-gray-500">({response.headers.length})</span>}
            </div>
          ))}
        </div>
        
        {response && !response.is_error && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-400">
              Status: <span className={`font-bold ${response.status_code >= 200 && response.status_code < 300 ? 'text-green-500' : 'text-red-500'}`}>{response.status_code}</span>
            </span>
            <span className="text-gray-400">
              Time: <span className="text-green-500 font-bold">{response.time_ms} ms</span>
            </span>
            <span className="text-gray-400">
              Size: <span className="text-green-500 font-bold">{response.size_bytes} B</span>
            </span>
          </div>
        )}
      </div>
      
      {/* Response Content */}
      <div className="flex-1 overflow-auto bg-[#1E1E1E]">
        {!response ? (
          <div className="flex h-full items-center justify-center text-gray-500 flex-col gap-2">
            <div>Hit Send to get a response</div>
          </div>
        ) : response.is_error ? (
          <div className="p-4 text-red-500 font-mono text-sm">
            <h3>Error occurred:</h3>
            <p className="mt-2">{response.error_message}</p>
          </div>
        ) : (
          <>
            {activeTab === 'Body' && (
              <div className="flex flex-col h-full p-2">
                <div className="flex gap-4 mb-2 px-2 text-sm text-gray-400">
                  <button 
                    className={`${bodyView === 'pretty' ? 'text-white' : 'hover:text-gray-300'}`}
                    onClick={() => setBodyView('pretty')}
                  >
                    Pretty
                  </button>
                  <button 
                    className={`${bodyView === 'raw' ? 'text-white' : 'hover:text-gray-300'}`}
                    onClick={() => setBodyView('raw')}
                  >
                    Raw
                  </button>
                </div>
                
                <div className="flex-1 overflow-auto border border-[#383838] rounded-md bg-[#121212] p-4 text-sm font-mono">
                  {bodyView === 'pretty' && typeof response.body === 'object' && response.body !== null ? (
                    <pre className="text-green-400 m-0 whitespace-pre-wrap">
                      {JSON.stringify(response.body, null, 2)}
                    </pre>
                  ) : (
                    <pre className="text-gray-300 m-0 whitespace-pre-wrap">
                      {typeof response.body === 'object' ? JSON.stringify(response.body) : response.body}
                    </pre>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'Headers' && (
              <div className="p-4">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th className="w-[30%]">Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.headers.map((h: any, i: number) => (
                      <tr key={i}>
                        <td className="font-mono text-xs font-semibold">{h.key}</td>
                        <td className="font-mono text-xs text-gray-300 truncate max-w-[400px]" title={h.value}>{h.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
