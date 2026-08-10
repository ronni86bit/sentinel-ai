import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { DEFAULT_DOCUMENTS } from '../data/mockData';
import { 
  FileText, 
  Search, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  ShieldCheck, 
  Plus, 
  Layers, 
  Filter, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { cn } from '../lib/utils';

export const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(DEFAULT_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = ['All', 'Hurricane & Typhoon', 'Chemical HAZMAT', 'Earthquake & Tsunami', 'Pandemic & Medical', 'Wildfire SOP'];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.agency.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Vector Index re-synced! 14,280 chunks updated across Milvus cluster.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">Document Repository & Vector Store</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
            Official Emergency Guidelines Catalog
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Indexed federal directives, WHO SOPs, and emergency procedures.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
            <span className="hidden xs:inline">{isSyncing ? 'Re-indexing...' : 'Re-index Vector DB'}</span>
            <span className="xs:hidden">{isSyncing ? 'Syncing' : 'Re-index'}</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3 py-1.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-0.5 sm:space-y-1">
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">Total Guidelines</div>
          <div className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {documents.length} <span className="text-xs font-normal text-zinc-400">Files</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">100% Verified</div>
        </div>

        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-0.5 sm:space-y-1">
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">Indexed Chunks</div>
          <div className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            14,280 <span className="text-xs font-normal text-zinc-400">Chunks</span>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono truncate">1024 Tokens</div>
        </div>

        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-0.5 sm:space-y-1">
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">Embedding Dims</div>
          <div className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            1,536 <span className="text-xs font-normal text-zinc-400">dims</span>
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono truncate">text-embedding-3</div>
        </div>

        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-0.5 sm:space-y-1">
          <div className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">Security Status</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono truncate">
            Encrypted
          </div>
          <div className="text-[10px] text-zinc-400 font-mono truncate">AES-256 Vault</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by directive title, agency, or classification..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-4">Directive Title & Agency</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Chunks</th>
                <th className="p-3.5">Classification</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 pl-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center space-x-2 font-mono">
                          <span>{doc.agency}</span>
                          <span>•</span>
                          <span>{doc.version}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-zinc-700 dark:text-zinc-300 font-medium">
                    {doc.category}
                  </td>
                  <td className="p-3.5 font-mono text-zinc-600 dark:text-zinc-400">
                    {doc.chunkCount.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {doc.securityClassification}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-zinc-500 dark:text-zinc-400">
                    {doc.fileSize}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Indexed</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-4">
                    <button
                      onClick={() => alert(`Inspecting chunks for: ${doc.title}`)}
                      className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Inspect Chunks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Simulation Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Upload Emergency Directive PDF
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select an official government SOP or disaster management manual to parse into 1,024-token vector chunks.
            </p>

            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center space-y-2 hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-blue-500 mx-auto" />
              <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                Drag and drop PDF guidelines here
              </div>
              <div className="text-[11px] text-zinc-400">Supports PDF, DOCX, XML up to 50MB</div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  alert('Directive uploaded and queued for vector chunking!');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Start Indexing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
