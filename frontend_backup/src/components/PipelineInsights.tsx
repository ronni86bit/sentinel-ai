import React, { useState } from 'react';
import { PipelineStage, PipelineMetrics } from '../types';
import { 
  Cpu, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  Zap,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

interface PipelineInsightsProps {
  stages: PipelineStage[];
  metrics: PipelineMetrics;
}

export const PipelineInsights: React.FC<PipelineInsightsProps> = ({ stages, metrics }) => {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(stages[5]?.id || stages[0]?.id);

  const selectedStage = stages.find(s => s.id === selectedStageId) || stages[0];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden transition-all">
      {/* Top Header & Widgets Grid */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
              Retrieval & RAG Pipeline Telemetry
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
              Live Pipeline Active
            </span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            RAG Engine Architecture: Hybrid Reciprocal Rank Fusion (Alpha 0.6)
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Latency Widget */}
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium truncate">Total Latency</span>
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {metrics.totalLatencyMs} <span className="text-xs text-zinc-400 font-normal">ms</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
              ⚡ Ultra-fast 124ms
            </div>
          </div>

          {/* Confidence Widget */}
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium truncate">Confidence</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {(metrics.overallConfidence * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
              ✓ Grounded 99.4%
            </div>
          </div>

          {/* Retrieved Docs Widget */}
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium truncate">Retrieved Docs</span>
              <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {metrics.retrievedDocsCount} <span className="text-xs text-zinc-400 font-normal">Docs</span>
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
              FEMA, WHO, EPA
            </div>
          </div>

          {/* Indexed Chunks Widget */}
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium truncate">Indexed Chunks</span>
              <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {metrics.indexedChunksCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
              Milvus Vector DB
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Pipeline Visualization */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
          <span>Execution Flow Architecture</span>
          <span className="text-[11px] text-zinc-500 font-normal">Click stage node to inspect operational parameters</span>
        </div>

        {/* Scrollable Horizontal Stage Chain */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center min-w-max space-x-2">
            {stages.map((stage, idx) => {
              const isSelected = selectedStageId === stage.id;
              const isLast = idx === stages.length - 1;

              return (
                <React.Fragment key={stage.id}>
                  {/* Stage Card Node */}
                  <button
                    onClick={() => setSelectedStageId(stage.id)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all cursor-pointer min-w-[130px] flex flex-col justify-between space-y-1.5 relative group',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded font-bold',
                        isSelected ? 'bg-blue-700 text-blue-100' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      )}>
                        Step 0{idx + 1}
                      </span>
                      <span className={cn(
                        'font-mono',
                        isSelected ? 'text-blue-100' : 'text-zinc-400'
                      )}>
                        {stage.latencyMs}ms
                      </span>
                    </div>

                    <div className="font-bold text-xs truncate">
                      {stage.name}
                    </div>

                    <div className="flex items-center space-x-1 text-[10px]">
                      <CheckCircle2 className={cn('w-3 h-3', isSelected ? 'text-blue-200' : 'text-emerald-500')} />
                      <span className={isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}>
                        Completed
                      </span>
                    </div>
                  </button>

                  {/* Connecting Arrow */}
                  {!isLast && (
                    <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Inspector Box */}
        {selectedStage && (
          <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-blue-900 dark:text-blue-300">{selectedStage.name}</span>
                <span className="text-zinc-400">•</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">Execution Latency: {selectedStage.latencyMs}ms</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300">
                {selectedStage.details}
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {Object.entries(selectedStage.metrics).map(([k, v]) => (
                <div key={k} className="px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900 text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                  <span className="text-zinc-400 mr-1">{k}:</span>
                  <strong className="text-blue-600 dark:text-blue-400">{v}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
