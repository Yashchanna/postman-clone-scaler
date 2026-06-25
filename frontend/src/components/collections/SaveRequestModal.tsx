'use client'
import React, { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';
import { useCollectionStore } from '@/stores/useCollectionStore';
import { useRequestStore } from '@/stores/useRequestStore';
import { useTabStore } from '@/stores/useTabStore';

export default function SaveRequestModal({ 
  activeTabId, 
  onClose 
}: { 
  activeTabId: string, 
  onClose: () => void 
}) {
  const { collections, fetchCollections, saveRequest } = useCollectionStore();
  const { getRequest } = useRequestStore();
  const { tabs, updateTab } = useTabStore();
  
  const tab = tabs.find(t => t.id === activeTabId);
  const request = getRequest(activeTabId);
  
  const [name, setName] = useState(tab?.name !== 'Untitled Request' ? tab?.name || '' : request.url || '');
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleSave = async () => {
    if (!name || !selectedCollectionId) return;
    setIsSaving(true);
    
    try {
      const saved = await saveRequest({
        id: tab?.savedRequestId,
        collection_id: selectedCollectionId,
        name,
        method: request.method,
        url: request.url,
        headers: JSON.stringify(request.headers),
        params: JSON.stringify(request.params),
        body: request.body,
        body_type: request.body_type,
        auth: JSON.stringify(request.auth),
        auth_type: request.auth_type,
      });
      
      // Update tab
      updateTab(activeTabId, {
        name: saved.name,
        isDirty: false,
        savedRequestId: saved.id
      });
      
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save request');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#202020] rounded-lg shadow-xl w-[500px] border border-[#383838] flex flex-col">
        <div className="p-4 border-b border-[#383838] flex justify-between items-center">
          <h2 className="font-bold text-lg">Save Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Request Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Get User Profile"
              autoFocus
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Save to Collection</label>
            <div className="border border-[#383838] rounded-md overflow-hidden bg-[#181818] h-[200px] overflow-y-auto">
              {collections.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No collections found. Close and create one first.
                </div>
              ) : (
                collections.map(c => (
                  <div 
                    key={c.id}
                    className={`flex items-center gap-2 p-2 cursor-pointer border-b border-[#333] last:border-b-0 ${selectedCollectionId === c.id ? 'bg-[#FF6C37]/20 text-[#FF6C37]' : 'hover:bg-[#252525]'}`}
                    onClick={() => setSelectedCollectionId(c.id)}
                  >
                    <Folder size={16} />
                    <span>{c.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#383838] flex justify-end gap-2 bg-[#181818] rounded-b-lg">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={!name || !selectedCollectionId || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
