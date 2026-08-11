import React, { useState, useEffect } from 'react';
import { GroundedReport, Citation } from '../types';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileSpreadsheet, 
  Printer, 
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lock,
  ListChecks,
  FileText,
  AlertTriangle,
  FileCheck,
  Cpu,
  Eye,
  Bot,
  Activity,
  Server,
  Database,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MarkdownRenderer } from './MarkdownRenderer';

interface GroundedReportProps {
  report: GroundedReport;
  activeCitationId: string | null;
  onSelectCitation: (citationId: string) => void;
  onOpenCitationModal: (citationId: string) => void;
  isSearching?: boolean;
}

export const GroundedReportView: React.FC<GroundedReportProps> = ({
  report,
  activeCitationId,
  onSelectCitation,
  onOpenCitationModal,
  isSearching = false,
}) => {
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [streamedTextLength, setStreamedTextLength] = useState(0);

  // Accordion open states - all collapsed by default
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [referencedDocsOpen, setReferencedDocsOpen] = useState(false);
  const [technicalDetailsOpen, setTechnicalDetailsOpen] = useState(false);

  const [expandedSnippetIds, setExpandedSnippetIds] = useState<Set<string>>(new Set());

  // Fallback natural language answer if report.aiAnswer is absent
  const rawAiAnswer = report.aiAnswer || `${report.summary}\n\n` +
    report.sections.map(s => `${s.title}: ${s.content}`).join('\n\n');

  // Number of retrieved passages the generated answer actually cited (e.g. FLOOD-2)
  const citedCount = report.citations.filter((c) => c.isCited).length;

  // Streaming animation effect when searching
  useEffect(() => {
    if (isSearching) {
      setStreamedTextLength(0);
      const interval = setInterval(() => {
        setStreamedTextLength((prev) => {
          if (prev >= rawAiAnswer.length) {
            clearInterval(interval);
            return rawAiAnswer.length;
          }
          return prev + Math.floor(Math.random() * 20) + 10;
        });
      }, 40);
      return () => clearInterval(interval);
    } else {
      setStreamedTextLength(rawAiAnswer.length);
    }
  }, [isSearching, rawAiAnswer]);

  const currentDisplayAnswer = isSearching 
    ? rawAiAnswer.slice(0, streamedTextLength) 
    : rawAiAnswer;

  // Handle copying AI Answer only
  const handleCopyAiAnswer = () => {
    navigator.clipboard.writeText(rawAiAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleExportPDF = () => {
    setExportOpen(false);
    alert(`Exporting SentinelAI Grounded Report as PDF...\nDirective Ref: ${report.directiveRef}`);
  };

  const handleExportMarkdown = () => {
    setExportOpen(false);
    const md = `# ${report.title}\n\n**Authority:** ${report.verifiedAuthority}  \n**Directive Ref:** \`${report.directiveRef}\`  \n**LLM Model:** Llama 3.3 70B via Groq  \n**Groundedness:** ${(report.groundednessScore * 100).toFixed(1)}%  \n\n## AI Response\n${rawAiAnswer}\n\n## Executive Summary\n${report.summary}\n\n` +
      report.sections.map(s => `### ${s.title}\n\n${s.content}\n\n${s.bulletPoints ? s.bulletPoints.map(b => `- ${b}`).join('\n') : ''}`).join('\n\n');
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.directiveRef}-Grounded-Report.md`;
    a.click();
  };

  const handleScrollToSources = () => {
    setSourcesOpen(prev => !prev);
  };

  // Collect all actionable bullet points for "Recommended Actions"
  const allActionablePoints = report.sections.flatMap(s => s.bulletPoints || []);

  return (
    <div className="space-y-4 transition-all">
      {/* ========================================================= */}
      {/* 1. PRIMARY AI RESPONSE CARD - GENERATED ANSWER ONLY       */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all relative">
        {/* Top subtle glow bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600"></div>

        {/* AI Answer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary LLM Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-2xs">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Answer</span>
            </div>

            {/* Model Tag */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-mono font-medium">
              <Cpu className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>Llama 3.3 70B</span>
            </div>

            {/* Grounded Tag */}
            <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded ({(report.groundednessScore * 100).toFixed(0)}%)</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Copy Answer */}
            <button
              onClick={handleCopyAiAnswer}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-all shadow-2xs cursor-pointer"
            >
              {copiedAnswer ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
              <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
            </button>

            {/* View Sources */}
            <button
              onClick={handleScrollToSources}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
            >
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Sources ({report.citations.length})</span>
            </button>

            {/* Export Report */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              {exportOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 p-1 text-xs">
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center space-x-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-red-500" />
                    <span>Export PDF Directive</span>
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => { setExportOpen(false); window.print(); }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center space-x-2 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Print Document</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Answer Body - CLEAN GENERATED ANSWER ONLY */}
        <div className="p-5 sm:p-7">
          <div className="relative">
            <MarkdownRenderer
              content={currentDisplayAnswer}
              citations={report.citations}
              activeCitationId={activeCitationId}
              onSelectCitation={onSelectCitation}
              onOpenCitationModal={onOpenCitationModal}
            />
            {isSearching && (
              <span className="inline-block w-2 h-4 ml-1 bg-blue-600 animate-pulse align-middle"></span>
            )}
          </div>
        </div>

        {/* Collapsible Sources Section Directly Below Response */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60">
          <button
            type="button"
            onClick={() => setSourcesOpen(!sourcesOpen)}
            className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                <FileCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Sources ({report.citations.length})
              </span>
              {citedCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {citedCount} cited in answer
                </span>
              )}
              <span className="text-xs text-zinc-400 hidden sm:inline">• Click to view retrieved documents, section IDs &amp; snippets</span>
            </div>
            <div className="flex items-center space-x-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold">{sourcesOpen ? 'Hide' : 'Expand'}</span>
              {sourcesOpen ? <ChevronUp className="w-4 h-4 text-emerald-500" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {sourcesOpen && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-zinc-900/90">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono pb-1">
                <span>Retrieved Documents &amp; Evidence ({report.citations.length})</span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">Click source to inspect full passage</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.citations.map((cit, index) => (
                  <div
                    key={cit.id}
                    onClick={() => {
                      onSelectCitation(cit.id);
                      onOpenCitationModal(cit.id);
                    }}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 group shadow-2xs",
                      activeCitationId === cit.id
                        ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                        : cit.isCited
                          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-700"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 hover:border-blue-400 dark:hover:border-blue-600"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {cit.docTitle}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        {(cit.confidenceScore * 100).toFixed(0)}% Match
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      <span>Section: {cit.sectionId}</span>
                      {cit.isCited && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-sans font-semibold">
                          Cited in answer
                        </span>
                      )}
                      {cit.pageNumber && <span className="text-zinc-400 font-normal">• p. {cit.pageNumber}</span>}
                      {cit.sourceType && <span className="text-zinc-400 font-normal hidden sm:inline">• {cit.sourceType}</span>}
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 italic line-clamp-2 border-l-2 border-blue-500 pl-2">
                      "{cit.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ACCORDION 1: SUPPORTING GUIDELINES                       */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setGuidelinesOpen(!guidelinesOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Supporting Guidelines
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {report.sections.length} Sections
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Executive summary, recommended actions, operational directives &amp; constraints
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors shrink-0">
            {guidelinesOpen ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {guidelinesOpen && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30">
            {/* Directive Record Header */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-50/60 dark:bg-zinc-950/60">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Executive Directive Record</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {report.title}
                </h3>
              </div>
              <div className="text-xs text-zinc-500 font-mono shrink-0">
                Authority: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{report.verifiedAuthority}</strong>
              </div>
            </div>

            {/* EXECUTIVE SUMMARY */}
            <div className="p-4 sm:p-6 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Executive Summary</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans">
                {report.summary}
              </p>
            </div>

            {/* RECOMMENDED ACTIONS */}
            {allActionablePoints.length > 0 && (
              <div className="p-4 sm:p-6 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                  <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Recommended Actions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allActionablePoints.slice(0, 6).map((action, aIdx) => (
                    <div 
                      key={aIdx}
                      className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start space-x-2.5 text-xs text-zinc-800 dark:text-zinc-200 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {aIdx + 1}
                      </span>
                      <span className="leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTIONS */}
            <div className="p-4 sm:p-6 space-y-5">
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
                <span>Detailed Sections</span>
              </div>

              <div className="space-y-4">
                {report.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2.5 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
                      {section.title}
                    </h3>

                    <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {section.content}
                    </p>

                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 pl-1 my-2">
                        {section.bulletPoints.map((point, pIdx) => (
                          <li key={pIdx} className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 shrink-0"></span>
                            <span className="leading-normal">{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.citations && section.citations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[11px] font-medium text-zinc-400 shrink-0">Cited Evidence:</span>
                        {section.citations.map((citId) => {
                          const cit = report.citations.find(c => c.id === citId);
                          const isSelected = activeCitationId === citId;
                          if (!cit) return null;
                          return (
                            <button
                              key={citId}
                              onClick={() => {
                                onSelectCitation(citId);
                                onOpenCitationModal(citId);
                              }}
                              className={cn(
                                'inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer border',
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-blue-400'
                              )}
                            >
                              <span>[{cit.sectionId}]</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* IMPORTANT NOTES & CONSTRAINTS */}
            <div className="p-4 sm:p-5 bg-amber-50/20 dark:bg-amber-950/10 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Important Notes &amp; Constraints</span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                This answer is synthesized under strict RAG groundedness constraint ({report.hallucinationRisk} hallucination risk). All factual statements require matching vector evidence from verified agency documentation ({report.verifiedAuthority}). Always verify local regional operational conditions before executing field deployments.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ACCORDION 2: REFERENCED DOCUMENTS                        */}
      {/* ========================================================= */}
      <div 
        id="referenced-documents-section" 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs overflow-hidden transition-all"
      >
        <button
          type="button"
          onClick={() => setReferencedDocsOpen(!referencedDocsOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Referenced Documents
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {report.citations.length} Sources
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Verified index, source passages, page numbers &amp; match scores
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors shrink-0">
            {referencedDocsOpen ? <ChevronUp className="w-5 h-5 text-emerald-500" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {referencedDocsOpen && (
          <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4 bg-zinc-50/30 dark:bg-zinc-950/30">
            {/* Header controls inside open accordion */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                Verified Grounding Directives ({report.citations.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  if (expandedSnippetIds.size === report.citations.length) {
                    setExpandedSnippetIds(new Set());
                  } else {
                    setExpandedSnippetIds(new Set(report.citations.map(c => c.id)));
                  }
                }}
                className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
              >
                {expandedSnippetIds.size === report.citations.length ? 'Collapse Snippets' : 'Expand All Snippets'}
              </button>
            </div>

            {/* Grid of Source Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.citations.map((cit, index) => {
                const isSnippetExpanded = expandedSnippetIds.has(cit.id);
                const isSelected = activeCitationId === cit.id;

                return (
                  <div
                    key={cit.id}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all bg-white dark:bg-zinc-950 flex flex-col justify-between space-y-2.5 shadow-2xs group',
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/30' 
                        : cit.isCited
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-700'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    )}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-800">
                          {index + 1}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {cit.docTitle}
                          </h4>
                          <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">{cit.sectionId}</span>
                            {cit.isCited && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-sans font-semibold">
                                Cited
                              </span>
                            )}
                            {cit.pageNumber && (
                              <>
                                <span>•</span>
                                <span>p. {cit.pageNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Confidence badge + toggle snippet button */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {(cit.confidenceScore * 100).toFixed(0)}% Match
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSet = new Set(expandedSnippetIds);
                            if (newSet.has(cit.id)) {
                              newSet.delete(cit.id);
                            } else {
                              newSet.add(cit.id);
                            }
                            setExpandedSnippetIds(newSet);
                            onSelectCitation(cit.id);
                          }}
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title={isSnippetExpanded ? 'Hide snippet' : 'Expand snippet'}
                        >
                          {isSnippetExpanded ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Snippet Preview */}
                    {isSnippetExpanded && (
                      <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                          <span>Retrieved Passage</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{cit.sourceType}</span>
                        </div>
                        <blockquote className="border-l-2 border-blue-500 pl-2.5 py-0.5 italic text-zinc-800 dark:text-zinc-200 font-sans">
                          "{cit.snippet}"
                        </blockquote>
                        <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                          <span className="text-zinc-400 text-[10px]">Directive Passage</span>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCitation(cit.id);
                              onOpenCitationModal(cit.id);
                            }}
                            className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                          >
                            <span>Inspect Full Passage</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ACCORDION 3: TECHNICAL DETAILS                            */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setTechnicalDetailsOpen(!technicalDetailsOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Technical Details
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Telemetry &amp; Metrics
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Groundedness score, confidence rating, pipeline latency &amp; RAG telemetry
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors shrink-0">
            {technicalDetailsOpen ? <ChevronUp className="w-5 h-5 text-purple-500" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {technicalDetailsOpen && (
          <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 space-y-5 bg-zinc-50/30 dark:bg-zinc-950/30">
            {/* Telemetry Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Groundedness Score */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Groundedness</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {(report.groundednessScore * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${(report.groundednessScore * 100).toFixed(0)}%` }} 
                  />
                </div>
              </div>

              {/* Confidence Score */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span>Confidence</span>
                </div>
                <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {(report.confidenceScore * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ width: `${(report.confidenceScore * 100).toFixed(0)}%` }} 
                  />
                </div>
              </div>

              {/* Latency */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Total Latency</span>
                </div>
                <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {report.processingTimeMs} ms
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {report.retrievedDocsCount ?? report.citations.length} docs retrieved • API response
                </div>
              </div>

              {/* Hallucination Risk */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-500" />
                  <span>Hallucination Risk</span>
                </div>
                <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 uppercase">
                  {report.hallucinationRisk}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {report.citationCount} cited passages
                </div>
              </div>
            </div>

            {/* Pipeline Configuration Details List */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                <Server className="w-4 h-4 text-purple-500" />
                <span>Retrieval &amp; Inference Pipeline</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-1">
                  <span className="text-zinc-400 text-[11px]">Primary LLM Model</span>
                  <div className="text-zinc-800 dark:text-zinc-200 font-semibold flex items-center space-x-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-500" />
                    <span>Llama 3.3 70B (Groq Acceleration)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-1">
                  <span className="text-zinc-400 text-[11px]">Vector Search Pipeline</span>
                  <div className="text-zinc-800 dark:text-zinc-200 font-semibold flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    <span>HNSW Dense Vector + BM25 Lexical Hybrid</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-1">
                  <span className="text-zinc-400 text-[11px]">Verified Authority Record</span>
                  <div className="text-zinc-800 dark:text-zinc-200 font-semibold truncate">
                    {report.verifiedAuthority}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-1">
                  <span className="text-zinc-400 text-[11px]">Directive Identifier</span>
                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                    {report.directiveRef}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono px-1">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Enterprise RAG Pipeline Security Verified</span>
              </div>
              <div>
                Ref: {report.directiveRef}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
