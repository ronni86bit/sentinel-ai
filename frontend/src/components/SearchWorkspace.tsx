import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GroundedReport, ChatMessage, PipelineMetrics } from '../types';
import { MOCK_REPORTS, INITIAL_PIPELINE_STAGES } from '../data/mockData';
import { GroundedReportView } from './GroundedReport';
import { EvidencePanel } from './EvidencePanel';
import { PipelineInsights } from './PipelineInsights';
import { 
  Search, 
  Sparkles, 
  Command, 
  RefreshCw, 
  Bot, 
  User, 
  Compass, 
  Flame, 
  Globe, 
  LifeBuoy, 
  Plus, 
  Send, 
  Loader2,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchWorkspaceProps {
  messages: ChatMessage[];
  setMessages: (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  activeCitationId: string | null;
  setActiveCitationId: (citId: string | null) => void;
  onNewConversation: () => void;
  onOpenCitationModal: (citationId: string) => void;
  onOpenCommandPalette: () => void;
}

export const SearchWorkspace: React.FC<SearchWorkspaceProps> = ({
  messages,
  setMessages,
  activeCitationId,
  setActiveCitationId,
  onNewConversation,
  onOpenCitationModal,
  onOpenCommandPalette,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(6); // 0-6 corresponding to 7 retrieval steps
  const [mobileEvidenceOpen, setMobileEvidenceOpen] = useState(false);

  const latestUserMsgRef = useRef<HTMLDivElement>(null);
  const latestAssistantMsgRef = useRef<HTMLDivElement>(null);
  const lastScrolledMsgIdRef = useRef<string | null>(null);

  // Smooth scroll focusing directly on newly added content (top of message)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastScrolledMsgIdRef.current === lastMsg.id) return;

    lastScrolledMsgIdRef.current = lastMsg.id;

    // Use requestAnimationFrame so new DOM nodes are fully rendered before scrolling
    requestAnimationFrame(() => {
      if (lastMsg.role === 'user') {
        latestUserMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (lastMsg.role === 'assistant') {
        latestAssistantMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, [messages]);

  const activeReport = [...messages].reverse().find(m => m.role === 'assistant' && m.report)?.report || null;

  const activeMetrics: PipelineMetrics = activeReport ? {
    totalLatencyMs: activeReport.processingTimeMs || 124,
    overallConfidence: activeReport.confidenceScore || 0.987,
    groundednessScore: activeReport.groundednessScore || 0.994,
    retrievedDocsCount: activeReport.citations?.length || 0,
    indexedChunksCount: 14280,
    vectorSimilarityThreshold: 0.82,
    tokensProcessed: 1420
  } : {
    totalLatencyMs: 0,
    overallConfidence: 1.0,
    groundednessScore: 1.0,
    retrievedDocsCount: 0,
    indexedChunksCount: 14280,
    vectorSimilarityThreshold: 0.82,
    tokensProcessed: 0
  };

  const retrievalSteps = [
    { label: 'Query', desc: 'Tokenize' },
    { label: 'Metadata Filter', desc: 'Agency' },
    { label: 'Semantic Search', desc: 'Vector' },
    { label: 'BM25', desc: 'Keyword' },
    { label: 'Fusion', desc: 'RRF' },
    { label: 'Reranking', desc: 'Cross-Enc' },
    { label: 'Grounded Answer', desc: 'Synthesis' }
  ];

  // Quick category filters for example prompts
  const promptCategories = [
    { label: 'Hurricane SOP', icon: Compass, query: 'What are the evacuation procedures during a Category 4 hurricane?' },
    { label: 'HAZMAT Containment', icon: Flame, query: 'What is the standard protocol for HAZMAT chemical spill containment in urban zones?' },
    { label: 'Mass Casualty Triage', icon: LifeBuoy, query: 'What are the critical medical triage priorities after a 7.2 magnitude earthquake?' },
    { label: 'WASH Flood Response', icon: Globe, query: 'How do NGOs coordinate water purification distribution during severe flood events?' },
  ];

  const loadingTextSteps = [
    'Searching knowledge base...',
    'Retrieving documents...',
    'Reranking evidence...',
    'Generating grounded answer...',
  ];

  // Handle Search Execution
  const handlePerformSearch = (searchQuery: string) => {
    if (!searchQuery.trim() || isSearching) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const assistantMsgId = `msg-assistant-${Date.now()}`;

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: searchQuery,
      timestamp: currentTime
    };

    // Append assistant placeholder message immediately
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: currentTime,
      isStreaming: true,
      loadingStep: loadingTextSteps[0],
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setQueryInput('');
    setIsSearching(true);
    setActiveStepIndex(0);

    // Animate loading text steps
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < loadingTextSteps.length) {
        setActiveStepIndex(stepIdx * 2);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, loadingStep: loadingTextSteps[stepIdx] }
              : m
          )
        );
      } else {
        clearInterval(stepInterval);
      }
    }, 320);

    setTimeout(() => {
      clearInterval(stepInterval);
      setActiveStepIndex(6);

      // Find matching mock report or synthesize fallback
      const matchKey = Object.keys(MOCK_REPORTS).find(key => 
        searchQuery.toLowerCase().includes(MOCK_REPORTS[key].query.toLowerCase().slice(0, 15)) ||
        MOCK_REPORTS[key].query.toLowerCase().includes(searchQuery.toLowerCase().slice(0, 15))
      );

      let finalReport: GroundedReport;

      if (matchKey && MOCK_REPORTS[matchKey]) {
        finalReport = { ...MOCK_REPORTS[matchKey], query: searchQuery };
      } else {
        // Create dynamic grounded report for custom user input!
        finalReport = {
          query: searchQuery,
          title: `Grounded Protocol Directive: ${searchQuery}`,
          summary: `Synthesized under FEMA National Response Framework Directive 2025. Standard operating procedures compiled for: "${searchQuery}". Fully grounded across verified federal emergency documentation.`,
          confidenceScore: 0.987,
          groundednessScore: 0.994,
          citationCount: 4,
          verifiedAuthority: 'FEMA & Department of Homeland Security Emergency Operations',
          directiveRef: `SOP-CUSTOM-${Math.floor(Math.random() * 9000 + 1000)}`,
          generatedAt: new Date().toISOString(),
          processingTimeMs: 124,
          hallucinationRisk: 'Zero',
          citations: MOCK_REPORTS.q1.citations,
          aiAnswer: `### Operational Directive for "${searchQuery}"

Here are the standard operating procedures synthesized from verified federal disaster guidelines:

1. **Unified Incident Command Activation (T-0 Hours):** Immediately deploy incident command structures (ICS-400) and establish satellite failover links across state and local Emergency Operations Centers [Section 4.2.1].

2. **Tactical Perimeter & Safety Standards:** Emergency personnel entering forward zones must maintain strict PPE compliance and continuous atmospheric monitoring [Subpart H • PPE Selection].

3. **Mass Evacuation & Staging Protocols:** Pre-position search & rescue assets outside primary hazard zones with 72-hour autonomous energy and water supply [Chapter 3 • Shelter Capacity].

4. **Inter-Agency Data Relay:** Synchronize real-time telemetry across Wireless Emergency Alerts (WEA) and GIS spatial overlays every 15 minutes [Annex B • Traffic Control].`,
          sections: [
            {
              title: '1. Primary Operational Response & Command Hierarchy',
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
      }

      const finalAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: finalReport.aiAnswer || finalReport.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        report: finalReport,
        isStreaming: false
      };

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? finalAssistantMsg : m))
      );

      setActiveCitationId(finalReport.citations[0]?.id || null);
      setIsSearching(false);
    }, 1400);
  };

  const handleNewConversation = () => {
    onNewConversation();
    setQueryInput('');
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-full flex flex-col lg:flex-row gap-6 items-start pb-6">
      {/* ========================================================= */}
      {/* MAIN CONVERSATION COLUMN                                  */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 w-full flex flex-col justify-between min-h-[calc(100vh-5rem)] space-y-6">
        <div className="space-y-6">
          {/* TOP HEADER & CONTROL BAR */}
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs"
          >
            {/* Title & Status */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    SentinelAI Grounded Assistant
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
                  Emergency Response &amp; Directive Intelligence
                </p>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Mobile Evidence Button (< lg) */}
              <button
                onClick={() => setMobileEvidenceOpen(!mobileEvidenceOpen)}
                className="lg:hidden flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800/80 cursor-pointer min-h-[44px]"
              >
                <Layers className="w-4 h-4" />
                <span>Evidence ({activeReport?.citations?.length || 0})</span>
              </button>

              {/* New Conversation Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNewConversation}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700 min-h-[44px]"
              >
                <Plus className="w-4 h-4 text-blue-500" />
                <span>New Chat</span>
              </motion.button>
            </div>
          </motion.div>

          {/* EMPTY STATE / HERO BANNER (When No Messages) */}
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-6 relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/25 mb-2 ring-4 ring-blue-500/10">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-blue-600 dark:from-white dark:via-zinc-100 dark:to-blue-400 bg-clip-text text-transparent">
                  Ask SentinelAI
                </h1>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto font-sans leading-relaxed">
                  Ask any question about evacuation procedures, chemical HAZMAT spill containment, earthquake triage, or flood water purification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl pt-2">
                {promptCategories.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePerformSearch(cat.query)}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all text-left flex items-start space-x-3 group cursor-pointer shadow-xs min-h-[44px]"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {cat.label}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                          {cat.query}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* CONVERSATION THREAD */}
          {messages.length > 0 && (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isLatestMsg = idx === messages.length - 1;
                  const isLatestUser = isLatestMsg && msg.role === 'user';
                  const isLatestAssistant = isLatestMsg && msg.role === 'assistant';

                  return (
                    <motion.div
                      key={msg.id}
                      ref={isLatestUser ? latestUserMsgRef : isLatestAssistant ? latestAssistantMsgRef : null}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="transition-all scroll-mt-20"
                    >
                      {/* 1. USER MESSAGE BUBBLE */}
                      {msg.role === 'user' && (
                        <div className="flex flex-col items-end space-y-1.5 my-4">
                          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono pr-1">
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">You</span>
                            <span>•</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <div className="p-4 sm:p-5 rounded-2xl rounded-tr-xs bg-blue-600 text-white shadow-md text-sm sm:text-base leading-relaxed font-sans font-medium border border-blue-500/30 max-w-[85%] sm:max-w-[75%]">
                            {msg.content}
                          </div>
                        </div>
                      )}

                      {/* 2. AI RESPONSE BUBBLE */}
                      {msg.role === 'assistant' && (
                        <div className="flex flex-col items-start space-y-2.5 my-6 w-full">
                          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono pl-1">
                            <div className="relative flex items-center justify-center">
                              <Bot className="w-4 h-4 text-blue-500 shrink-0" />
                              {msg.isStreaming && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                              )}
                            </div>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">SentinelAI Agent</span>
                            <span>•</span>
                            {msg.isStreaming ? (
                              <span className="text-blue-600 dark:text-blue-400 font-semibold animate-pulse">Thinking</span>
                            ) : (
                              <span>{msg.timestamp}</span>
                            )}
                          </div>

                          <div className="w-full">
                            {msg.isStreaming || !msg.report ? (
                              /* MODERN PLACEHOLDER ANIMATION (ChatGPT / Claude Style) */
                              <motion.div
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-500/30 dark:border-blue-500/20 shadow-sm space-y-4 w-full overflow-hidden relative"
                              >
                                {/* Subtle animated top border highlight */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/60 to-blue-500/0 animate-pulse" />

                                {/* Animated Loading Text Step */}
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
                                    <Sparkles className="w-4 h-4 animate-spin text-blue-500" style={{ animationDuration: '3s' }} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <AnimatePresence mode="wait">
                                      <motion.div
                                        key={msg.loadingStep || 'Searching knowledge base...'}
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -3 }}
                                        transition={{ duration: 0.18 }}
                                        className="flex items-center space-x-2"
                                      >
                                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-mono tracking-tight">
                                          {msg.loadingStep || 'Searching knowledge base...'}
                                        </span>
                                        <span className="inline-flex space-x-1 shrink-0">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </span>
                                      </motion.div>
                                    </AnimatePresence>
                                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                                      SentinelAI RAG Pipeline active
                                    </p>
                                  </div>
                                </div>

                                {/* Subtle Skeleton Placeholder Lines */}
                                <div className="space-y-2.5 pt-1">
                                  <div className="h-3.5 bg-gradient-to-r from-zinc-100 via-zinc-200/70 to-zinc-100 dark:from-zinc-800/80 dark:via-zinc-700/50 dark:to-zinc-800/80 rounded-md w-3/4 animate-pulse" />
                                  <div className="h-3.5 bg-gradient-to-r from-zinc-100 via-zinc-200/70 to-zinc-100 dark:from-zinc-800/80 dark:via-zinc-700/50 dark:to-zinc-800/80 rounded-md w-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                  <div className="h-3.5 bg-gradient-to-r from-zinc-100 via-zinc-200/70 to-zinc-100 dark:from-zinc-800/80 dark:via-zinc-700/50 dark:to-zinc-800/80 rounded-md w-4/5 animate-pulse" style={{ animationDelay: '300ms' }} />
                                </div>
                              </motion.div>
                            ) : (
                              <GroundedReportView
                                report={msg.report}
                                activeCitationId={activeCitationId}
                                onSelectCitation={(citId) => setActiveCitationId(citId)}
                                onOpenCitationModal={onOpenCitationModal}
                                isSearching={false}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* STICKY BOTTOM CHAT INPUT BAR */}
        <div className="sticky bottom-0 z-30 pt-3 pb-2 mt-4 bg-gradient-to-t from-zinc-100 via-zinc-100/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(queryInput);
            }}
            className="group relative bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-xl hover:border-zinc-400 dark:hover:border-zinc-700 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all p-2 flex items-center gap-2"
          >
            <div className="pl-3 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask SentinelAI a question or search emergency directives..."
              className="w-full bg-transparent text-sm sm:text-base font-sans text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none px-2 py-2 min-h-[44px]"
            />

            <div className="flex items-center space-x-2 shrink-0 pr-1">
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="hidden sm:flex items-center space-x-1 text-xs text-zinc-400 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Command className="w-3.5 h-3.5" />
                <kbd className="font-mono text-[10px]">⌘K</kbd>
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSearching || !queryInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-40 min-h-[44px]"
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Ask</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* STICKY RIGHT SIDEBAR: SUPPORTING EVIDENCE & TELEMETRY    */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:flex-col gap-4 w-80 xl:w-96 shrink-0 sticky top-0 h-[calc(100vh-5rem)] overflow-y-auto pr-1 pb-4 scrollbar-thin">
        <EvidencePanel
          citations={activeReport?.citations || []}
          activeCitationId={activeCitationId}
          onSelectCitation={(citId) => setActiveCitationId(citId)}
          onOpenModal={onOpenCitationModal}
        />
        <PipelineInsights
          stages={INITIAL_PIPELINE_STAGES}
          metrics={activeMetrics}
        />
      </div>

      {/* MOBILE DRAWER / MODAL FOR EVIDENCE PANEL & TELEMETRY (< lg) */}
      {mobileEvidenceOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 h-full flex flex-col p-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Evidence &amp; Telemetry</span>
              <button 
                onClick={() => setMobileEvidenceOpen(false)}
                className="px-2.5 py-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              <EvidencePanel
                citations={activeReport?.citations || []}
                activeCitationId={activeCitationId}
                onSelectCitation={(citId) => {
                  setActiveCitationId(citId);
                  setMobileEvidenceOpen(false);
                }}
                onOpenModal={(citId) => {
                  onOpenCitationModal(citId);
                  setMobileEvidenceOpen(false);
                }}
              />
              <PipelineInsights
                stages={INITIAL_PIPELINE_STAGES}
                metrics={activeMetrics}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

