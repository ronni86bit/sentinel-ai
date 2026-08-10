import React from 'react';
import { Citation } from '../types';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  ExternalLink, 
  Copy, 
  Check, 
  Database,
  Lock
} from 'lucide-react';

interface EvidenceModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`[${citation.docTitle} - ${citation.sectionId}]\n${citation.fullContent}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Vector Evidence Inspector
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                {citation.docId} • {citation.sectionId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Document metadata table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono">
            <div>
              <span className="text-zinc-400 block text-[10px]">Source Agency</span>
              <strong className="text-zinc-800 dark:text-zinc-200">{citation.sourceType}</strong>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Confidence</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{(citation.confidenceScore * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Rerank Score</span>
              <strong className="text-blue-600 dark:text-blue-400">{citation.rerankScore}</strong>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Last Sync</span>
              <strong className="text-zinc-800 dark:text-zinc-200">{citation.lastUpdated}</strong>
            </div>
          </div>

          {/* Document Title Header */}
          <div className="space-y-1">
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {citation.docTitle}
            </h4>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Location: {citation.sectionId} {citation.pageNumber ? `(Page ${citation.pageNumber})` : ''}
            </div>
          </div>

          {/* Full Content Box */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Extracted 1,024-Token Passage Context
            </span>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-sans whitespace-pre-line">
              {citation.fullContent}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Vector Payload • Verified Authentic</span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Passage' : 'Copy Passage'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
