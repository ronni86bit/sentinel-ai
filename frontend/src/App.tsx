import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ActiveTab, ChatMessage, Conversation } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchWorkspace } from './components/SearchWorkspace';
import { DocumentsView } from './components/DocumentsView';
import { EvaluationView } from './components/EvaluationView';
import { SettingsView } from './components/SettingsView';
import { CommandPalette } from './components/CommandPalette';
import { EvidenceModal } from './components/EvidenceModal';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('knowledge');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sentinel_theme');
    return saved ? saved === 'dark' : true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [modalCitationId, setModalCitationId] = useState<string | null>(null);

  // Persistent Conversation State
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      activeCitationId: null,
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      activeCitationId: null,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const handleUpdateMessages = (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === (activeConversation?.id || activeConversationId)) {
          const nextMessages =
            typeof updater === 'function' ? updater(conv.messages) : updater;
          let newTitle = conv.title;
          if (conv.title === 'New Chat' && nextMessages.length > 0) {
            const firstUserMsg = nextMessages.find((m) => m.role === 'user');
            if (firstUserMsg) {
              newTitle =
                firstUserMsg.content.slice(0, 36) +
                (firstUserMsg.content.length > 36 ? '...' : '');
            }
          }
          return {
            ...conv,
            title: newTitle,
            updatedAt: new Date().toISOString(),
            messages: nextMessages,
          };
        }
        return conv;
      })
    );
  };

  const handleSetActiveCitationId = (citId: string | null) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === (activeConversation?.id || activeConversationId)) {
          return { ...conv, activeCitationId: citId };
        }
        return conv;
      })
    );
  };

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

  // Find citation object for modal (only from live /query API conversation data)
  const activeModalCitation = modalCitationId
    ? activeConversation?.messages
        .flatMap((m) => m.report?.citations || [])
        .find((c) => c.id === modalCitationId) || null
    : null;

  return (
    <div className="h-screen overflow-hidden bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors antialiased flex flex-col selection:bg-blue-500/30">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Content Area with Smooth Page Transitions */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-y-auto relative h-full">
          {/* Knowledge Base workspace is kept mounted (hidden when inactive) to preserve scroll position, inputs, & DOM state */}
          <div className={cn('h-full', activeTab !== 'knowledge' && 'hidden')}>
            <SearchWorkspace
              messages={activeConversation?.messages || []}
              setMessages={handleUpdateMessages}
              activeCitationId={activeConversation?.activeCitationId || null}
              setActiveCitationId={handleSetActiveCitationId}
              onNewConversation={handleNewConversation}
              onOpenCitationModal={(citId) => setModalCitationId(citId)}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                <DocumentsView />
              </motion.div>
            )}

            {activeTab === 'evaluation' && (
              <motion.div
                key="evaluation"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                <EvaluationView />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Quick Command Palette Modal (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onSelectQuery={() => {
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

