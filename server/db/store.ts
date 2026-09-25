import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  collegeName: string;
  role: 'admin' | 'institution_admin' | 'faculty';
  createdAt: string;
}

export interface CriterionDoc {
  id: string;
  type: 'aicte' | 'ugc';
  code: string;
  category: string;
  title: string;
  description: string;
  benchmarkRule: string;
  thresholdValue?: number | string | boolean;
  unit?: string;
  isMandatory: boolean;
  statutoryReference: string;
  improvementTip: string;
}

export interface AssessmentDoc {
  id: string;
  userId: string;
  institutionName: string;
  moduleType: 'aicte' | 'ugc';
  timestamp: string;
  overallStatus: 'Satisfied' | 'Action Required' | 'Substantial Compliance';
  overallMessage: string;
  complianceScore: number;
  totalCriteria: number;
  satisfiedCount: number;
  gapCount: number;
  formData: any;
  criteriaResults: Array<{
    code: string;
    category: string;
    title: string;
    submittedValue: any;
    submittedValueFormatted: string;
    requiredCondition: string;
    status: 'Criteria Satisfied' | 'Criteria Not Satisfied';
    identifiedGap?: string;
    recommendation?: string;
    isMandatory: boolean;
  }>;
  recommendations: Array<{
    category: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    actionItems: string[];
    timeline: string;
  }>;
  aiExecutiveSummary?: string;
}

