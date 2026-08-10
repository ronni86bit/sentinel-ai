import React, { useState } from 'react';
import { EVALUATION_METRICS } from '../data/mockData';
import { 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Play, 
  RefreshCw, 
  Award, 
  AlertTriangle,
  FileCheck,
  Target,
  Zap,
  BookOpen,
  Database,
  Clock,
  Layers
} from 'lucide-react';

export const EvaluationView: React.FC = () => {
  const [isRunningEvaluation, setIsRunningEvaluation] = useState(false);

  const handleRunSuite = () => {
    setIsRunningEvaluation(true);
    setTimeout(() => {
      setIsRunningEvaluation(false);
      alert('RAG Triad Benchmark Suite Complete!\nPassed 120/120 Ground-Truth Emergency Test Cases.\nGroundedness Score: 98.8% (+0.2% boost).');
    }, 1500);
  };

  const systemMetrics = [
    {
      title: 'Retrieval Hit@K',
      value: 'Hit@5: 98.4%',
      subtext: 'Hit@10: 99.6% • Top passage accuracy',
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Response Latency',
      value: '124 ms',
      subtext: 'p95: 180ms • p99: 240ms end-to-end',
      icon: Zap,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
    },
    {
      title: 'Citation Coverage',
      value: '100.0%',
      subtext: '100% generated statements grounded',
      icon: FileCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'Indexed Documents',
      value: '9 SOPs',
      subtext: 'FEMA, WHO, EPA & DOT Directives',
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Indexed Chunks',
      value: '14,280',
      subtext: '1536d Dense Vectors + BM25 Sparse',
      icon: Layers,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800'
    },
    {
      title: 'Last Index Build',
      value: 'Aug 3, 18:45',
      subtext: 'UTC • Incremental Sync Verified',
      icon: Clock,
      color: 'text-zinc-700 dark:text-zinc-300',
      bgColor: 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">System Evaluation & Audit Suite</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
            Retrieval & Groundedness Metrics
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time evaluation against 120+ ground-truth emergency response test scenarios.
          </p>
        </div>

        <button
          onClick={handleRunSuite}
          disabled={isRunningEvaluation}
          className="w-full sm:w-auto px-3.5 py-2 sm:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isRunningEvaluation ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running 120 Test Cases...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run RAG Evaluation Suite</span>
            </>
          )}
        </button>
      </div>

      {/* Required System Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {systemMetrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border ${item.bgColor} space-y-1.5 shadow-2xs`}
            >
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {item.title}
                </span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                {item.value}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans leading-tight">
                {item.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* RAG Triad Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {EVALUATION_METRICS.slice(0, 3).map((metric) => (
          <div
            key={metric.name}
            className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                {metric.name}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Target: {(metric.target * 100).toFixed(0)}%
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                {(metric.score * 100).toFixed(1)}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {metric.delta}
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {metric.description}
            </p>

            {/* Sparkline simulation bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1">
                <span>Historical 5-Run Trend</span>
                <span>{(metric.score * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                {metric.historicalScores.map((score, sIdx) => (
                  <div
                    key={sIdx}
                    style={{ width: '20%', opacity: 0.5 + sIdx * 0.1 }}
                    className="h-full bg-blue-600 border-r border-white dark:border-zinc-900"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EVALUATION_METRICS.slice(3).map((metric) => (
          <div
            key={metric.name}
            className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{metric.name}</span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {(metric.score * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Benchmark Audit Log Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Recent Ground-Truth Scenario Audits
          </h3>
          <span className="text-xs font-mono text-zinc-400">120 Test Cases Passed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[11px]">
                <th className="p-3 pl-4">Test Scenario</th>
                <th className="p-3">Category</th>
                <th className="p-3">Groundedness</th>
                <th className="p-3">Answer Relevance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="p-3 pl-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Category 4 Hurricane Contraflow Evacuation Rules
                </td>
                <td className="p-3 text-zinc-500">Coastal Storm</td>
                <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">99.4%</td>
                <td className="p-3 font-mono text-zinc-700 dark:text-zinc-300">99.1%</td>
                <td className="p-3"><span className="text-emerald-600 font-semibold">PASS</span></td>
              </tr>
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="p-3 pl-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Level A PPE Entry Rules for Chlorine Gas Release
                </td>
                <td className="p-3 text-zinc-500">HAZMAT Spill</td>
                <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">98.9%</td>
                <td className="p-3 font-mono text-zinc-700 dark:text-zinc-300">98.5%</td>
                <td className="p-3"><span className="text-emerald-600 font-semibold">PASS</span></td>
              </tr>
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="p-3 pl-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Crush Injury Pre-Extrication IV Fluid Dosing
                </td>
                <td className="p-3 text-zinc-500">Earthquake Triage</td>
                <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">99.6%</td>
                <td className="p-3 font-mono text-zinc-700 dark:text-zinc-300">99.2%</td>
                <td className="p-3"><span className="text-emerald-600 font-semibold">PASS</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
