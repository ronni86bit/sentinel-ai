import { GroundedReport, DocumentItem, EvaluationMetric, SampleQuery, PipelineStage, PipelineMetrics } from '../types';

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

export const MOCK_REPORTS: Record<string, GroundedReport> = {
  q1: {
    query: 'What are the evacuation procedures during a Category 4 hurricane?',
    title: 'Category 4 Coastal Evacuation & Inter-Agency Command Protocol',
    summary: 'Directives compiled from FEMA Directive 104-008, National Response Framework (NRF), and US Coast Guard Incident Management Protocols. Governs mandatory clearance timelines, contraflow highway routing, critical care shelter transfers, and post-landfall Search & Rescue (SAR) staging.',
    aiAnswer: `During a Category 4 hurricane (sustained winds of 130–156 mph), emergency response procedures require strict, time-phased execution to protect lives and critical infrastructure:

1. Mandatory Evacuation Orders (T-36 Hours): Local authorities must issue mandatory evacuation directives for coastal zones, barrier islands, and low-lying estuarine areas at least 36 hours prior to the onset of 39 mph winds [Section 4.2.1]. Public alerts are synchronized across Wireless Emergency Alerts (WEA) and EAS broadcasts every 15 minutes.

2. Contraflow Interstate Routing (T-30 Hours): Major highway corridors transition into reverse-lane contraflow geometry to maximize traffic throughput [Annex B • Traffic Control]. State troopers secure median crossovers while heavy wrecker tow units clear disabled vehicles within a 12-minute target window.

3. Medical & Critical Patient Relocation (T-24 Hours): Level 1 trauma centers and ventilator-dependent ICU patients undergo air and ground evacuation to inland medical hubs under the National Disaster Medical System (NDMS) [Section 7.1].

4. Pre-Positioned Search & Rescue (SAR) (T-18 Hours): US Coast Guard Jayhawk helicopters and shallow-water rescue boats pre-stage outside the 100-mile gale radius to launch immediate post-landfall operations [Volume III • SAR Operations].

5. Mega-Shelter Operations: Inland shelters maintain 40 sq ft usable space per occupant with 72-hour generator backup and rations scaled to 150% capacity [Chapter 3 • Shelter Capacity].`,
    confidenceScore: 0.987,
    groundednessScore: 0.994,
    citationCount: 5,
    verifiedAuthority: 'FEMA & Department of Homeland Security Directive 104-008-1',
    directiveRef: 'NRF-SOP-CAT4-2025.V4',
    generatedAt: '2026-08-03T19:20:00Z',
    processingTimeMs: 124,
    hallucinationRisk: 'Zero',
    citations: [
      {
        id: 'cit-1',
        docId: 'doc-fema-104',
        docTitle: 'FEMA Hurricane Preparedness & Evacuation Framework (2025 Ed.)',
        sectionId: 'Section 4.2.1',
        pageNumber: 84,
        sourceType: 'Federal SOP',
        confidenceScore: 0.992,
        rerankScore: 0.965,
        snippet: 'Mandatory evacuation orders for Category 4 landfalls must be issued at minimum T-36 hours prior to anticipated tropical storm force wind onset (39 mph). Public alert notifications must synchronize WEA (Wireless Emergency Alerts) with EAS broadcasts every 15 minutes.',
        fullContent: 'Mandatory evacuation orders for Category 4 landfalls (sustained winds 130-156 mph) must be issued at minimum T-36 hours prior to anticipated tropical storm force wind onset (39 mph). Public alert notifications must synchronize WEA (Wireless Emergency Alerts) with EAS broadcasts every 15 minutes across affected coastal zones. Special emphasis must be placed on evacuating barrier islands and low-lying estuarine regions where storm surge exceedances above 12-18 feet above ground level are projected.',
        lastUpdated: 'Jan 2025'
      },
      {
        id: 'cit-2',
        docId: 'doc-dot-contraflow',
        docTitle: 'Federal Highway Administration Emergency Contraflow Operations',
        sectionId: 'Annex B • Traffic Control',
        pageNumber: 32,
        sourceType: 'State DOT Protocol',
        confidenceScore: 0.978,
        rerankScore: 0.941,
        snippet: 'Primary interstate corridors shall transition to mandatory contraflow (reverse-lane) geometry at T-30 hours. Law enforcement state troopers must secure median crossovers and position tow vehicles every 5 miles to clear stalled vehicles within 12 minutes.',
        fullContent: 'Primary interstate corridors designated under regional evacuation plans shall transition to mandatory contraflow (reverse-lane) geometry at T-30 hours. Law enforcement state troopers must secure median crossovers and position heavy-duty recovery tow vehicles every 5 miles to clear stalled or damaged vehicles within a target window of 12 minutes. Fuel resupply tankers are mandated to deploy at 15-mile intervals along emergency evacuation routes.',
        lastUpdated: 'Nov 2024'
      },
      {
        id: 'cit-3',
        docId: 'doc-hhs-medvac',
        docTitle: 'HHS Health & Human Services Critical Facility Evacuation Standard',
        sectionId: 'Section 7.1',
        pageNumber: 112,
        sourceType: 'Medical Guidance',
        confidenceScore: 0.985,
        rerankScore: 0.952,
        snippet: 'Level 1 Trauma Centers and ICU patients requiring ventilator support must complete air-ambulance or specialized ground transport transfers to inland host medical centers no later than T-24 hours prior to landfall.',
        fullContent: 'Level 1 Trauma Centers, acute care hospitals, and ICU patients requiring continuous ventilator or dialysis support must complete air-ambulance or specialized ground transport transfers to inland host medical centers no later than T-24 hours prior to landfall. Non-ambulatory nursing facility residents must be cataloged under the National Disaster Medical System (NDMS) tracker for electronic patient identification.',
        lastUpdated: 'Feb 2025'
      },
      {
        id: 'cit-4',
        docId: 'doc-uscg-sar',
        docTitle: 'US Coast Guard Search & Rescue Incident Staging Protocol',
        sectionId: 'Volume III • SAR Operations',
        pageNumber: 45,
        sourceType: 'Federal SOP',
        confidenceScore: 0.969,
        rerankScore: 0.928,
        snippet: 'Aviation assets (MH-60T Jayhawk helicopters) and shallow-water rescue boat units must pre-stage at inland airfields outside the projected 100-mile gale radius by T-18 hours to prepare for immediate post-eye landfall response.',
        fullContent: 'Aviation assets (MH-60T Jayhawk helicopters) and shallow-water rescue boat units must pre-stage at inland airfields outside the projected 100-mile gale radius by T-18 hours. These units prepare for immediate post-eye landfall response. Communication channels must maintain dual UHF/VHF and satellite backup nodes to survive terrestrial cellular infrastructure collapse.',
        lastUpdated: 'Dec 2024'
      },
      {
        id: 'cit-5',
        docId: 'doc-redcross-shelter',
        docTitle: 'American Red Cross Mass Care & Mega-Shelter Operational Manual',
        sectionId: 'Chapter 3 • Shelter Capacity',
        pageNumber: 19,
        sourceType: 'International Directive',
        confidenceScore: 0.974,
        rerankScore: 0.935,
        snippet: 'Mega-shelters operating outside inundation zones must maintain a minimum threshold of 40 sq ft usable space per evacuee, 72 hours of emergency generator power, and non-perishable rations calculated for 150% peak capacity.',
        fullContent: 'Mega-shelters operating outside storm surge inundation zones must maintain a minimum threshold of 40 sq ft usable space per evacuee, 72 hours of dedicated backup generator power for climate control and medical refrigeration, and emergency rations calculated for 150% peak capacity to absorb secondary evacuee surges.',
        lastUpdated: 'Mar 2025'
      }
    ],
    sections: [
      {
        title: '1. Mandatory Evacuation Orders & Trigger Timelines',
        content: 'Category 4 hurricane evacuations operate on strict time-phased triggers synchronized with projected landfall parameters. Local emergency management directors must issue mandatory evacuation orders no later than T-36 hours before sustained 39 mph wind onset.',
        bulletPoints: [
          'T-36 Hours: Mandatory evacuation order activation for coastal zones, barrier islands, and mobile home parks.',
          'T-30 Hours: Transition interstate corridors into full contraflow directionality; deploy state patrol tow fleets.',
          'T-24 Hours: Finalize medical evacuations for ventilator-dependent and ICU hospital patients via NDMS transport.',
          'T-12 Hours: Halt all surface emergency transport; require all responders to seek hardened vertical shelter.'
        ],
        citations: ['cit-1', 'cit-3']
      },
      {
        title: '2. Contraflow Highway Management & Traffic Flow Control',
        content: 'To maximize vehicle throughput along designated evacuation routes, State Departments of Transportation initiate contraflow lane reversals under Federal Highway Administration protocols.',
        bulletPoints: [
          'State trooper posts positioned at median crossovers every 5 miles to maintain uninterrupted speed limits.',
          'Rapid clearance units equipped with heavy-duty wreckers placed at 5-mile markers with 12-minute tow mandates.',
          'Emergency mobile fuel tankers staged at 15-mile intervals to prevent highway gridlock due to empty fuel tanks.'
        ],
        citations: ['cit-2']
      },
      {
        title: '3. Medical Triage & Special Needs Shelter Logistics',
        content: 'Healthcare facilities must prevent stranded patient populations by executing phased relocations to regional medical hubs.',
        bulletPoints: [
          'High-acuity ICU and Level 1 trauma patients transferred to inland partner hospitals via NDMS pre-flight assets.',
          'General population shelters enforce 40 sq ft per occupant allocation with 72-hour generator backup power.',
          'Special needs shelters provide dedicated oxygen generation and insulated pharmaceutical refrigeration.'
        ],
        citations: ['cit-3', 'cit-5']
      },
      {
        title: '4. Post-Landfall Search & Rescue (SAR) Staging',
        content: 'Search and rescue assets maintain pre-positioned deployment rings outside the projected 100-mile storm force wind radius to launch immediate urban water rescues upon eye passage.',
        bulletPoints: [
          'USCG MH-60T Jayhawk rotary assets staged at safe inland airfield nodes with satellite radio fallback links.',
          'Shallow-water rescue boat fleets equipped with sonar and thermal imaging pre-rigged for flood zone navigation.'
        ],
        citations: ['cit-4']
      }
    ]
  },

  q2: {
    query: 'What is the standard protocol for HAZMAT chemical spill containment in urban zones?',
    title: 'Urban HAZMAT Chemical Spill Containment & Decontamination SOP',
    summary: 'Synthesized from EPA Hazardous Materials Emergency Response Handbook, OSHA 1910.120 Regulations, and NFPA 472 Guidelines. Details initial isolation perimeters, Level A/B Personal Protective Equipment (PPE), plume modeling, and runoff containment.',
    aiAnswer: `Standard protocols for urban HAZMAT chemical spill containment require an immediate three-zone control strategy under EPA and OSHA 1910.120 standards:

1. Zone Isolation & Plume Modeling: Establish a 300-meter (1,000 ft) initial safety perimeter in all directions [Section 3.4 • Zone Isolation]. Run real-time ALOHA atmospheric dispersion software to map downwind hazard zones, expanding up to 1.5 miles downwind during night thermal inversions.

2. Level A Hot Zone Entry: Reconnaissance teams entering the Exclusion Zone prior to chemical identification must wear Level A vapor-protective suits with positive-pressure SCBA [Subpart H • PPE Selection]. Entry times are capped at 20 minutes with telemetry monitoring cylinder pressure and vital signs.

3. Waterway & Drain Containment: Within 15 minutes, deploy pneumatic storm-drain plugs, bentonite clay dikes, and absorbent booms to intercept chemical runoff before it enters municipal storm sewers [Chapter 5 • Urban Drainage].

4. Mass Decontamination Corridors: Establish strip-wash-rinse decon shower corridors in the Warm Zone operating with lukewarm low-pressure water [Section 2 • Decon Corridor].`,
    confidenceScore: 0.982,
    groundednessScore: 0.989,
    citationCount: 4,
    verifiedAuthority: 'US EPA Emergency Response Division & OSHA Safety Standard 1910.120',
    directiveRef: 'EPA-HAZMAT-URBAN-2025.V2',
    generatedAt: '2026-08-03T19:18:00Z',
    processingTimeMs: 118,
    hallucinationRisk: 'Zero',
    citations: [
      {
        id: 'cit-haz-1',
        docId: 'doc-epa-hazmat',
        docTitle: 'US EPA Hazardous Materials Emergency Response Field Guide',
        sectionId: 'Section 3.4 • Zone Isolation',
        pageNumber: 52,
        sourceType: 'Federal SOP',
        confidenceScore: 0.988,
        rerankScore: 0.958,
        snippet: 'Initial isolation distance for unknown pressurized chemical gas leaks in high-density urban areas is 300 meters (1,000 feet) in all directions, expanding to 1.5 miles downwind during night inversions.',
        fullContent: 'Initial isolation distance for unknown pressurized chemical gas leaks in high-density urban areas is 300 meters (1,000 feet) in all directions. Downwind hazard zones must be dynamically updated using ALOHA atmospheric dispersion software, expanding up to 1.5 miles downwind under night temperature inversion conditions.',
        lastUpdated: 'Jan 2025'
      },
      {
        id: 'cit-haz-2',
        docId: 'doc-osha-1910',
        docTitle: 'OSHA HAZWOPER Standard 29 CFR 1910.120 Compliance Manual',
        sectionId: 'Subpart H • PPE Selection',
        pageNumber: 140,
        sourceType: 'Federal SOP',
        confidenceScore: 0.979,
        rerankScore: 0.942,
        snippet: 'Entry teams entering the Hot Zone (Exclusion Zone) prior to chemical vapor identification must wear Level A fully encapsulating vapor-protective suits with self-contained breathing apparatus (SCBA).',
        fullContent: 'Entry teams entering the Hot Zone (Exclusion Zone) prior to positive chemical vapor identification must wear Level A fully encapsulating vapor-protective suits with positive-pressure self-contained breathing apparatus (SCBA). Entry duration is strictly capped at 20 minutes with real-time telemetry monitoring heart rate and cylinder pressure.',
        lastUpdated: 'Dec 2024'
      },
      {
        id: 'cit-haz-3',
        docId: 'doc-usace-runoff',
        docTitle: 'USACE Environmental Containment & Runoff Interception Protocols',
        sectionId: 'Chapter 5 • Urban Drainage',
        pageNumber: 68,
        sourceType: 'Hazmat Spec',
        confidenceScore: 0.971,
        rerankScore: 0.931,
        snippet: 'Pneumatic storm-drain plugs and bentonite clay barriers must be deployed downstream within 15 minutes of report to prevent chemical effluent from entering municipal storm sewer systems.',
        fullContent: 'Pneumatic storm-drain plugs, absorbent booms, and bentonite clay barriers must be deployed downstream within 15 minutes of initial notification to prevent chemical effluent from entering municipal storm sewer systems and aquatic waterways.',
        lastUpdated: 'Oct 2024'
      },
      {
        id: 'cit-haz-4',
        docId: 'doc-cdc-decon',
        docTitle: 'CDC / ATSDR Mass Casualty Chemical Decontamination Standard',
        sectionId: 'Section 2 • Decon Corridor',
        pageNumber: 28,
        sourceType: 'Medical Guidance',
        confidenceScore: 0.981,
        rerankScore: 0.949,
        snippet: 'Decontamination corridors must establish Warm Zone wash stations prioritizing immediate strip-wash-rinse protocols using lukewarm high-volume low-pressure water shower rigs.',
        fullContent: 'Decontamination corridors must establish Warm Zone wash stations prioritizing immediate strip-wash-rinse protocols using lukewarm high-volume low-pressure water shower rigs. Ambulatory victims undergo 3-minute structured decontamination before secondary medical triage.',
        lastUpdated: 'Feb 2025'
      }
    ],
    sections: [
      {
        title: '1. Incident Perimeter Control & Dispersion Modeling',
        content: 'Upon arrival, incident commanders establish three concentric control zones: Hot (Exclusion Zone), Warm (Contamination Reduction Zone), and Cold (Support Zone).',
        bulletPoints: [
          'Initial minimum safety perimeter set to 300 meters (1,000 ft) in all directions for unidentified volatile releases.',
          'ALOHA plume modeling fed with live GIS wind speed, relative humidity, and solar radiation values.',
          'Evacuation alerts broadcasted downwind for affected high-density residential blocks.'
        ],
        citations: ['cit-haz-1']
      },
      {
        title: '2. Personal Protective Equipment (PPE) & Hot Zone Entry',
        content: 'Hazard identification personnel operate strictly under Level A encapsulation until airborne chemical concentrations are quantified.',
        bulletPoints: [
          'Level A fully-encapsulating chemical suits with inner SCBA required for initial vapor sampling.',
          'Maximum Hot Zone stay time limited to 20 minutes to manage heat stress and air supply reserve.',
          'Dual backup rescue team standing by in Level A gear in the Warm Zone at all times.'
        ],
        citations: ['cit-haz-2']
      },
      {
        title: '3. Runoff Mitigation & Storm Drain Blocking',
        content: 'Preventing environmental contamination of urban storm sewers and potable water intakes is a top tactical objective.',
        bulletPoints: [
          'Deployment of inflatable rubber pneumatic drain plugs at storm drain inlets within 15 minutes.',
          'Bentonite clay dikes constructed along street curbs to channel liquid spill into vacuum truck collection basins.'
        ],
        citations: ['cit-haz-3']
      },
      {
        title: '4. Mass Decontamination Corridor & Patient Triage',
        content: 'Victims exposed to toxic vapor or direct liquid splash pass through the Warm Zone decontamination corridor before transport to regional medical centers.',
        bulletPoints: [
          'Immediate clothing removal eliminates up to 80-90% of external liquid chemical contamination.',
          'High-volume low-pressure water wash (3-minute rinse duration) using non-reactive neutral detergents.'
        ],
        citations: ['cit-haz-4']
      }
    ]
  },

  q3: {
    query: 'What are the critical medical triage priorities after a 7.2 magnitude earthquake?',
    title: 'Mass Casualty Medical Triage & Earthquake Field Hospital Protocols',
    summary: 'Directives sourced from WHO Emergency Medical Teams (EMT) Field Manual, Simple Triage and Rapid Treatment (START) Algorithm, and USAID Office of Foreign Disaster Assistance (OFDA) Urban Search Guidelines.',
    aiAnswer: `Medical triage following a 7.2 magnitude earthquake prioritizes rapid casualty classification and specialized pre-extrication care under WHO and START guidelines:

1. START Triage Classification (30-Second Rule): Response teams classify casualties within 30 seconds into Red (Immediate - airway/hemorrhage), Yellow (Delayed), Green (Minor), or Black (Expectant) based on respiration rate, capillary refill, and mental status [Chapter 2 • Mass Triage].

2. Pre-Extrication Fluid Resuscitation for Crush Syndrome: Victims trapped under concrete rubble for >2 hours must receive intravenous isotonic saline (1.0–1.5 L/hr) initiated prior to lifting heavy debris [Section 1 • Pre-Extrication Fluid]. This prevents fatal acute kidney injury and rhabdomyolysis upon pressure release.

3. Emergency Surgical Capacity (Type 2 EMT Field Hospitals): Deployment of mobile field hospitals within 48 hours providing at least 20 major damage-control surgeries per day (laparotomies, fasciotomies, fracture fixations) [Section 4 • Surgical Capacity].

4. INSARAG Structural Rescue Coordination: Rescue squads apply standardized 1x1 meter square spray matrix markings on searched buildings detailing team ID, hazards, and live vs. deceased counts [Volume II • Quality Assurance].`,
    confidenceScore: 0.991,
    groundednessScore: 0.996,
    citationCount: 4,
    verifiedAuthority: 'World Health Organization (WHO) & START International Disaster Medical Standard',
    directiveRef: 'WHO-EMT-EQ-2025.V1',
    generatedAt: '2026-08-03T19:15:00Z',
    processingTimeMs: 110,
    hallucinationRisk: 'Zero',
    citations: [
      {
        id: 'cit-eq-1',
        docId: 'doc-who-triage',
        docTitle: 'WHO Emergency Medical Teams Minimum Standards in Disasters',
        sectionId: 'Chapter 2 • Mass Triage',
        pageNumber: 15,
        sourceType: 'Medical Guidance',
        confidenceScore: 0.995,
        rerankScore: 0.978,
        snippet: 'Triage categorization under START guidelines requires initial classification within 30 seconds per casualty: Red (Immediate - airway/hemorrhage), Yellow (Delayed), Green (Minor), Black (Expectant).',
        fullContent: 'Triage categorization under START guidelines requires initial classification within 30 seconds per casualty: Red (Immediate - compromised airway, severe arterial hemorrhage, tension pneumothorax), Yellow (Delayed - stable fractures, non-shock abdominal trauma), Green (Minor walking wounded), Black (Deceased or non-salvageable under available field resources).',
        lastUpdated: 'Jan 2025'
      },
      {
        id: 'cit-eq-2',
        docId: 'doc-crush-syndrome',
        docTitle: 'International Society of Nephrology Crush Injury Task Force',
        sectionId: 'Section 1 • Pre-Extrication Fluid',
        pageNumber: 38,
        sourceType: 'International Directive',
        confidenceScore: 0.989,
        rerankScore: 0.962,
        snippet: 'Patients trapped under heavy rubble for >2 hours must receive intravenous isotonic saline infusion (1.0 - 1.5 L/hr) initiated prior to extrication to prevent fatal acute hyperkalemic renal failure (Crush Syndrome).',
        fullContent: 'Patients trapped under heavy concrete rubble for greater than 2 hours must receive intravenous isotonic saline infusion (1.0 to 1.5 L/hr) initiated prior to structural extrication. This pre-hydration is vital to prevent fatal acute hyperkalemic renal failure and rhabdomyolysis-induced cardiac arrest upon pressure release.',
        lastUpdated: 'Nov 2024'
      },
      {
        id: 'cit-eq-3',
        docId: 'doc-field-hospital',
        docTitle: 'USAID / OFDA Guidelines for Field Surgical Infrastructure',
        sectionId: 'Section 4 • Surgical Capacity',
        pageNumber: 76,
        sourceType: 'Federal SOP',
        confidenceScore: 0.981,
        rerankScore: 0.948,
        snippet: 'Type 2 EMT Field Hospitals must be operational within 48 hours post-quake, capable of performing 20 major emergency surgeries per day with dedicated blood bank and portable X-ray capabilities.',
        fullContent: 'Type 2 Emergency Medical Team (EMT) Field Hospitals must achieve operational readiness within 48 hours post-quake. Infrastructure must support at least 20 major emergency damage-control surgeries per day, featuring climate-controlled surgical suites, blood bank units, and portable ultrasound/digital X-ray equipment.',
        lastUpdated: 'Feb 2025'
      },
      {
        id: 'cit-eq-4',
        docId: 'doc-insarag-sar',
        docTitle: 'INSARAG Guidelines for Urban Search and Rescue Operations',
        sectionId: 'Volume II • Quality Assurance',
        pageNumber: 90,
        sourceType: 'International Directive',
        confidenceScore: 0.976,
        rerankScore: 0.939,
        snippet: 'Structural search teams must mark assessed buildings using the international INSARAG square matrix indicating rescue team ID, hazard status, and count of live victims recovered versus deceased.',
        fullContent: 'Structural search teams must mark all assessed buildings using the international INSARAG 1x1 meter square spray matrix. Markings display team callsign, date/time, hazards (e.g., gas leaks, unreinforced masonry), and clear numerical indicators of live victims extricated versus deceased remains located.',
        lastUpdated: 'Dec 2024'
      }
    ],
    sections: [
      {
        title: '1. START Triage Protocol & Initial Assessment',
        content: 'Following a major earthquake, first-arriving medical response units apply the START (Simple Triage and Rapid Treatment) method to process incoming casualties at field triage stations.',
        bulletPoints: [
          '30-Second Triage Rule: Assess respiration (RPM >30 = Red), perfusion (Capillary refill >2s = Red), and mental status.',
          'Immediate (Red): Priorities include tourniquet application, needle decompression, and oral airway insertion.',
          'Delayed (Yellow): Managed in secondary stabilization holding zones with continuous vitals tracking.'
        ],
        citations: ['cit-eq-1']
      },
      {
        title: '2. Crush Injury & Pre-Extrication Medical Intervention',
        content: 'Structural collapse victims trapped under concrete debris require immediate IV fluid resuscitation before lifting heavy loads off compressed limbs.',
        bulletPoints: [
          'Initiate 1.0 - 1.5 L/hr isotonic saline IV infusion into exposed limbs prior to physical beam elevation.',
          'Administer sodium bicarbonate to alkalinize urine and prevent acute tubular necrosis from myoglobin breakdown.',
          'Continuous ECG monitoring for hyperkalemic T-wave elevation during rubble removal.'
        ],
        citations: ['cit-eq-2']
      },
      {
        title: '3. Field Hospital Deployment & Surgical Prioritization',
        content: 'International Type 2 EMT Field Hospitals augment damaged local municipal hospitals.',
        bulletPoints: [
          'Establishment of mobile field hospital within 48 hours with 20 surgery/day capacity.',
          'Triage prioritization focuses on life-and-limb-saving damage control surgery (laparotomy, fasciotomy, open fracture stabilization).'
        ],
        citations: ['cit-eq-3']
      },
      {
        title: '4. INSARAG Building Markings & Heavy Rescue Coordination',
        content: 'USAR heavy rescue teams coordinate with medical units using standardized INSARAG structural hazard indicators.',
        bulletPoints: [
          'International INSARAG square matrix marked in high-visibility orange paint on main entry points.',
          'Structural engineers continuously evaluate aftershock collapse risks prior to medical entry.'
        ],
        citations: ['cit-eq-4']
      }
    ]
  },

  q4: {
    query: 'How do NGOs coordinate water purification distribution during severe flood events?',
    title: 'WASH (Water, Sanitation & Hygiene) Inter-Agency Flood Response Framework',
    summary: 'Compiled from SPHERE Humanitarian Charter Guidelines, UNICEF WASH Cluster Field Operational Standards, and Red Cross Emergency Response Unit (ERU) Water Treatment Specifications.',
    aiAnswer: `During severe flood events, NGOs and international agencies coordinate Water, Sanitation, and Hygiene (WASH) interventions through the UN WASH Cluster system and SPHERE humanitarian standards:

1. Emergency Water Quantity & Distance Targets: Distribution systems must deliver a minimum of 15 liters of potable water per person per day within 500 meters of displaced person camps, maintaining queue times under 30 minutes [Chapter 6 • Water Supply].

2. Point-of-Use Water Treatment & Chlorination: Distribute Sodium Dichloroisocyanurate (NaDCC) water purification tablets (33mg per 10L bucket) to achieve a Free Residual Chlorine (FRC) level of 0.5–1.0 mg/L after 30 minutes contact time [Section 3 • Chlorine Dosing].

3. Mobile Emergency Response Units (ERU): Deploy containerized membrane filtration and coagulation plants capable of processing 200,000 liters per day from turbid floodwaters [Section 4 • Mobile Filtration].

4. Cholera & Waterborne Disease Surveillance: Rapid deployment of water quality testing kits (E. coli incubation and residual chlorine sensors) to prevent secondary outbreaks in flooded shelter zones [Annex C • Water Testing].`,
    confidenceScore: 0.986,
    groundednessScore: 0.991,
    citationCount: 4,
    verifiedAuthority: 'Global WASH Cluster & SPHERE International Humanitarian Standards',
    directiveRef: 'WASH-FLOOD-NGO-2025.V3',
    generatedAt: '2026-08-03T19:10:00Z',
    processingTimeMs: 120,
    hallucinationRisk: 'Zero',
    citations: [
      {
        id: 'cit-wash-1',
        docId: 'doc-sphere-wash',
        docTitle: 'SPHERE Humanitarian Charter & Minimum Standards in Disaster Response',
        sectionId: 'Chapter 6 • Water Supply',
        pageNumber: 104,
        sourceType: 'International Directive',
        confidenceScore: 0.991,
        rerankScore: 0.971,
        snippet: 'Minimum emergency water distribution target is 15 liters per person per day for drinking, cooking, and personal hygiene, with water points located within 500 meters of displaced person shelters.',
        fullContent: 'Minimum emergency water distribution target is 15 liters per person per day for drinking, cooking, and personal hygiene. Water points must be located no further than 500 meters from displaced person shelters, with queue times kept below 30 minutes.',
        lastUpdated: 'Jan 2025'
      },
      {
        id: 'cit-wash-2',
        docId: 'doc-unicef-chlorine',
        docTitle: 'UNICEF Technical Note on Emergency Point-of-Use Water Treatment',
        sectionId: 'Section 3 • Chlorine Dosing',
        pageNumber: 22,
        sourceType: 'International Directive',
        confidenceScore: 0.984,
        rerankScore: 0.953,
        snippet: 'Sodium dichloroisocyanurate (NaDCC) water purification tablets (67mg) treat 10-20 liters of clear water, requiring a 30-minute contact time to ensure a free residual chlorine level of 0.5 - 1.0 mg/L.',
        fullContent: 'Sodium dichloroisocyanurate (NaDCC) water purification tablets (67mg) treat 10-20 liters of clear water, requiring a mandatory 30-minute contact time prior to consumption. Free residual chlorine must measure between 0.5 and 1.0 mg/L at distribution points to prevent cholera and acute watery diarrhea outbreaks.',
        lastUpdated: 'Nov 2024'
      },
      {
        id: 'cit-wash-3',
        docId: 'doc-redcross-eru',
        docTitle: 'IFRC Water & Sanitation Emergency Response Unit (ERU) Manual',
        sectionId: 'Module M15 • Production Units',
        pageNumber: 54,
        sourceType: 'International Directive',
        confidenceScore: 0.978,
        rerankScore: 0.938,
        snippet: 'Mobile modular water treatment units (M15 units) produce up to 150,000 liters of potable water daily using coagulation, multi-media filtration, and chlorination from turbid floodwaters.',
        fullContent: 'Mobile modular water treatment units (M15 units) produce up to 150,000 liters of potable water daily using chemical coagulation (alum), multi-media sand filtration, and gas/liquid chlorination directly from turbid floodwaters.',
        lastUpdated: 'Feb 2025'
      },
      {
        id: 'cit-wash-4',
        docId: 'doc-who-cholera',
        docTitle: 'WHO Cholera & Waterborne Disease Outbreak Surveillance Guidelines',
        sectionId: 'Annex C • Hygiene Kits',
        pageNumber: 31,
        sourceType: 'Medical Guidance',
        confidenceScore: 0.983,
        rerankScore: 0.947,
        snippet: 'Standard family hygiene kits distributed by NGOs must contain two 20L jerrycans with narrow spouts and tap valves, soap bars (250g x 10), and 100 NaDCC purification tablets.',
        fullContent: 'Standard family hygiene kits distributed by NGOs during flood events must contain two 20L heavy-duty food-grade jerrycans with narrow spouts and tap valves, soap bars (250g x 10), 100 NaDCC purification tablets, and visual pictorial instruction cards for non-literate populations.',
        lastUpdated: 'Dec 2024'
      }
    ],
    sections: [
      {
        title: '1. SPHERE Minimum Standards for Displaced Populations',
        content: 'During major flood displacement events, international NGOs coordinate through the UN WASH Cluster to meet SPHERE humanitarian minimums.',
        bulletPoints: [
          '15 Liters/Person/Day: Basic survival threshold allocated for drinking, cooking, and basic hygiene.',
          'Proximity Limit: Water distribution points placed within 500 meters of shelter clusters with maximum 30-min wait times.',
          'Testing Cadence: Daily testing for E. coli, turbidity (<5 NTU), and free residual chlorine.'
        ],
        citations: ['cit-wash-1']
      },
      {
        title: '2. Point-of-Use Chlorination & Water Purification Tablets',
        content: 'When centralized piped water infrastructure is compromised, point-of-use chemical treatment prevents mass cholera outbreaks.',
        bulletPoints: [
          'NaDCC Tablets (67mg): Distributed for household bucket treatment; requires 30-minute contact time.',
          'Target Residual Chlorine: Maintained between 0.5 and 1.0 mg/L at the point of tap or jerrycan filling.'
        ],
        citations: ['cit-wash-2']
      },
      {
        title: '3. Mobile ERU Water Treatment Plant Deployment',
        content: 'Red Cross and MSF deploy heavy mobile filtration rigs to pump and treat surface floodwater directly.',
        bulletPoints: [
          'M15 ERU Production Units process up to 150,000 L/day through alum coagulation and multi-stage filtration.',
          'Bladder Tanks (10,000L - 40,000L) erected at displacement hubs for tap-stand gravity distribution.'
        ],
        citations: ['cit-wash-3']
      },
      {
        title: '4. Hygiene Kit Distribution & Disease Surveillance',
        content: 'Controlling secondary waterborne pathogen transmission requires coupling clean water with hygiene supplies.',
        bulletPoints: [
          'Family WASH Kits include two closed 20L jerrycans with tap valves, antibacterial soap, and NaDCC packs.',
          'Real-time syndromic surveillance tracks cases of acute watery diarrhea (AWD) to trigger localized ring chlorination.'
        ],
        citations: ['cit-wash-4']
      }
    ]
  }
};

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

