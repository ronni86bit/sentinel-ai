import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { SAMPLE_QUERIES, DEFAULT_DOCUMENTS } from '../data/mockData';
import { 
  Search, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Sliders, 
  X, 
  ArrowRight,
  Shield,
  Command
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectQuery: (query: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectQuery,
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredQueries = SAMPLE_QUERIES.filter(q => q.query.toLowerCase().includes(search.toLowerCase()));
  const filteredDocs = DEFAULT_DOCUMENTS.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search input header */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center space-x-2 bg-zinc-50/50 dark:bg-zinc-950/50">
          <Search className="w-4 h-4 text-zinc-400 shrink-0 ml-1" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a disaster query, document name, or view..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-2 space-y-3 overflow-y-auto flex-1">
          {/* Quick Nav Section */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Navigation
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { onSelectTab('knowledge'); onClose(); }}
                className="w-full text-left px-2.5 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Knowledge Base (Grounded Search)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => { onSelectTab('documents'); onClose(); }}
                className="w-full text-left px-2.5 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>Documents Catalog & Vector Store</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => { onSelectTab('evaluation'); onClose(); }}
                className="w-full text-left px-2.5 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span>Evaluation & RAG Triad Metrics</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => { onSelectTab('settings'); onClose(); }}
                className="w-full text-left px-2.5 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>System Settings & Parameters</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Sample Queries */}
          {filteredQueries.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Emergency Directives & Queries
              </div>
              <div className="space-y-1">
                {filteredQueries.map(q => (
                  <button
                    key={q.id}
                    onClick={() => {
                      onSelectTab('knowledge');
                      onSelectQuery(q.query);
                      onClose();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{q.query}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {q.agencyTag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
          <span>Use ↑↓ to navigate</span>
          <span>ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
