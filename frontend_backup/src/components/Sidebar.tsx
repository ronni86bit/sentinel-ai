import React from 'react';
import { ActiveTab } from '../types';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  Sliders, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const navItems = [
    {
      id: 'knowledge' as ActiveTab,
      label: 'Knowledge Base',
      icon: BookOpen,
      badge: 'Hero'
    },
    {
      id: 'documents' as ActiveTab,
      label: 'Documents',
      icon: FileText,
      badge: '9 SOPs'
    },
    {
      id: 'evaluation' as ActiveTab,
      label: 'Evaluation',
      icon: BarChart3,
      badge: '98.8%'
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Sliders,
      badge: undefined
    }
  ];

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside
        className={cn(
          'hidden md:flex h-[calc(100vh-3.5rem)] sticky top-14 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex-col justify-between transition-all duration-200 z-20 select-none shrink-0',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        <div>
          {/* Collapse toggle row */}
          <div className="p-3 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900">
            {!collapsed && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                Navigation
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ml-auto cursor-pointer"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation buttons */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer relative group',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold ring-1 ring-blue-500/20'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-zinc-200'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                    )}
                  />
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium',
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Clearance Level 4</span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                Directives indexed from official FEMA, WHO & EPA vector clusters.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <span>RERANK: Cohere v3</span>
                <span className="text-emerald-600 dark:text-emerald-400">99.4%</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 py-1 text-zinc-400 dark:text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-blue-500" />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around py-1.5 px-2 shadow-lg transition-colors">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs transition-all cursor-pointer min-w-[64px]',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-blue-600 dark:text-blue-400 scale-110 transition-transform' : 'text-zinc-400 dark:text-zinc-500')} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
