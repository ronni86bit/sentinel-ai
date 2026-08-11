import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PipelineStage, PipelineMetrics } from '../types';
import { 
  Activity, 
  Clock, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Layers,
  Zap,
  Sliders
} from 'lucide-react';
import { cn } from '../lib/utils';

interface PipelineInsightsProps {
  stages: PipelineStage[];
  metrics: PipelineMetrics;
}

export const PipelineInsights: React.FC<PipelineInsightsProps> = ({ stages, metrics }) => {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [showAllStages, setShowAllStages] = useState(false);
  const [showSystemSpec, setShowSystemSpec] = useState(false);

  const groundednessPct = ((metrics.groundednessScore ?? 0) * 100).toFixed(1);
  const confidencePct = (metrics.overallConfidence * 100).toFixed(1);

  const visibleStages = showAllStages ? stages : stages.slice(0, 4);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden shrink-0 flex flex-col max-h-[380px]"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/90 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">
              Pipeline Telemetry
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              Hybrid RAG • Vector + BM25
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-semibold flex items-center space-x-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live</span>
        </span>
      </div>

      {/* Scrollable Body */}
      <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin">
        {/* 2x2 Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Latency */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              <span>Latency</span>
              <Clock className="w-3 h-3 text-blue-500 shrink-0" />
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {metrics.totalLatencyMs} <span className="text-[10px] font-normal text-zinc-400">ms</span>
            </div>
          </div>

          {/* Confidence */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              <span>Confidence</span>
              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {confidencePct}%
            </div>
          </div>

          {/* Groundedness */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              <span>Groundedness</span>
              <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {groundednessPct}%
            </div>
          </div>

          {/* Retrieved Docs */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              <span>Retrieved</span>
              <FileText className="w-3 h-3 text-purple-500 shrink-0" />
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {metrics.retrievedDocsCount} <span className="text-[10px] font-normal text-zinc-400">docs</span>
            </div>
          </div>
        </div>

        {/* Extended System Specs Drawer Toggle */}
        <div className="pt-0.5">
          <button
            onClick={() => setShowSystemSpec(!showSystemSpec)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 transition-all border border-zinc-200/60 dark:border-zinc-800/60 cursor-pointer"
          >
            <span className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>RAG System Parameters</span>
            </span>
            {showSystemSpec ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showSystemSpec && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-400 block">Indexed Chunks</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{metrics.indexedChunksCount ? metrics.indexedChunksCount.toLocaleString() : '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-400 block">Similarity Thresh.</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{metrics.vectorSimilarityThreshold ? metrics.vectorSimilarityThreshold : '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-400 block">Tokens Processed</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{metrics.tokensProcessed ? metrics.tokensProcessed.toLocaleString() : '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-400 block">Reranker Model</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{metrics.rerankModel || '—'}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pipeline Stages Section */}
        <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span>Execution Stages ({stages.length})</span>
            </span>
            <button
              onClick={() => setShowAllStages(!showAllStages)}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-mono hover:underline cursor-pointer flex items-center space-x-0.5"
            >
              <span>{showAllStages ? 'Show Less' : 'View All'}</span>
              {showAllStages ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Smooth Animated Vertical Stages Stepper */}
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {visibleStages.map((stage, idx) => {
                const isSelected = selectedStageId === stage.id;
                return (
                  <motion.div
                    key={stage.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'rounded-xl border transition-all overflow-hidden text-xs',
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-800 shadow-xs'
                        : 'bg-zinc-50/60 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                    )}
                  >
                    <button
                      onClick={() => setSelectedStageId(isSelected ? null : stage.id)}
                      className="w-full p-2 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                          0{idx + 1}
                        </span>
                        <span className="font-semibold text-[11px] text-zinc-900 dark:text-zinc-100 truncate">
                          {stage.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span>{stage.latencyMs > 0 ? `${stage.latencyMs}ms` : '—'}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    </button>

                    {/* Smooth Animated Stage Details */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="p-2.5 pt-0 text-[11px] space-y-1.5 border-t border-blue-100 dark:border-blue-900/40 mt-1">
                            <p className="text-zinc-600 dark:text-zinc-400 text-[10px] leading-relaxed">
                              {stage.details}
                            </p>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {Object.entries(stage.metrics).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[9px] text-zinc-700 dark:text-zinc-300"
                                >
                                  <span className="text-zinc-400 mr-1">{k}:</span>
                                  <strong className="text-blue-600 dark:text-blue-400">{v}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

