'use client'
import React, { useState } from 'react';
import { useRequestStore } from '@/stores/useRequestStore';
import { useEnvironmentStore } from '@/stores/useEnvironmentStore';
import { fetchApi } from '@/lib/api';
import KeyValueTable from '../ui/KeyValueTable';
import SaveRequestModal from '../collections/SaveRequestModal';
import { Play } from 'lucide-react';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const methodColors: Record<string, string> = {
  GET: 'text-[#0CBB52]',
  POST: 'text-[#FFB400]',
  PUT: 'text-[#097BED]',
  PATCH: 'text-[#F3C142]',
  DELETE: 'text-[#EB2013]',
};

export default function RequestBuilder({ activeTabId }: { activeTabId: string | null }) {
  const { getRequest, updateRequest } = useRequestStore();
  const { activeEnvironmentId } = useEnvironmentStore();
  const [activeTab, setActiveTab] = useState('Params');
  const [isSending, setIsSending] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  if (!activeTabId) return null;
  const request = getRequest(activeTabId);

  const handleSend = async () => {
    setIsSending(true);
    try {
      // Clear previous response in tab store if we had a response store (or handle it in ResponseViewer)
      const res = await fetchApi('/api/proxy/send', {
        method: 'POST',
        body: JSON.stringify({
          method: request.method,
          url: request.url,
          headers: request.headers.filter(h => h.key),
          params: request.params.filter(p => p.key),
          body_type: request.body_type,
          body: request.body_type === 'raw' ? request.body : 
                request.body_type === 'none' ? null : JSON.parse(request.body || '[]'),
          auth_type: request.auth_type,
          auth: request.auth,
          environment_id: activeEnvironmentId
        }),
      });
      
      // Dispatch custom event to notify ResponseViewer
      window.dispatchEvent(new CustomEvent(`response-${activeTabId}`, { detail: res }));
      
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent(`response-${activeTabId}`, { 
        detail: { is_error: true, error_message: err.message, status_code: 0, headers: [], body: null, time_ms: 0, size_bytes: 0 } 
      }));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* URL Bar */}
      <div className="flex items-center gap-2 p-4 bg-[#202020]">
        <div className="flex bg-[#292929] border border-[#383838] rounded-md overflow-hidden w-full focus-within:border-[#FF6C37]">
          <select 
            className={`bg-transparent outline-none p-2 font-bold cursor-pointer border-r border-[#383838] ${methodColors[request.method] || 'text-white'}`}
            value={request.method}
            onChange={(e) => updateRequest(activeTabId, { method: e.target.value })}
          >
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input 
            type="text"
            className="flex-1 bg-transparent outline-none p-2 text-white font-mono"
            placeholder="Enter URL or paste text"
            value={request.url}
            onChange={(e) => updateRequest(activeTabId, { url: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleSend}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : <><Play size={14} /> Send</>}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => setIsSaveModalOpen(true)}
        >
          Save
        </button>
      </div>
      
      {/* Request Tabs */}
      <div className="tabs-header px-4">
        {['Params', 'Headers', 'Body', 'Auth'].map(tab => (
          <div 
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Params' && request.params.filter(p => p.key).length > 0 && <span className="text-xs ml-1 text-gray-500">({request.params.filter(p => p.key).length})</span>}
            {tab === 'Headers' && request.headers.filter(h => h.key).length > 0 && <span className="text-xs ml-1 text-gray-500">({request.headers.filter(h => h.key).length})</span>}
          </div>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-[#202020]">
        {activeTab === 'Params' && (
          <KeyValueTable 
            items={request.params} 
            onChange={(params) => updateRequest(activeTabId, { params })} 
            placeholderKey="Query Param"
          />
        )}
        
        {activeTab === 'Headers' && (
          <KeyValueTable 
            items={request.headers} 
            onChange={(headers) => updateRequest(activeTabId, { headers })} 
            placeholderKey="Header"
          />
        )}
        
        {activeTab === 'Body' && (
          <div className="flex flex-col h-full p-2">
            <div className="flex gap-4 mb-2 px-2">
              {['none', 'raw', 'form-data', 'x-www-form-urlencoded'].map(type => (
                <label key={type} className="flex items-center gap-1 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="body_type" 
                    checked={request.body_type === type} 
                    onChange={() => updateRequest(activeTabId, { body_type: type })}
                    className="accent-[#FF6C37]"
                  />
                  {type}
                </label>
              ))}
            </div>
            
            <div className="flex-1 border border-[#383838] rounded-md overflow-hidden bg-[#1E1E1E]">
              {request.body_type === 'none' && (
                <div className="flex h-full items-center justify-center text-gray-500">This request does not have a body</div>
              )}
              {request.body_type === 'raw' && (
                <textarea 
                  className="w-full h-full bg-transparent text-white font-mono p-4 outline-none resize-none"
                  value={request.body}
                  onChange={(e) => updateRequest(activeTabId, { body: e.target.value })}
                  spellCheck={false}
                />
              )}
              {request.body_type !== 'none' && request.body_type !== 'raw' && (
                <div className="flex h-full items-center justify-center text-gray-500">
                  Form data editor (coming soon)
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'Auth' && (
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Type:</span>
              <select 
                className="bg-[#292929] border border-[#383838] rounded px-2 py-1 outline-none focus:border-[#FF6C37]"
                value={request.auth_type}
                onChange={(e) => updateRequest(activeTabId, { auth_type: e.target.value, auth: {} })}
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>
            
            <div className="max-w-md">
              {request.auth_type === 'bearer' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-400">Token</label>
                  <input 
                    type="text" 
                    className="input-field font-mono" 
                    value={request.auth.token || ''}
                    onChange={(e) => updateRequest(activeTabId, { auth: { ...request.auth, token: e.target.value }})}
                  />
                </div>
              )}
              {request.auth_type === 'basic' && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Username</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={request.auth.username || ''}
                      onChange={(e) => updateRequest(activeTabId, { auth: { ...request.auth, username: e.target.value }})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Password</label>
                    <input 
                      type="password" 
                      className="input-field" 
                      value={request.auth.password || ''}
                      onChange={(e) => updateRequest(activeTabId, { auth: { ...request.auth, password: e.target.value }})}
                    />
                  </div>
                </div>
              )}
              {request.auth_type === 'none' && (
                <div className="text-gray-500 text-sm">This request does not use any authorization.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {isSaveModalOpen && (
        <SaveRequestModal 
          activeTabId={activeTabId} 
          onClose={() => setIsSaveModalOpen(false)} 
        />
      )}
    </div>
  );
}
