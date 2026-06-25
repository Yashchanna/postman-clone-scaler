'use client'
import React, { useEffect, useState } from 'react';
import { useCollectionStore } from '@/stores/useCollectionStore';
import { useTabStore } from '@/stores/useTabStore';
import { useRequestStore } from '@/stores/useRequestStore';
import { Folder, FileText, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Collection, SavedRequest, KeyValue } from '@/lib/types';

const methodColors: Record<string, string> = {
  GET: 'text-[#0CBB52]',
  POST: 'text-[#FFB400]',
  PUT: 'text-[#097BED]',
  PATCH: 'text-[#F3C142]',
  DELETE: 'text-[#EB2013]',
};

export default function CollectionTree() {
  const { collections, fetchCollections, createCollection } = useCollectionStore();
  const { addTab } = useTabStore();
  const { loadRequest } = useRequestStore();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenRequest = (req: SavedRequest) => {
    const tabId = addTab({
      name: req.name,
      method: req.method,
      savedRequestId: req.id,
    });
    
    // Parse JSON arrays safely
    const parseKV = (str: string): KeyValue[] => {
      try {
        const arr = JSON.parse(str);
        return Array.isArray(arr) && arr.length > 0 ? arr : [{ id: crypto.randomUUID(), key: '', value: '', enabled: true }];
      } catch {
        return [{ id: crypto.randomUUID(), key: '', value: '', enabled: true }];
      }
    };
    
    let authObj = {};
    try { authObj = JSON.parse(req.auth); } catch {}

    loadRequest(tabId, {
      method: req.method,
      url: req.url,
      headers: parseKV(req.headers),
      params: parseKV(req.params),
      body: req.body,
      body_type: req.body_type,
      auth: authObj,
      auth_type: req.auth_type,
    });
  };

  const handleCreateCollection = async () => {
    const name = prompt('Collection Name:');
    if (name) {
      await createCollection(name);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center px-2 py-1 mb-2">
        <button 
          onClick={handleCreateCollection}
          className="text-gray-400 hover:text-white flex items-center gap-1 text-xs font-bold"
        >
          <Plus size={14} /> New Collection
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        {collections.map(collection => (
          <div key={collection.id} className="mb-1">
            <div 
              className="flex items-center gap-1 p-1 hover:bg-[#333] cursor-pointer text-sm"
              onClick={(e) => toggleExpand(collection.id, e)}
            >
              {expanded[collection.id] ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
              <Folder size={14} className="text-gray-400" />
              <span className="truncate text-gray-200 font-medium">{collection.name}</span>
            </div>
            
            {expanded[collection.id] && (
              <div className="ml-5 border-l border-[#383838] pl-2">
                {collection.requests.length === 0 ? (
                  <div className="text-xs text-gray-500 py-1 italic">Empty collection</div>
                ) : (
                  collection.requests.map(req => (
                    <div 
                      key={req.id} 
                      className="flex items-center gap-2 p-1 hover:bg-[#333] cursor-pointer text-sm"
                      onClick={() => handleOpenRequest(req)}
                    >
                      <span className={`text-[10px] font-bold w-10 ${methodColors[req.method] || 'text-gray-400'}`}>
                        {req.method}
                      </span>
                      <span className="truncate text-gray-300">{req.name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