interface DatabaseSchema {
  users: UserDoc[];
  criteria_aicte: CriterionDoc[];
  criteria_ugc: CriterionDoc[];
  assessments: AssessmentDoc[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Initial seeded criteria based on official AICTE Approval Process Handbook (APH) and UGC Regulations
const DEFAULT_AICTE_CRITERIA: CriterionDoc[] = [
  {
    id: 'aicte_land',
    type: 'aicte',
    code: 'AICTE_LAND_AREA',
    category: 'Land & Infrastructure',
    title: 'Minimum Campus Land Area',
    description: 'Minimum contiguous campus land requirement as per AICTE Approval Process Handbook (min 2.5 acres in Rural, 1.5 acres in Other/Urban, 1.0 acre in Mega/Metro cities).',
    benchmarkRule: '>= 1.5 Acres (Urban/Other) or >= 2.5 Acres (Rural)',
    thresholdValue: 1.5,
    unit: 'Acres',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 4.1 - Land Norms',
    improvementTip: 'Acquire contiguous registered land or long-term registered lease (minimum 30 years) to meet territorial statutory norms.'
  },
  {
    id: 'aicte_builtup',
    type: 'aicte',
    code: 'AICTE_BUILTUP_AREA',
    category: 'Land & Infrastructure',
    title: 'Total Built-up Instructional Area',
    description: 'Adequate permanent built-up area for instructional, administrative, and amenities purposes (minimum 4,000 sq.m for initial intake of 180-240 students).',
    benchmarkRule: '>= 4000 sq.m total built-up area',
    thresholdValue: 4000,
    unit: 'sq.m',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 4.2 - Built-up Area Requirements',
    improvementTip: 'Complete planned civil constructions and obtain occupation/completion certificate from local municipal/Panchayat authority.'
  },
  {
    id: 'aicte_classrooms',
    type: 'aicte',
    code: 'AICTE_CLASSROOMS',
    category: 'Instructional Facilities',
    title: 'Adequacy of Classrooms & Smart Boards',
    description: 'Minimum number of furnished instructional classrooms (at least 1 classroom per division of 60 intake + ICT projection enabled).',
    benchmarkRule: '>= 4 Classrooms with ICT/smart facilities for standard intake',
    thresholdValue: 4,
    unit: 'Rooms',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 4.3 - Instructional Area Norms',
    improvementTip: 'Designate and furnish additional instructional classrooms equipped with digital audio-visual projectors and smart boards.'
  },
  {
    id: 'aicte_laboratories',
    type: 'aicte',
    code: 'AICTE_LABORATORIES',
    category: 'Instructional Facilities',
    title: 'Specialized Domain Laboratories & Workshops',
    description: 'Fully equipped domain-specific practical laboratories and workshop facilities as per curriculum curriculum syllabus.',
    benchmarkRule: '>= 6 Laboratories equipped with approved equipment lists',
    thresholdValue: 6,
    unit: 'Labs',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 4.4 - Laboratory Equipment & Facilities',
    improvementTip: 'Procure missing experimental setups, test benches, and calibrate laboratory equipment in line with affiliating university syllabus.'
  },
  {
    id: 'aicte_fsr',
    type: 'aicte',
    code: 'AICTE_FSR',
    category: 'Faculty & Academic Cadre',
    title: 'Faculty to Student Ratio (FSR)',
    description: 'Faculty-to-student ratio prescribed by AICTE (1:15 or 1:20 maximum for Under Graduate Engineering & Technology).',
    benchmarkRule: '<= 20 (Target 1:15 or 1:20)',
    thresholdValue: 20,
    unit: 'Ratio (Students per Faculty)',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 7 - Norms for Faculty Requirements',
    improvementTip: 'Recruit qualified regular full-time faculty through open advertisement and selection committee to bring FSR within 1:15 or 1:20.'
  },
  {
    id: 'aicte_cadre_phd',
    type: 'aicte',
    code: 'AICTE_CADRE_PHD',
    category: 'Faculty & Academic Cadre',
    title: 'Cadre Ratio & Ph.D. Qualified Faculty',
    description: 'Cadre ratio of Professor : Associate Professor : Assistant Professor (1:2:6) and minimum 20% faculty possessing Ph.D. degrees.',
    benchmarkRule: '>= 20% of teaching faculty holding doctoral (Ph.D.) degree',
    thresholdValue: 20,
    unit: '%',
    isMandatory: true,
    statutoryReference: 'AICTE Faculty Regulations & Cadre Norms',
    improvementTip: 'Recruit senior faculty at Associate Professor and Professor levels holding Ph.D. degrees, and sponsor existing faculty for doctoral studies.'
  },
  {
    id: 'aicte_principal',
    type: 'aicte',
    code: 'AICTE_PRINCIPAL_QUALIFIED',
    category: 'Faculty & Academic Cadre',
    title: 'Qualified Full-Time Principal / Director',
    description: 'Regular full-time Principal/Director appointed through University selection committee possessing Ph.D. with minimum 15 years experience.',
    benchmarkRule: 'Appointed and possessing Ph.D. in relevant discipline',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 8 - Qualifications for Principal',
    improvementTip: 'Initiate formal University-approved selection process to appoint a regular Ph.D. qualified Director/Principal.'
  },
  {
    id: 'aicte_library_volumes',
    type: 'aicte',
    code: 'AICTE_LIBRARY_VOLUMES',
    category: 'Library & Information Resources',
    title: 'Library Book Volumes & Titles',
    description: 'Minimum core text and reference volumes in Central Library (min 3,000 volumes with at least 500 distinct titles for new college).',
    benchmarkRule: '>= 3000 Volumes and >= 500 Titles',
    thresholdValue: 3000,
    unit: 'Volumes',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 5 - Library Norms',
    improvementTip: 'Augment the Central Library accession with standard textbooks, national/international references across all offered engineering branches.'
  },
  {
    id: 'aicte_library_journals',
    type: 'aicte',
    code: 'AICTE_LIBRARY_JOURNALS',
    category: 'Library & Information Resources',
    title: 'National/International & E-Journals Subscriptions',
    description: 'Subscription to mandatory online/print e-journals packages (e.g. IEEE, ASME, ASCE, DELNET) and digital library access.',
    benchmarkRule: 'Active subscriptions to recognized e-journals & DELNET membership',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 5 - Mandatory E-Journal Subscriptions',
    improvementTip: 'Subscribe to mandatory international digital library packages (e.g., DELNET, IEEE Xplore, ScienceDirect) for student/faculty research.'
  },
  {
    id: 'aicte_computers',
    type: 'aicte',
    code: 'AICTE_COMPUTERS_RATIO',
    category: 'Computing & Digital Infrastructure',
    title: 'Student-to-Computer Ratio',
    description: 'Adequate computing terminals connected via LAN for instructional laboratories (minimum 1 computer for every 4 or 5 students).',
    benchmarkRule: '<= 5 (At least 1 computer per 4-5 students, min 60 computers)',
    thresholdValue: 5,
    unit: 'Ratio',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 5 - Computer Infrastructure',
    improvementTip: 'Procure modern computing terminals with dual-core/quad-core processors and connect all machines over gigabit local area network.'
  },
  {
    id: 'aicte_internet',
    type: 'aicte',
    code: 'AICTE_INTERNET_BANDWIDTH',
    category: 'Computing & Digital Infrastructure',
    title: 'Dedicated Leased Line Internet Bandwidth',
    description: 'High-speed dedicated leased line internet connectivity with continuous unshared bandwidth (minimum 100 Mbps).',
    benchmarkRule: '>= 100 Mbps dedicated optical fiber leased line',
    thresholdValue: 100,
    unit: 'Mbps',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 5 - Internet Bandwidth Norms',
    improvementTip: 'Upgrade institutional leased line bandwidth to at least 100-300 Mbps with redundant backup service provider.'
  },
  {
    id: 'aicte_fire_safety',
    type: 'aicte',
    code: 'AICTE_FIRE_SAFETY',
    category: 'Statutory Safety & Approvals',
    title: 'Fire Safety Certificate / NOC',
    description: 'Valid Fire Safety NOC / Certificate issued by the competent State Fire Services Authority for all campus buildings.',
    benchmarkRule: 'Valid and current Fire Safety Certificate issued by State Fire Dept',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'AICTE APH Chapter II - Essential Documents & Safety Norms',
    improvementTip: 'Apply for inspection and renewal from State Fire Service Department, installing requisite hydrants, smoke detectors, and extinguishers.'
  },
  {
    id: 'aicte_barrier_free',
    type: 'aicte',
    code: 'AICTE_BARRIER_FREE',
    category: 'Statutory Safety & Approvals',
    title: 'Barrier-Free Environment (Divyangjan Facilities)',
    description: 'Facilities for differently-abled persons including continuous ramps with handrails, lifts, and dedicated Divyangjan-friendly washrooms.',
    benchmarkRule: 'Ramps, accessible toilets, and elevator/lift present across buildings',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'AICTE APH Appendix 4 - Barrier-Free Environment Mandate',
    improvementTip: 'Construct graded ramps at building entrances, modify ground-floor restrooms with grab bars, and ensure elevator access for multi-floor blocks.'
  },
  {
    id: 'aicte_mandatory_committees',
    type: 'aicte',
    code: 'AICTE_MANDATORY_COMMITTEES',
    category: 'Governance & Committees',
    title: 'Statutory Committees (Anti-Ragging, ICC/POSH, Grievance)',
    description: 'Active constitution and display of Anti-Ragging Committee/Squad, Internal Complaints Committee (ICC/POSH), Grievance Redressal Committee (GRC), and SC/ST Cell.',
    benchmarkRule: 'All 4 statutory committees notified with external members and ombudsman',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'AICTE Regulations for Prevention of Ragging & Gender Sensitization',
    improvementTip: 'Formally reconstitute missing statutory committees, appoint external NGO/legal representatives, and display contact details prominently on the college portal.'
  },
  {
    id: 'aicte_corpus_fund',
    type: 'aicte',
    code: 'AICTE_CORPUS_FUND',
    category: 'Financial Sustainability',
    title: 'Fixed Deposit / Corpus Joint Reserve Fund',
    description: 'Fixed Deposit / Reserve Fund pledged in joint name of Society/Trust and Regional AICTE / Directorate (min ₹100 Lakhs for Private Engineering).',
    benchmarkRule: '>= ₹100 Lakhs (₹1 Crore) joint FDR / Endowment Fund',
    thresholdValue: 100,
    unit: 'Lakhs INR',
    isMandatory: true,
    statutoryReference: 'AICTE APH Chapter I & II - Financial Requirements',
    improvementTip: 'Establish required Joint Fixed Deposit Receipt (FDR) in nationalized bank pledged with AICTE Regional Officer.'
  }
];

// Initial seeded criteria based on official UGC Section 2(f) and 12(B) Regulations
const DEFAULT_UGC_CRITERIA: CriterionDoc[] = [
  {
    id: 'ugc_society_reg',
    type: 'ugc',
    code: 'UGC_SOCIETY_REGISTRATION',
    category: 'Institutional Legal Status',
    title: 'Registration under Societies Act or Public Trust',
    description: 'College must be managed by a Society registered under Societies Registration Act 1860, or a valid Public Trust Act, with non-proprietary non-profit character.',
    benchmarkRule: 'Registered Society/Trust with Memorandum of Association & non-profit clause',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'UGC Act 1956 Section 2(f) Guidelines Clause 2(i)',
    improvementTip: 'Ensure annual filing of society returns with Registrar of Societies and maintain explicitly non-proprietary audit declarations.'
  },
  {
    id: 'ugc_affiliation_status',
    type: 'ugc',
    code: 'UGC_PERMANENT_AFFILIATION',
    category: 'Affiliation & Standing',
    title: 'University Affiliation Status & Standing',
    description: 'College must be affiliated to a recognized State or Central University. For 12(B) central grants, permanent affiliation or minimum 5-10 years of standing is mandatory.',
    benchmarkRule: 'Permanent affiliation OR minimum 5 years standing with continuous affiliation',
    thresholdValue: 5,
    unit: 'Years',
    isMandatory: true,
    statutoryReference: 'UGC (Fitness of Colleges for Grants) Rules under Section 12(B)',
    improvementTip: 'Apply for permanent affiliation from the parent affiliating university if temporary affiliation has run continuously for over 5 academic sessions.'
  },
  {
    id: 'ugc_campus_land',
    type: 'ugc',
    code: 'UGC_CAMPUS_LAND',
    category: 'Campus & Infrastructure',
    title: 'Dedicated Campus Land Ownership',
    description: 'Minimum 5 acres of land in urban area or 10 acres in rural area, registered unconditionally in the name of the college / sponsoring society.',
    benchmarkRule: '>= 5 Acres (Urban) or >= 10 Acres (Rural) unencumbered land',
    thresholdValue: 5,
    unit: 'Acres',
    isMandatory: true,
    statutoryReference: 'UGC Section 2(f)/12(B) Infrastructure Norms Clause 4',
    improvementTip: 'Execute registered gift/conveyance deed transferring title unconditionally to the college trust and submit revenue mutation records.'
  },
  {
    id: 'ugc_permanent_building',
    type: 'ugc',
    code: 'UGC_PERMANENT_BUILDING',
    category: 'Campus & Infrastructure',
    title: 'Permanent Pucca Academic Buildings',
    description: 'Adequate permanent building including principal chamber, staff rooms, separate common rooms for women students, lecture theatres, and laboratories.',
    benchmarkRule: 'Owned permanent building with adequate instructional & administrative spaces',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'UGC Regulations on Minimum Physical Facilities',
    improvementTip: 'Ensure college operates out of its own permanent campus building rather than temporary or rented accommodation.'
  },
  {
    id: 'ugc_faculty_norms',
    type: 'ugc',
    code: 'UGC_FACULTY_QUALIFIED',
    category: 'Teaching Staff & Qualifications',
    title: 'UGC Norms Qualified Teachers (NET/SET/Ph.D.)',
    description: 'Minimum 80% of regular teaching staff must possess UGC prescribed qualifications (NET / SET / SLET or Ph.D. degree).',
    benchmarkRule: '>= 80% teaching faculty having NET/SET or Ph.D.',
    thresholdValue: 80,
    unit: '%',
    isMandatory: true,
    statutoryReference: 'UGC Minimum Qualifications for Appointment of Teachers Regulations',
    improvementTip: 'Recruit NET/SET and Ph.D. qualified assistant professors and avoid keeping teaching posts on temporary/ad-hoc appointments without statutory qualification.'
  },
  {
    id: 'ugc_faculty_pay_scale',
    type: 'ugc',
    code: 'UGC_FACULTY_PAY_SCALE',
    category: 'Teaching Staff & Qualifications',
    title: 'Implementation of UGC / State Pay Scales',
    description: 'Payment of full UGC Pay Scales (7th CPC) with DA and allowances through direct bank transfer into faculty savings accounts.',
    benchmarkRule: 'Payment of UGC / State Govt approved scales through bank accounts',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'UGC Regulations on Pay Scales and Service Conditions',
    improvementTip: 'Implement official UGC/State Pay Scales and disburse salaries via ECS/RTGS with bank certification proofs.'
  },
  {
    id: 'ugc_permanent_staff_ratio',
    type: 'ugc',
    code: 'UGC_PERMANENT_STAFF_RATIO',
    category: 'Teaching Staff & Qualifications',
    title: 'Permanent Faculty against Sanctioned Strength',
    description: 'At least 75% of sanctioned teaching positions filled on regular permanent basis through statutory university selection committees.',
    benchmarkRule: '>= 75% permanent regular teachers against sanctioned posts',
    thresholdValue: 75,
    unit: '%',
    isMandatory: true,
    statutoryReference: 'UGC Section 2(f)/12(B) Staffing Norms',
    improvementTip: 'Obtain university roster clearance and issue public recruitment notification to regularize ad-hoc teaching positions.'
  },
  {
    id: 'ugc_teacher_student_ratio',
    type: 'ugc',
    code: 'UGC_TEACHER_STUDENT_RATIO',
    category: 'Teaching Staff & Qualifications',
    title: 'Teacher to Student Ratio',
    description: 'Overall student to teacher ratio across Arts, Science, and Commerce departments (minimum 1:20 or better).',
    benchmarkRule: '<= 20 (At least 1 teacher per 20 students)',
    thresholdValue: 20,
    unit: 'Ratio',
    isMandatory: true,
    statutoryReference: 'UGC Guidelines on Academic Sanctioned Strength',
    improvementTip: 'Sanction and recruit additional teaching faculty to balance the increased student intake.'
  },
  {
    id: 'ugc_epf_benefits',
    type: 'ugc',
    code: 'UGC_EPF_SOCIAL_SECURITY',
    category: 'Staff Welfare & Social Security',
    title: 'Employees Provident Fund (EPF) Scheme',
    description: 'Coverage of all teaching and non-teaching employees under Employees Provident Fund (EPF) & Miscellaneous Provisions Act 1952.',
    benchmarkRule: 'Registered EPF Code and regular monthly contribution deposits',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'UGC Section 12(B) Grants Fitness Criteria Clause 3(iv)',
    improvementTip: 'Register college under EPFO and ensure monthly challans are deposited for all eligible academic and non-teaching personnel.'
  },
  {
    id: 'ugc_library_books',
    type: 'ugc',
    code: 'UGC_LIBRARY_BOOKS',
    category: 'Library & Learning Resources',
    title: 'Adequacy of Library Volumes & Reading Room',
    description: 'Central library holding minimum 5,000 standard academic books/titles, digital subscription to INFLIBNET N-LIST, and seating for 20% students.',
    benchmarkRule: '>= 5000 Academic Books and active INFLIBNET N-LIST membership',
    thresholdValue: 5000,
    unit: 'Books',
    isMandatory: true,
    statutoryReference: 'UGC Library Standards for Degree Colleges',
    improvementTip: 'Purchase latest editions of university prescribed textbooks and renew institutional INFLIBNET N-LIST annual membership.'
  },
  {
    id: 'ugc_academic_performance',
    type: 'ugc',
    code: 'UGC_ACADEMIC_PASS_PERCENTAGE',
    category: 'Academic Performance & Quality',
    title: 'University Final Year Examination Pass Percentage',
    description: 'Sustained institutional academic performance with overall final year graduation pass rate of at least 65% in university examinations.',
    benchmarkRule: '>= 65% Average Pass Rate in University examinations',
    thresholdValue: 65,
    unit: '%',
    isMandatory: false,
    statutoryReference: 'UGC Quality Mandate & Institutional Assessment Criteria',
    improvementTip: 'Implement remedial coaching for slow learners, conduct continuous internal assessments, and mentor students to elevate pass rates.'
  },
  {
    id: 'ugc_naac_accreditation',
    type: 'ugc',
    code: 'UGC_NAAC_ACCREDITATION',
    category: 'Academic Performance & Quality',
    title: 'NAAC Accreditation Status (Mandatory for 12-B)',
    description: 'Accreditation by National Assessment and Accreditation Council (NAAC) with valid grade or Institutional Information for Quality Assessment (IIQA) submitted.',
    benchmarkRule: 'Accredited by NAAC (or valid IIQA submitted for assessment)',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'UGC Mandatory Assessment of Higher Educational Institutions Regulations',
    improvementTip: 'Submit IIQA (Institutional Information for Quality Assessment) to NAAC and prepare Self Study Report (SSR) through IQAC.'
  },
  {
    id: 'ugc_reserve_fund',
    type: 'ugc',
    code: 'UGC_RESERVE_FUND',
    category: 'Financial Viability',
    title: 'Reserve / Endowment Fund in Joint Account',
    description: 'Maintenance of Reserve Fund (minimum ₹15 to ₹25 Lakhs) in joint fixed deposit with the Affiliating University / Directorate of Higher Education.',
    benchmarkRule: '>= ₹20 Lakhs in joint fixed deposit with University/Directorate',
    thresholdValue: 20,
    unit: 'Lakhs INR',
    isMandatory: true,
    statutoryReference: 'UGC Section 2(f)/12(B) Financial Soundness Mandate',
    improvementTip: 'Deposit required reserve amount in joint fixed deposit with University Registrar / State Higher Education Director.'
  },
  {
    id: 'ugc_mandatory_cells',
    type: 'ugc',
    code: 'UGC_MANDATORY_CELLS',
    category: 'Governance & Equity',
    title: 'IQAC, Anti-Ragging, and Equal Opportunity Cell',
    description: 'Functional Internal Quality Assurance Cell (IQAC), Anti-Ragging Cell, Equal Opportunity Cell for SC/ST/OBC, and Student Grievance Redressal Committee.',
    benchmarkRule: 'All statutory UGC cells notified with regular meeting minutes uploaded',
    thresholdValue: true,
    unit: 'Boolean',
    isMandatory: true,
    statutoryReference: 'UGC Guidelines on Student Entitlements & Equity',
    improvementTip: 'Activate the Internal Quality Assurance Cell (IQAC) and convene quarterly meetings with documented Action Taken Reports (ATRs).'
  }
];

class JsonDatabase {
  private data: DatabaseSchema = {
    users: [],
    criteria_aicte: [],
    criteria_ugc: [],
    assessments: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, reinitializing default data:', err);
        this.seedDefaults();
      }
    } else {
      this.seedDefaults();
    }

    // Ensure criteria collections are populated
    if (!this.data.criteria_aicte || this.data.criteria_aicte.length === 0) {
      this.data.criteria_aicte = DEFAULT_AICTE_CRITERIA;
      this.save();
    }
    if (!this.data.criteria_ugc || this.data.criteria_ugc.length === 0) {
      this.data.criteria_ugc = DEFAULT_UGC_CRITERIA;
      this.save();
    }

    // Ensure demo admin user has a verified working bcrypt hash for password123
    const demoUser = this.data.users.find(u => u.email.toLowerCase() === 'admin@institution.edu.in');
    const validHash = bcrypt.hashSync('password123', 10);
    if (!demoUser) {
      this.data.users.push({
        id: 'user_demo_01',
        name: 'Dr. Radhakrishnan Registrar',
        email: 'admin@institution.edu.in',
        passwordHash: validHash,
        collegeName: 'National Institute of Science & Technology',
        role: 'institution_admin',
        createdAt: new Date().toISOString(),
      });
      this.save();
    } else {
      demoUser.passwordHash = validHash;
      this.save();
    }
  }

