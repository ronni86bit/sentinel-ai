import React, { useState } from 'react';
import { 
  Sliders, 
  Cpu, 
  Database, 
  Key, 
  ShieldCheck, 
  Save, 
  Check, 
  Layers, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [hybridAlpha, setHybridAlpha] = useState(0.6); // 0.6 = 60% vector, 40% BM25
  const [similarityCutoff, setSimilarityCutoff] = useState(0.82);
  const [rerankerModel, setRerankerModel] = useState('cohere-v3');
  const [strictGroundedness, setStrictGroundedness] = useState(true);
  const [topKPassages, setTopKPassages] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">RAG Engine & Pipeline Configuration</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
            System Settings & Parameters
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Fine-tune vector retrieval weighting, reranking threshold, and zero-hallucination safety rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* RAG Parameters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          1. Hybrid Retrieval & Reranker Weighting
        </h3>

        {/* Reranker Model Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
            <span>Cross-Encoder Reranker Model</span>
            <span className="font-mono text-[11px] text-zinc-400">Selected: {rerankerModel}</span>
          </label>
          <select
            value={rerankerModel}
            onChange={(e) => setRerankerModel(e.target.value)}
            className="w-full p-2.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-blue-500"
          >
            <option value="cohere-v3">Cohere Rerank v3.5 (Recommended for Disaster Technical SOPs)</option>
            <option value="bge-reranker-large">BAAI BGE-Reranker-Large (Open Source High Precision)</option>
            <option value="colbert-v2">ColBERT v2.0 Multi-Vector Dense Reranker</option>
          </select>
        </div>

        {/* Hybrid Alpha Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Hybrid Search Alpha (BM25 vs. Dense Vector Ratio)
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {(hybridAlpha * 100).toFixed(0)}% Vector / {((1 - hybridAlpha) * 100).toFixed(0)}% BM25
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={hybridAlpha}
            onChange={(e) => setHybridAlpha(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>0% (Pure Keyword BM25)</span>
            <span>50% (Equal Weight)</span>
            <span>100% (Pure Dense HNSW Vector)</span>
          </div>
        </div>

        {/* Similarity Cutoff Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Minimum Similarity Cutoff Score
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {similarityCutoff}
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.01"
            value={similarityCutoff}
            onChange={(e) => setSimilarityCutoff(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Passages below cosine similarity threshold {similarityCutoff} are automatically dropped from the context window.
          </p>
        </div>
      </div>

      {/* Groundedness & System Rules */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          2. Zero-Hallucination Safety & Synthesis Constraints
        </h3>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Enforce Strict Refusal & Mandatory Citations
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              If retrieved evidence passages do not contain ground-truth answers for a query, the model MUST explicitly refuse to guess.
            </div>
          </div>
          <input
            type="checkbox"
            checked={strictGroundedness}
            onChange={(e) => setStrictGroundedness(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Synthesis Temperature Limit
          </label>
          <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300">
            Temperature: 0.0 (Deterministic Grounded Output)
          </div>
        </div>
      </div>
    </div>
  );
};
