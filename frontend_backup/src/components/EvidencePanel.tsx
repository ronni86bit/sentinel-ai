import React, { useState } from 'react';
import { Citation } from '../types';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Sparkles,
  Layers,
  Building2,
  Shield,
  Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface EvidencePanelProps {
  citations: Citation[];
  activeCitationId: string | null;
  onSelectCitation: (citationId: string) => void;
  onOpenModal: (citationId: string) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  citations,
  activeCitationId,
  onSelectCitation,
  onOpenModal,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCitations = citations.filter(c => 
    c.docTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.snippet.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.sectionId.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/90 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
            Supporting Evidence
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-semibold">
            {citations.length} Cards
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
          Cohere Rerank Top-K
        </span>
      </div>

      {/* Filter inside evidence panel */}
      <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter evidence passages..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Evidence Cards List */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1 max-h-[calc(100vh-16rem)]">
        {filteredCitations.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No matching evidence found.
          </div>
        ) : (
          filteredCitations.map((cit) => {
            const isSelected = activeCitationId === cit.id;
            const isExpanded = !!expandedCardIds[cit.id];

            // Source type color tag
            let sourceTypeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
            if (cit.sourceType === 'Medical Guidance') {
              sourceTypeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
            } else if (cit.sourceType === 'State DOT Protocol') {
              sourceTypeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
            } else if (cit.sourceType === 'Hazmat Spec') {
              sourceTypeColor = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
            }

            return (
              <div
                key={cit.id}
                onClick={() => onSelectCitation(cit.id)}
                className={cn(
                  'p-3.5 rounded-lg border transition-all cursor-pointer space-y-2.5 group relative',
                  isSelected
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xs'
                )}
              >
                {/* Card Top Row: Document Name & Confidence */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {cit.docTitle}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      <span>{cit.sectionId}</span>
                      {cit.pageNumber && (
                        <>
                          <span>•</span>
                          <span>Page {cit.pageNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Confidence / Similarity Score Badge */}
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold font-mono mb-0.5">
                      Similarity Score
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {(cit.confidenceScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Document & Section Metadata Row */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 pb-0.5 border-t border-b border-zinc-100 dark:border-zinc-800/60">
                  <div>
                    <span className="text-zinc-400 font-normal">Section: </span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{cit.sectionId}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-normal">Type: </span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{cit.sourceType}</span>
                  </div>
                </div>

                {/* Snippet / Expanded Content */}
                <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800/70">
                  {isExpanded ? cit.fullContent : cit.snippet}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    onClick={(e) => toggleExpand(cit.id, e)}
                    className="flex items-center space-x-1 text-[11px] hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Collapse Passage</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Expand Preview</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenModal(cit.id);
                    }}
                    className="flex items-center space-x-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>View Inspector</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
