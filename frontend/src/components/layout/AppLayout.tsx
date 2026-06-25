'use client'
import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import TabBar from './TabBar';
import RequestBuilder from '../request/RequestBuilder';
import ResponseViewer from '../response/ResponseViewer';
import { useTabStore } from '@/stores/useTabStore';

export default function AppLayout() {
  const { tabs, activeTabId, addTab } = useTabStore();

  return (
    <div className="flex-col h-full w-full bg-[#121212]">
      <TopBar />
      
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
        <PanelGroup direction="horizontal">
          
          {/* Sidebar Panel */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar />
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-[#383838] hover:bg-[#FF6C37] transition-colors cursor-col-resize" />
          
          {/* Main Workspace Panel */}
          <Panel>
            <div className="flex-col h-full bg-[var(--bg-panel)]">
              <TabBar />
              
              {tabs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted gap-4">
                  <h2>No open tabs</h2>
                  <button onClick={() => addTab()} className="btn btn-primary">
                    Create New Request
                  </button>
                </div>
              ) : (
                <PanelGroup direction="vertical">
                  <Panel defaultSize={50} minSize={20}>
                    <RequestBuilder activeTabId={activeTabId} />
                  </Panel>
                  
                  <PanelResizeHandle className="h-1 bg-[#383838] hover:bg-[#FF6C37] transition-colors cursor-row-resize" />
                  
                  <Panel defaultSize={50} minSize={20}>
                    <ResponseViewer activeTabId={activeTabId} />
                  </Panel>
                </PanelGroup>
              )}
            </div>
          </Panel>
          
        </PanelGroup>
      </div>
    </div>
  );
}
