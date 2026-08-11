import { DocumentItem, EvaluationMetric, SampleQuery } from '../types';

export const SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: 'q1',
    query: 'What are the evacuation procedures during a Category 4 hurricane?',
    category: 'Hurricane & Coastal Storm',
    agencyTag: 'FEMA / USCG'
  },
  {
    id: 'q2',
    query: 'What is the standard protocol for HAZMAT chemical spill containment in urban zones?',
    category: 'Hazardous Materials',
    agencyTag: 'EPA / OSHA'
  },
  {
    id: 'q3',
    query: 'What are the critical medical triage priorities after a 7.2 magnitude earthquake?',
    category: 'Mass Casualty Triage',
    agencyTag: 'WHO / START'
  },
  {
    id: 'q4',
    query: 'How do NGOs coordinate water purification distribution during severe flood events?',
    category: 'Humanitarian Assistance',
    agencyTag: 'Red Cross / UNICEF'
  }
];

export const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-fema-104',
    title: 'FEMA Hurricane Preparedness & Evacuation Framework',
    agency: 'FEMA / DHS',
    category: 'Hurricane & Typhoon',
    fileType: 'PDF',
    fileSize: '18.4 MB',
    chunkCount: 1240,
    lastIndexed: '2026-07-28 14:22',
    status: 'Indexed',
    version: 'v4.2 (2025)',
    securityClassification: 'Official Use Only'
  },
  {
    id: 'doc-dot-contraflow',
    title: 'FHWA Emergency Contraflow & Highway Operations SOP',
    agency: 'Federal Highway Admin',
    category: 'Hurricane & Typhoon',
    fileType: 'PDF',
    fileSize: '8.2 MB',
    chunkCount: 610,
    lastIndexed: '2026-07-30 09:15',
    status: 'Indexed',
    version: 'v2.1 (2024)',
    securityClassification: 'Public Safety'
  },
  {
    id: 'doc-epa-hazmat',
    title: 'US EPA Hazardous Materials Emergency Response Guide',
    agency: 'US EPA',
    category: 'Chemical HAZMAT',
    fileType: 'PDF',
    fileSize: '24.1 MB',
    chunkCount: 1890,
    lastIndexed: '2026-08-01 11:40',
    status: 'Indexed',
    version: 'v5.0 (2025)',
    securityClassification: 'Official Use Only'
  },
  {
    id: 'doc-osha-1910',
    title: 'OSHA HAZWOPER Standard 29 CFR 1910.120 Manual',
    agency: 'OSHA',
    category: 'Chemical HAZMAT',
    fileType: 'PDF',
    fileSize: '12.6 MB',
    chunkCount: 940,
    lastIndexed: '2026-07-20 16:05',
    status: 'Indexed',
    version: 'v3.8 (2024)',
    securityClassification: 'Unclassified Enterprise'
  },
  {
    id: 'doc-who-triage',
    title: 'WHO Emergency Medical Teams Minimum Standards in Disasters',
    agency: 'World Health Org',
    category: 'Earthquake & Tsunami',
    fileType: 'PDF',
    fileSize: '31.5 MB',
    chunkCount: 2450,
    lastIndexed: '2026-08-02 08:30',
    status: 'Indexed',
    version: 'v6.1 (2025)',
    securityClassification: 'Public Safety'
  },
  {
    id: 'doc-crush-syndrome',
    title: 'ISN Crush Injury & Extrication Resuscitation Protocols',
    agency: 'ISN Nephrology Taskforce',
    category: 'Earthquake & Tsunami',
    fileType: 'PDF',
    fileSize: '5.8 MB',
    chunkCount: 420,
    lastIndexed: '2026-07-15 10:12',
    status: 'Indexed',
    version: 'v2.0 (2024)',
    securityClassification: 'Public Safety'
  },
  {
    id: 'doc-sphere-wash',
    title: 'SPHERE Humanitarian Charter & Minimum WASH Standards',
    agency: 'SPHERE Association',
    category: 'Pandemic & Medical',
    fileType: 'PDF',
    fileSize: '42.0 MB',
    chunkCount: 3120,
    lastIndexed: '2026-08-02 18:45',
    status: 'Indexed',
    version: 'v5.2 (2025)',
    securityClassification: 'Public Safety'
  },
  {
    id: 'doc-usace-flood',
    title: 'US Army Corps of Engineers Levee & Inundation SOP',
    agency: 'USACE',
    category: 'Hurricane & Typhoon',
    fileType: 'PDF',
    fileSize: '15.9 MB',
    chunkCount: 1180,
    lastIndexed: '2026-07-29 13:00',
    status: 'Indexed',
    version: 'v3.1 (2025)',
    securityClassification: 'Official Use Only'
  },
  {
    id: 'doc-nwc-wildfire',
    title: 'NWCG Interagency Incident Business Management Wildfire Guide',
    agency: 'National Wildfire Coordinating Group',
    category: 'Wildfire SOP',
    fileType: 'PDF',
    fileSize: '22.3 MB',
    chunkCount: 1670,
    lastIndexed: '2026-07-25 15:50',
    status: 'Indexed',
    version: 'v4.0 (2025)',
    securityClassification: 'Official Use Only'
  }
];

export const EVALUATION_METRICS: EvaluationMetric[] = [
  {
    name: 'Groundedness (Faithfulness)',
    score: 0.988,
    target: 0.980,
    delta: '+0.8%',
    description: 'Measures how strictly generated statements are directly derived from retrieved evidence passages.',
    historicalScores: [0.962, 0.971, 0.978, 0.982, 0.988]
  },
  {
    name: 'Answer Relevance',
    score: 0.992,
    target: 0.985,
    delta: '+0.7%',
    description: 'Evaluates how directly the synthesized report addresses the specific disaster query without tangential fluff.',
    historicalScores: [0.970, 0.980, 0.985, 0.989, 0.992]
  },
  {
    name: 'Context Precision',
    score: 0.968,
    target: 0.950,
    delta: '+1.8%',
    description: 'Ratio of relevant retrieved chunks to total retrieved chunks presented to the LLM synthesis engine.',
    historicalScores: [0.930, 0.945, 0.955, 0.960, 0.968]
  },
  {
    name: 'Context Recall',
    score: 0.974,
    target: 0.960,
    delta: '+1.4%',
    description: 'Measures if all ground-truth facts necessary to answer the emergency query were successfully retrieved.',
    historicalScores: [0.940, 0.952, 0.965, 0.970, 0.974]
  },
  {
    name: 'Zero-Hallucination Guardrail Rate',
    score: 0.999,
    target: 0.995,
    delta: '+0.4%',
    description: 'Percentage of queries where refusal or exact citation fallback triggered when evidence was absent.',
    historicalScores: [0.990, 0.992, 0.995, 0.998, 0.999]
  }
];