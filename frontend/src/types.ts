export type ActiveTab = 'knowledge' | 'documents' | 'evaluation' | 'settings';

export interface Citation {
  id: string;
  docId: string;
  docTitle: string;
  sectionId: string;
  pageNumber?: number;
  sourceType: 'Federal SOP' | 'International Directive' | 'State DOT Protocol' | 'Medical Guidance' | 'Hazmat Spec';
  confidenceScore: number;
  rerankScore: number;
  snippet: string;
  fullContent: string;
  agencyLogo?: string;
  lastUpdated: string;
}

export interface ReportSection {
  title: string;
  content: string;
  bulletPoints?: string[];
  citations: string[]; // Citation IDs
}

export interface GroundedReport {
  query: string;
  title: string;
  summary: string;
  aiAnswer?: string; // Natural language AI response generated using Llama 3.3 70B via Groq
  sections: ReportSection[];
  confidenceScore: number; // e.g. 0.987
  groundednessScore: number; // e.g. 0.992
  citationCount: number;
  citations: Citation[];
  verifiedAuthority: string;
  directiveRef: string;
  generatedAt: string;
  processingTimeMs: number;
  hallucinationRisk: 'Zero' | 'Negligible' | 'Moderate';
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'idle' | 'warning';
  latencyMs: number;
  details: string;
  metrics: Record<string, string | number>;
}

export interface PipelineMetrics {
  totalLatencyMs: number;
  overallConfidence: number;
  retrievedDocsCount: number;
  indexedChunksCount: number;
  vectorSimilarityThreshold: number;
  tokensProcessed: number;
  groundednessScore?: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  agency: string;
  category: 'Hurricane & Typhoon' | 'Chemical HAZMAT' | 'Earthquake & Tsunami' | 'Pandemic & Medical' | 'Wildfire SOP';
  fileType: 'PDF' | 'DOCX' | 'XML Directives';
  fileSize: string;
  chunkCount: number;
  lastIndexed: string;
  status: 'Indexed' | 'Syncing' | 'Archived';
  version: string;
  securityClassification: 'Official Use Only' | 'Public Safety' | 'Unclassified Enterprise';
}

export interface EvaluationMetric {
  name: string;
  score: number;
  target: number;
  delta: string;
  description: string;
  historicalScores: number[];
}

export interface SampleQuery {
  id: string;
  query: string;
  category: string;
  agencyTag: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  report?: GroundedReport;
  isStreaming?: boolean;
  loadingStep?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  activeCitationId: string | null;
}

