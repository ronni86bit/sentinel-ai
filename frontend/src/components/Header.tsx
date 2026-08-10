import React from 'react';
import { ActiveTab } from '../types';
import { Shield, Command, Sun, Moon, ChevronRight, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onOpenCommandPalette,
}) => {
  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm sticky top-0 z-30 px-4 flex items-center justify-between transition-colors">
      {/* Left branding */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('knowledge')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs ring-1 ring-blue-500/30">
            <Shield className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                Sentinel<span className="text-blue-600 dark:text-blue-500">AI</span>
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center text-xs text-zinc-400 dark:text-zinc-500 pl-3 border-l border-zinc-200 dark:border-zinc-800">
          <span>Emergency Knowledge Base</span>
          <ChevronRight className="w-3.5 h-3.5 mx-1" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300 capitalize">{activeTab}</span>
        </div>
      </div>

      {/* Center status badge */}
      <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Index Operational</span>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Knowledge Base Ready</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 px-2 sm:px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
          title="Open Command Palette (⌘K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="font-mono text-[10px] bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-1 sm:px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
          title="Toggle Light / Dark Theme"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
        </button>

        {/* User profile: Guest */}
        <div className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
              G
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-950"></span>
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">Guest</div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">Public Access</div>
          </div>
        </div>
      </div>
    </header>
  );
};
