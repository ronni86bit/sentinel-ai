import React, { useState, useEffect } from 'react';
import { GroundedReport, SampleQuery, Citation, PipelineStage, PipelineMetrics } from '../types';
import { SAMPLE_QUERIES, MOCK_REPORTS, INITIAL_PIPELINE_STAGES, DEFAULT_PIPELINE_METRICS } from '../data/mockData';
import { GroundedReportView } from './GroundedReport';
import { EvidencePanel } from './EvidencePanel';
import { PipelineInsights } from './PipelineInsights';
import { 
  Search, 
  Sparkles, 
  Filter, 
  Command, 
  RefreshCw, 
  ChevronRight, 
  SlidersHorizontal,
  CheckCircle2,
  FileSearch,
  BookOpen,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchWorkspaceProps {
  onOpenCitationModal: (citationId: string) => void;
  onOpenCommandPalette: () => void;
}

export const SearchWorkspace: React.FC<SearchWorkspaceProps> = ({
  onOpenCitationModal,
  onOpenCommandPalette,
}) => {
  const [queryInput, setQueryInput] = useState('What are the evacuation procedures during a Category 4 hurricane?');
  const [activeReport, setActiveReport] = useState<GroundedReport>(MOCK_REPORTS.q1);
  const [activeCitationId, setActiveCitationId] = useState<string | null>('cit-1');
  const [isSearching, setIsSearching] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(6); // 0-6 corresponding to 7 retrieval steps

  const retrievalSteps = [
    { label: 'Query', desc: 'Tokenize' },
    { label: 'Metadata Filter', desc: 'Agency' },
    { label: 'Semantic Search', desc: 'Vector' },
    { label: 'BM25', desc: 'Keyword' },
    { label: 'Fusion', desc: 'RRF' },
    { label: 'Reranking', desc: 'Cross-Enc' },
    { label: 'Grounded Answer', desc: 'Synthesis' }
  ];

  // Handle Search Execution
  const handlePerformSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setActiveStepIndex(0);

    // Animate retrieval steps
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < 6) return prev + 1;
        clearInterval(interval);
        return 6;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setActiveStepIndex(6);

      // Find matching mock report or synthesize fallback
      const matchKey = Object.keys(MOCK_REPORTS).find(key => 
        searchQuery.toLowerCase().includes(MOCK_REPORTS[key].query.toLowerCase().slice(0, 15)) ||
        MOCK_REPORTS[key].query.toLowerCase().includes(searchQuery.toLowerCase().slice(0, 15))
      );

      if (matchKey && MOCK_REPORTS[matchKey]) {
        setActiveReport(MOCK_REPORTS[matchKey]);
        setActiveCitationId(MOCK_REPORTS[matchKey].citations[0]?.id || null);
      } else {
        // Create dynamic grounded report for custom user input!
        const dynamicReport: GroundedReport = {
          query: searchQuery,
          title: `Grounded Protocol Directive: ${searchQuery}`,
          summary: `Synthesized under FEMA National Response Framework Directive 2025. Standard operating procedures compiled for: "${searchQuery}". Fully grounded across verified federal emergency documentation.`,
          confidenceScore: 0.985,
          groundednessScore: 0.992,
          citationCount: 4,
          verifiedAuthority: 'FEMA & Department of Homeland Security Emergency Operations',
          directiveRef: `SOP-CUSTOM-${Math.floor(Math.random() * 9000 + 1000)}`,
          generatedAt: new Date().toISOString(),
          processingTimeMs: 126,
          hallucinationRisk: 'Zero',
          citations: MOCK_REPORTS.q1.citations,
          sections: [
            {
              title: '1. Primary Response Directive & Command Hierarchy',
              content: `Initial operational response to "${searchQuery}" requires immediate activation of local Emergency Operations Centers (EOC) under Incident Command System (ICS-400) guidelines.`,
              bulletPoints: [
                'Establish unified multi-agency command post within 30 minutes of incident declaration.',
                'Deploy tactical communications trailers with satellite failover links.',
                'Authorize emergency expenditure funds under Stafford Act Emergency Provisions.'
              ],
              citations: ['cit-1', 'cit-2']
            },
            {
              title: '2. Field Safety Protocols & Resource Allocation',
              content: 'Emergency personnel must enforce strict site perimeter security and ensure all forward units are outfitted with mission-appropriate safety gear.',
              bulletPoints: [
                'Continuous atmospheric and environmental monitoring at forward operating bases.',
                'Staged rotation of search crews every 4 hours to prevent operational fatigue.'
              ],
              citations: ['cit-3', 'cit-4']
            }
          ]
        };
        setActiveReport(dynamicReport);
        setActiveCitationId(MOCK_REPORTS.q1.citations[0]?.id || null);
      }
      setIsSearching(false);
    }, 850);
  };

  return (
    <div className="space-y-6">
      {/* HERO SEARCH SECTION */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
        {/* Subtle background glow accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-3.5 sm:space-y-4 max-w-4xl mx-auto">
          {/* Header Tagline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs truncate">Ask SentinelAI</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-zinc-400">
              <span className="font-mono">Knowledge Base Ready</span>
            </div>
          </div>

          {/* Large Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(queryInput);
            }}
            className="relative flex items-center"
          >
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask SentinelAI about emergency SOPs, evacuation protocols..."
                className="w-full pl-9 sm:pl-12 pr-28 sm:pr-32 py-3 sm:py-4 text-xs sm:text-base bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 shadow-2xs font-sans"
              />

              {/* Search button inside input */}
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 sm:right-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* RETRIEVAL PROGRESS VISUALIZATION */}
          <div className="p-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center space-x-1 font-semibold text-zinc-700 dark:text-zinc-300">
                <Cpu className="w-3 h-3 text-blue-500" />
                <span>Retrieval Pipeline Flow:</span>
              </span>
              <span>{isSearching ? `Processing Step ${activeStepIndex + 1} of 7...` : 'Complete (124ms)'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1">
              {retrievalSteps.map((step, idx) => {
                const isCurrent = isSearching && activeStepIndex === idx;
                const isPassed = activeStepIndex >= idx;

                return (
                  <React.Fragment key={idx}>
                    <div
                      className={cn(
                        'px-2 py-1 rounded text-[10px] sm:text-[11px] font-mono transition-all flex items-center space-x-1 border',
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/30 font-bold scale-105'
                          : isPassed
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800'
                      )}
                    >
                      <span>{step.label}</span>
                    </div>
                    {idx < retrievalSteps.length - 1 && (
                      <ArrowRight className="w-2.5 h-2.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Sample Queries */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-[10px] sm:text-[11px] uppercase tracking-wider">Example Disaster Directives:</span>
              <button
                onClick={onOpenCommandPalette}
                className="hidden sm:flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                <span>Keyboard Search</span>
                <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px]">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Sample Query Pills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {SAMPLE_QUERIES.map((sq) => {
                const isActive = queryInput === sq.query;
                return (
                  <button
                    key={sq.id}
                    onClick={() => {
                      setQueryInput(sq.query);
                      handlePerformSearch(sq.query);
                    }}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left flex items-center space-x-1.5 sm:space-x-2 border cursor-pointer max-w-full',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-700 dark:text-blue-300 shadow-2xs'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                    )}
                  >
                    <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                      {sq.agencyTag}
                    </span>
                    <span className="truncate max-w-[150px] sm:max-w-xs md:max-w-md">{sq.query}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE: REPORT (8 COLS) + EVIDENCE PANEL (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Grounded Report */}
        <div className="lg:col-span-8">
          <GroundedReportView
            report={activeReport}
            activeCitationId={activeCitationId}
            onSelectCitation={(citId) => setActiveCitationId(citId)}
            onOpenCitationModal={onOpenCitationModal}
            isSearching={isSearching}
          />
        </div>

        {/* Right 4 Cols: Supporting Evidence Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <EvidencePanel
            citations={activeReport.citations}
            activeCitationId={activeCitationId}
            onSelectCitation={(citId) => setActiveCitationId(citId)}
            onOpenModal={onOpenCitationModal}
          />
        </div>
      </div>

      {/* BOTTOM PANEL: RETRIEVAL INSIGHTS & PIPELINE TELEMETRY */}
      <div className="pt-2">
        <PipelineInsights
          stages={INITIAL_PIPELINE_STAGES}
          metrics={DEFAULT_PIPELINE_METRICS}
        />
      </div>
    </div>
  );
};
