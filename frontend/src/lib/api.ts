import { Citation, GroundedReport, ReportSection } from '../types';
import { citationMatchesToken, extractCitedTokens } from './citations';

export interface QueryApiCitation {
  id: string;
  docId: string;
  docTitle: string;
  sectionId: string;
  confidenceScore?: number;
  snippet?: string;
  content?: string;
  source?: string;
  pageNumber?: number;
  rerankScore?: number;
  lastUpdated?: string;
}

export interface QueryApiSection {
  title?: string;
  content?: string;
  bulletPoints?: string[];
  citations?: string[];
}

export interface QueryApiResponse {
  query: string;
  title?: string;
  summary?: string;
  aiAnswer?: string;
  sections?: QueryApiSection[];
  confidenceScore?: number;
  groundednessScore?: number;
  citationCount?: number;
  citations?: QueryApiCitation[];
  verifiedAuthority?: string;
  directiveRef?: string;
  generatedAt?: string;
  processingTimeMs?: number;
  hallucinationRisk?: string;
  retrievedDocsCount?: number;
  indexedChunksCount?: number;
  tokensProcessed?: number;
  vectorSimilarityThreshold?: number;
  rerankModel?: string;
}

export function mapQueryApiToReport(raw: QueryApiResponse): GroundedReport {
  const citations: Citation[] = (raw.citations || []).map((c) => ({
    id: c.id,
    docId: c.docId,
    docTitle: c.docTitle,
    sectionId: c.sectionId,
    pageNumber: c.pageNumber,
    sourceType: c.source || c.docTitle || '',
    confidenceScore: c.confidenceScore ?? 0,
    rerankScore: c.rerankScore ?? c.confidenceScore ?? 0,
    snippet: c.snippet || c.content || '',
    fullContent: c.content || c.snippet || '',
    lastUpdated: c.lastUpdated || raw.generatedAt,
  }));

  const sections: ReportSection[] = (raw.sections || []).map((s) => ({
    title: s.title || '',
    content: s.content || '',
    bulletPoints: s.bulletPoints,
    citations: s.citations || [],
  }));

  // ---- Engage the citations actually used in the generated answer ----
  // The answer cites specific section IDs like [FLOOD-2] (inline brackets plus a
  // trailing "Citations:" list). The backend returns the retrieved passages in raw
  // retrieval order, which may not match what the answer actually referenced.
  // Reorder the evidence so any passage whose section ID appears in the answer is
  // surfaced first, and flag it as cited.
  const citedTokens = extractCitedTokens(raw.aiAnswer || '');
  const ordered: Citation[] = [];
  const usedIds = new Set<string>();

  for (const token of citedTokens) {
    const match = citations.find(
      (c) => !usedIds.has(c.id) && citationMatchesToken(c, token)
    );
    if (match) {
      usedIds.add(match.id);
      ordered.push(match);
    }
  }
  const rest = citations.filter((c) => !usedIds.has(c.id));

  const prioritizedCitations: Citation[] = [...ordered, ...rest].map((c) => ({
    ...c,
    isCited: usedIds.has(c.id),
  }));

  const citationCount = raw.citationCount ?? prioritizedCitations.length;

  return {
    query: raw.query,
    title: raw.title || '',
    summary: raw.summary || '',
    aiAnswer: raw.aiAnswer || '',
    sections,
    confidenceScore: raw.confidenceScore ?? 0,
    groundednessScore: raw.groundednessScore ?? 0,
    citationCount,
    citations: prioritizedCitations,
    verifiedAuthority: raw.verifiedAuthority || '',
    directiveRef: raw.directiveRef || '',
    generatedAt: raw.generatedAt || '',
    processingTimeMs: raw.processingTimeMs ?? 0,
    hallucinationRisk: (raw.hallucinationRisk ||
      (prioritizedCitations.length > 0 ? 'Zero' : 'Low')) as GroundedReport['hallucinationRisk'],
    retrievedDocsCount: raw.retrievedDocsCount ?? prioritizedCitations.length,
    indexedChunksCount: raw.indexedChunksCount,
    tokensProcessed: raw.tokensProcessed,
    vectorSimilarityThreshold: raw.vectorSimilarityThreshold,
    rerankModel: raw.rerankModel,
  };
}

const API_BASE_URL = '/api';

export async function queryApi(
  question: string,
  signal?: AbortSignal
): Promise<GroundedReport> {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body.detail || body.message || '';
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(
      `Query request failed (${response.status})${detail ? `: ${detail}` : ''}`
    );
  }

  const data: QueryApiResponse = await response.json();
  return mapQueryApiToReport(data);
}