import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Citation } from '../types';

interface MarkdownRendererProps {
  content: string;
  citations?: Citation[];
  activeCitationId?: string | null;
  onSelectCitation?: (citationId: string) => void;
  onOpenCitationModal?: (citationId: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  citations = [],
  activeCitationId,
  onSelectCitation,
  onOpenCitationModal,
}) => {
  // Helper to render text containing inline citation tags like [Section 4.2.1] or [Cit-1]
  const renderTextWithCitations = (text: string) => {
    if (typeof text !== 'string') return text;
    const parts = text.split(/(\[[^\]]+\])/g);

    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const citationContent = part.slice(1, -1);
        
        const matchedCit = citations.find(c => 
          c.sectionId.toLowerCase().includes(citationContent.toLowerCase()) ||
          citationContent.toLowerCase().includes(c.sectionId.toLowerCase()) ||
          c.id.toLowerCase() === citationContent.toLowerCase()
        ) || (citations.length > 0 ? citations[index % citations.length] : null);

        const isSelected = matchedCit && activeCitationId === matchedCit.id;

        return (
          <button
            key={index}
            onClick={() => {
              if (matchedCit && onSelectCitation && onOpenCitationModal) {
                onSelectCitation(matchedCit.id);
                onOpenCitationModal(matchedCit.id);
              }
            }}
            className={cn(
              'inline-flex items-center space-x-0.5 px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer border',
              isSelected
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs ring-2 ring-blue-500/30'
                : 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900'
            )}
            title={matchedCit ? `View source: ${matchedCit.docTitle}` : 'Click to inspect citation'}
          >
            <span>{part}</span>
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-5 mb-3 tracking-tight border-b border-zinc-200 dark:border-zinc-800 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5 tracking-tight">
              {children}
            </h3>
          ),
          p: ({ children }) => {
            if (typeof children === 'string') {
              return <p className="mb-3 leading-relaxed">{renderTextWithCitations(children)}</p>;
            }
            return <p className="mb-3 leading-relaxed">{children}</p>;
          },
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-3 pl-4 list-disc marker:text-blue-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-3 pl-5 list-decimal marker:text-blue-500 marker:font-bold font-sans">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-zinc-700 dark:text-zinc-300">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-1 italic bg-blue-50/30 dark:bg-blue-950/20 text-zinc-700 dark:text-zinc-300 rounded-r-lg my-3">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && !String(children).includes('\n');
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold">
                  {children}
                </code>
              );
            }
            return (
              <div className="relative my-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
                <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 text-xs font-mono text-zinc-400 border-b border-zinc-800">
                  <span>code</span>
                </div>
                <pre className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-zinc-200">
                  <code>{children}</code>
                </pre>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
