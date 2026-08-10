import React, { useState, useEffect } from 'react';
import { ActiveTab, Citation } from './types';
import { MOCK_REPORTS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchWorkspace } from './components/SearchWorkspace';
import { DocumentsView } from './components/DocumentsView';
import { EvaluationView } from './components/EvaluationView';
import { SettingsView } from './components/SettingsView';
import { CommandPalette } from './components/CommandPalette';
import { EvidenceModal } from './components/EvidenceModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('knowledge');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sentinel_theme');
    return saved ? saved === 'dark' : true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [modalCitationId, setModalCitationId] = useState<string | null>(null);

  // Sync dark mode class on root HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sentinel_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sentinel_theme', 'light');
    }
  }, [darkMode]);

  // Find citation object for modal
  const activeModalCitation = modalCitationId
    ? MOCK_REPORTS.q1.citations.find(c => c.id === modalCitationId) ||
      MOCK_REPORTS.q2.citations.find(c => c.id === modalCitationId) ||
      MOCK_REPORTS.q3.citations.find(c => c.id === modalCitationId) ||
      MOCK_REPORTS.q4.citations.find(c => c.id === modalCitationId) ||
      null
    : null;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors antialiased flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full max-w-[1800px] mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-20 md:pb-6 min-w-0 overflow-y-auto">
          {activeTab === 'knowledge' && (
            <SearchWorkspace
              onOpenCitationModal={(citId) => setModalCitationId(citId)}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />
          )}

          {activeTab === 'documents' && <DocumentsView />}

          {activeTab === 'evaluation' && <EvaluationView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Quick Command Palette Modal (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onSelectQuery={(q) => {
          setActiveTab('knowledge');
        }}
      />

      {/* Evidence Inspector Modal */}
      <EvidenceModal
        citation={activeModalCitation}
        onClose={() => setModalCitationId(null)}
      />
    </div>
  );
}