  private seedDefaults() {
    // Seed default admin user: email: admin@institution.edu.in, password: password123
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    this.data = {
      users: [
        {
          id: 'user_demo_01',
          name: 'Dr. Radhakrishnan Registrar',
          email: 'admin@institution.edu.in',
          passwordHash: defaultPasswordHash,
          collegeName: 'National Institute of Science & Technology',
          role: 'institution_admin',
          createdAt: new Date().toISOString(),
        },
      ],
      criteria_aicte: DEFAULT_AICTE_CRITERIA,
      criteria_ugc: DEFAULT_UGC_CRITERIA,
      assessments: [],
    };
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users collection
  public users = {
    find: (): UserDoc[] => [...this.data.users],
    findOne: (predicate: (u: UserDoc) => boolean): UserDoc | undefined => this.data.users.find(predicate),
    findById: (id: string): UserDoc | undefined => this.data.users.find(u => u.id === id),
    findByEmail: (email: string): UserDoc | undefined => this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
    create: (user: Omit<UserDoc, 'id' | 'createdAt'>): UserDoc => {
      const newUser: UserDoc = {
        ...user,
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(newUser);
      this.save();
      return newUser;
    },
  };

  // Criteria collection
  public criteria = {
    getByType: (type: 'aicte' | 'ugc'): CriterionDoc[] => {
      return type === 'aicte' ? [...this.data.criteria_aicte] : [...this.data.criteria_ugc];
    },
    update: (type: 'aicte' | 'ugc', id: string, updates: Partial<CriterionDoc>): CriterionDoc | null => {
      const list = type === 'aicte' ? this.data.criteria_aicte : this.data.criteria_ugc;
      const index = list.findIndex(c => c.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...updates };
      this.save();
      return list[index];
    },
    resetDefaults: (type: 'aicte' | 'ugc') => {
      if (type === 'aicte') {
        this.data.criteria_aicte = [...DEFAULT_AICTE_CRITERIA];
      } else {
        this.data.criteria_ugc = [...DEFAULT_UGC_CRITERIA];
      }
      this.save();
    },
  };

  // Assessments collection
  public assessments = {
    find: (filter?: { userId?: string }): AssessmentDoc[] => {
      if (filter?.userId) {
        return this.data.assessments.filter(a => a.userId === filter.userId);
      }
      return [...this.data.assessments];
    },
    findById: (id: string): AssessmentDoc | undefined => {
      return this.data.assessments.find(a => a.id === id);
    },
    create: (assessmentData: Omit<AssessmentDoc, 'id' | 'timestamp'>): AssessmentDoc => {
      const newAssessment: AssessmentDoc = {
        ...assessmentData,
        id: 'asm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        timestamp: new Date().toISOString(),
      };
      this.data.assessments.unshift(newAssessment);
      this.save();
      return newAssessment;
    },
    delete: (id: string, userId?: string): boolean => {
      const initialLength = this.data.assessments.length;
      this.data.assessments = this.data.assessments.filter(a => {
        if (a.id !== id) return true;
        if (userId && a.userId !== userId) return true;
        return false;
      });
      const changed = this.data.assessments.length !== initialLength;
      if (changed) this.save();
      return changed;
    },
  };
}

export const db = new JsonDatabase();
