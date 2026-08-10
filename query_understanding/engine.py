"""
Query Understanding Engine for SentinelAI RAG system.

Extracts:
    - disaster_type: one of ['flood', 'heatwave', 'cyclone', 'shelter', 'unknown']
    - info_intent: one of ['preparedness', 'evacuation', 'assessment', 'communication', 'general', 'unknown']
    - query_type: 'action' or 'informational'
    - urgency_level: 'low', 'medium', 'high'

Uses lightweight rule-based logic with configurable keyword mappings.
No LLM is called.
"""

import re
from typing import Dict, List, Tuple

# ----------------------------------------------------------------------
# Configurable keyword mappings (can be moved to external JSON/YAML if desired)
# ----------------------------------------------------------------------
DISASTER_KEYWORDS: Dict[str, List[str]] = {
    "flood": [
        "flood", "flooding", "inundation", "waterlogging", "monsoon", "rain",
        "river", "dam", "levee", "flash flood"
    ],
    "heatwave": [
        "heat", "heatwave", "hot", "temperature", "heat stroke", "sunstroke",
        "heat index", "heat alert"
    ],
    "cyclone": [
        "cyclone", "hurricane", "typhoon", "storm", "wind", "gale",
        "tropical storm"
    ],
    "shelter": [
        "shelter", "evacuation center", "relief camp", "safe house",
        "temporary shelter"
    ],
}

INTENT_KEYWORDS: Dict[str, List[str]] = {
    "preparedness": [
        "prepare", "preparedness", "precaution", "prevent", "mitigation",
        "before", "pre-monsoon", "ready", "plan", "planning"
    ],
    "evacuation": [
        "evacuate", "evacuation", "relocate", "move to safety", "leave area",
        "evacuate", "evacuation trigger", "when to leave"
    ],
    "assessment": [
        "assess", "assessment", "impact", "damage", "loss", "post-event",
        "after", "survey", "evaluate"
    ],
    "communication": [
        "communicate", "message", "alert", "warning", "inform", "notify",
        "public announcement", "broadcast"
    ],
    "general": [
        "what", "how", "why", "explain", "describe", "information",
        "details", "overview"
    ],
}

ACTION_VERBS: List[str] = [
    "do", "should", "must", "need to", "steps", "action", "act",
    "implement", "follow", "take", "carry out", "execute", "perform",
    "what should be done", "what to do"
]

URGENCY_KEYWORDS: Dict[str, List[str]] = {
    "high": [
        "immediate", "urgently", "urgent", "emergency", "right now",
        "asap", "immediately", "critical", "severe", "danger"
    ],
    "medium": [
        "soon", "promptly", "quickly", "within hours", "today",
        "this hour"
    ],
    "low": [
        "later", "when possible", "eventually", "no rush",
        "whenever", "informational"
    ],
}

# ----------------------------------------------------------------------
# Helper functions
# ----------------------------------------------------------------------
def _contains_any(text: str, keywords: List[str]) -> bool:
    """Return True if any keyword appears in text (case‑insensitive)."""
    lowered = text.lower()
    return any(kw in lowered for kw in keywords)


def _extract_disaster_type(query: str) -> str:
    for disaster, kws in DISASTER_KEYWORDS.items():
        if _contains_any(query, kws):
            return disaster
    return "unknown"


def _extract_info_intent(query: str) -> str:
    for intent, kws in INTENT_KEYWORDS.items():
        if _contains_any(query, kws):
            return intent
    return "unknown"


def _extract_query_type(query: str) -> str:
    """Return 'action' if the query seeks steps/actions, else 'informational'."""
    if _contains_any(query, ACTION_VERBS):
        return "action"
    # fallback: look for question words that usually indicate informational
    if _contains_any(query, ["what", "how", "why", "explain", "describe"]):
        return "informational"
    # default to informational if unclear
    return "informational"


def _extract_urgency_level(query: str) -> str:
    for level, kws in URGENCY_KEYWORDS.items():
        if _contains_any(query, kws):
            return level
    return "low"


# ----------------------------------------------------------------------
# Public API
# ----------------------------------------------------------------------
def parse_query(query: str) -> Dict[str, str]:
    """
    Parse a natural‑language user question and return a dict with:
        disaster_type, info_intent, query_type, urgency_level

    Parameters
    ----------
    query: str
        The raw user question.

    Returns
    -------
    Dict[str, str]
        Structured understanding of the query.
    """
    if not query or not query.strip():
        return {
            "disaster_type": "unknown",
            "info_intent": "unknown",
            "query_type": "informational",
            "urgency_level": "low",
        }

    disaster_type = _extract_disaster_type(query)
    info_intent = _extract_info_intent(query)
    query_type = _extract_query_type(query)
    urgency_level = _extract_urgency_level(query)

    return {
        "disaster_type": disaster_type,
        "info_intent": info_intent,
        "query_type": query_type,
        "urgency_level": urgency_level,
    }


if __name__ == "__main__":  # pragma: no cover
    # Simple sanity checks
    examples = [
        "What should be done before monsoon to reduce flood risk?",
        "When should we evacuate during a flood?",
        "Explain the impact of flood damage after water recedes.",
        "How to send a public warning about incoming cyclone?",
        "Is there any immediate action needed for heatwave today?",
    ]
    for ex in examples:
        print(f"Query: {ex}")
        print(parse_query(ex))
        print("-" * 40)