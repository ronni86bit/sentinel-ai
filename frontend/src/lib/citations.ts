import { Citation } from '../types';

// Reduce a raw citation token to a canonical, comparable id string.
// Handles: "FLOOD-2", "[FLOOD-2]", "Section ID: FLOOD-2",
// "FLOOD-2 Pre-Monsoon Preparedness", "flood-2", etc.
export function cleanToken(raw: string): string {
  let value = (raw || '').trim().toLowerCase();
  value = value.replace(/^section\s+id\s*[:#-]?\s*/, '');
  const idMatch = value.match(/([a-z0-9]+[-_][a-z0-9]+)/);
  if (idMatch) return idMatch[1];
  return value.replace(/\s+/g, ' ').trim();
}

// Normalize any label for comparison (lowercase, collapse whitespace/separators).
export function normalizeToken(value: string): string {
  return (value || '').replace(/[\s•#]+/g, ' ').trim().toLowerCase();
}

// Extract the section IDs the generated answer actually cites, in order.
// The backend prompt requires inline brackets like [FLOOD-2] AND a trailing
// "Citations:" list (e.g. "Citations: FLOOD-2, FLOOD-3"). Handle both, and split
// combined bracket lists like [FLOOD-2, FLOOD-3] into individual IDs.
export function extractCitedTokens(answer: string): string[] {
  const tokens: string[] = [];

  for (const m of (answer || '').match(/\[[^\]]*\]/g) || []) {
    const inner = m.slice(1, -1);
    for (const part of inner.split(',')) {
      const clean = cleanToken(part);
      if (clean) tokens.push(clean);
    }
  }

  const lines = (answer || '').split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/^[^a-z0-9]*citations\s*[:=]?\s*(.*)$/i);
    if (m) {
      for (const part of m[1].split(',')) {
        const clean = cleanToken(part);
        if (clean) tokens.push(clean);
      }
      break;
    }
  }

  return tokens;
}

// Returns true when a retrieved passage corresponds to a cited token.
// Uses exact normalized matches on sectionId / id / docId / docTitle first, then a
// component-wise comparison on the section id so "FLOOD-2" never falsely matches
// "FLOOD-20" or a different retrieved section such as "FLOOD-3".
export function citationMatchesToken(cit: Citation, token: string): boolean {
  const target = cleanToken(token);
  if (!target) return false;

  const candidates = [cit.sectionId, cit.id, cit.docId, cit.docTitle]
    .map(normalizeToken)
    .filter((v) => v.length > 0);

  if (candidates.includes(target)) return true;

  const section = normalizeToken(cit.sectionId);
  if (!section) return false;
  const sectionParts = section.split(/[^a-z0-9]+/).filter(Boolean);
  const targetParts = target.split(/[^a-z0-9]+/).filter(Boolean);
  return (
    sectionParts.length === targetParts.length &&
    sectionParts.every((p, i) => p === targetParts[i])
  );
}

// Find the retrieved passage matching a cited token, or undefined.
export function findMatchingCitation(
  citations: Citation[],
  token: string
): Citation | undefined {
  return citations.find((c) => citationMatchesToken(c, token));
}
