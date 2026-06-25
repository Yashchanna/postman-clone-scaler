'use client'
import React, { useState } from 'react';
import { Folder, Clock } from 'lucide-react';
import CollectionTree from '../collections/CollectionTree';
import HistoryList from '../history/HistoryList';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<'collections' | 'history'>('collections');

  return (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]">
      <div className="flex items-center border-b border-[var(--border-color)]">
        <button
          className={`flex-1 p-2 text-sm font-medium border-b-2 ${activeTab === 'collections' ? 'border-[#FF6C37] text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#333333]'}`}
          onClick={() => setActiveTab('collections')}
        >
          <div className="flex items-center justify-center gap-2">
            <Folder size={16} /> Collections
          </div>
        </button>
        <button
          className={`flex-1 p-2 text-sm font-medium border-b-2 ${activeTab === 'history' ? 'border-[#FF6C37] text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#333333]'}`}
          onClick={() => setActiveTab('history')}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock size={16} /> History
          </div>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {activeTab === 'collections' ? <CollectionTree /> : <HistoryList />}
      </div>
    </div>
  );
}