export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Query Processing',
    status: 'completed',
    latencyMs: 4,
    details: 'Tokenization, Intent Classification & Scope Validation',
    metrics: { Tokens: 12, Language: 'EN-US', Intent: 'Evacuation SOP' }
  },
  {
    id: 'stage-2',
    name: 'Metadata Filter',
    status: 'completed',
    latencyMs: 8,
    details: 'Agency: FEMA, EPA, WHO • Security: Approved • Active Docs Only',
    metrics: { FilteredDocs: 12, Excluded: 45, SecurityCheck: 'Passed' }
  },
  {
    id: 'stage-3',
    name: 'Semantic Search',
    status: 'completed',
    latencyMs: 18,
    details: 'HNSW Vector Index cosine similarity search over 14,280 chunks',
    metrics: { TopK: 50, Dimension: 1536, Distance: 'Cosine' }
  },
  {
    id: 'stage-4',
    name: 'Keyword Search',
    status: 'completed',
    latencyMs: 12,
    details: 'BM25 Term Frequency-Inverse Document Frequency inverted index',
    metrics: { BM25_Score: 18.4, Stemming: 'Porter2', TopK: 50 }
  },
  {
    id: 'stage-5',
    name: 'Reciprocal Rank Fusion',
    status: 'completed',
    latencyMs: 6,
    details: 'RRF algorithm merging vector scores and BM25 keyword rankings (alpha=0.6)',
    metrics: { UnifiedCandidates: 25, RRFRankScore: 0.942 }
  },
  {
    id: 'stage-6',
    name: 'Cross-Encoder Reranking',
    status: 'completed',
    latencyMs: 38,
    details: 'Cohere Rerank v3 Cross-Encoder reordering top-25 down to top-5 chunks',
    metrics: { RerankModel: 'Cohere-v3.5', OutputPassages: 5, ScoreCutoff: 0.85 }
  },
  {
    id: 'stage-7',
    name: 'Grounded Answer Synthesis',
    status: 'completed',
    latencyMs: 38,
    details: 'Gemini 1.5 Pro server-side synthesis with strict citation constraints & zero-hallucination guardrails',
    metrics: { Groundedness: '99.4%', Citations: 5, Temperature: 0.0 }
  }
];

export const DEFAULT_PIPELINE_METRICS: PipelineMetrics = {
  totalLatencyMs: 124,
  overallConfidence: 0.987,
  retrievedDocsCount: 5,
  indexedChunksCount: 14280,
  vectorSimilarityThreshold: 0.82,
  tokensProcessed: 1420
};

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
