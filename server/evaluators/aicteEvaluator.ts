import { CriterionDoc } from '../db/store.js';

export interface AicteSubmissionData {
  collegeName: string;
  institutionType: string; // Engineering, Management, Pharmacy, Polytechnic, MCA, Architecture
  address: string;
  state: string;
  district: string;
  managementType: string; // Govt, Govt-Aided, Private-Unaided, Trust/Society
  establishmentYear: number;
  affiliatedUniversity: string;
  affiliationType: string; // Permanent, Provisional / Temporary, Autonomous
  proposedProgramme: string; // e.g. B.Tech Computer Science & Engineering
  programmeLevel: string; // UG, PG, Diploma
  proposedIntake: number; // e.g. 180, 240, 360
  existingIntake?: number;
  totalEnrolledStudents: number;

  // Land & Buildings
  landAreaAcres: number;
  locationCategory: 'Rural' | 'Urban' | 'Mega/Metro';
  builtUpAreaSqm: number;
  landOwnershipType: 'Owned' | 'Registered Lease (30+ yrs)' | 'Rented';
  buildingPlanApproved: boolean;

  // Classrooms & Instructional
  classroomsCount: number;
  smartClassroomsCount: number;
  laboratoriesCount: number;
  workshopBaysCount: number;
  seminarHallsCount: number;

  // Faculty & Academic
  totalFacultyCount: number;
  professorsCount: number;
  associateProfessorsCount: number;
  assistantProfessorsCount: number;
  phdFacultyCount: number;
  principalHasPhd: boolean;
  principalExperienceYears: number;
  nonTeachingStaffCount: number;

  // Library
  libraryBookTitles: number;
  libraryBookVolumes: number;
  nationalJournalsCount: number;
  internationalEJournalsSubscribed: boolean;
  delnetMembership: boolean;
  readingRoomSeats: number;

  // Computing & Digital
  studentComputersCount: number;
  internetBandwidthMbps: number;
  licensedSoftwareCount: number;
  campusWifiEnabled: boolean;

  // Safety & Statutory
  fireSafetyNocValid: boolean;
  barrierFreeFacilities: boolean; // Ramps, lifts, divyangjan washrooms
  antiRaggingCommittee: boolean;
  internalComplaintsCommittee: boolean; // POSH
  grievanceRedressalCommittee: boolean;
  scStCommittee: boolean;

  // Financial
  corpusFundLakhs: number;
  annualBudgetLakhs: number;
  auditedFinancialsAvailable: boolean;
}

export interface CriterionEvaluationResult {
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
}

export function evaluateAicteSubmission(data: AicteSubmissionData, criteriaList: CriterionDoc[]): {
  criteriaResults: CriterionEvaluationResult[];
  overallStatus: 'Satisfied' | 'Action Required' | 'Substantial Compliance';
  overallMessage: string;
  complianceScore: number;
  totalCriteria: number;
  satisfiedCount: number;
  gapCount: number;
} {
  const criteriaResults: CriterionEvaluationResult[] = [];

  // Helper to find criterion doc
  const getCrit = (code: string) => criteriaList.find(c => c.code === code);

  // 1. Campus Land Area
  const landCrit = getCrit('AICTE_LAND_AREA');
  const minLandRequired = data.locationCategory === 'Rural' ? 2.5 : data.locationCategory === 'Mega/Metro' ? 1.0 : 1.5;
  const landSatisfied = Number(data.landAreaAcres) >= minLandRequired && data.landOwnershipType !== 'Rented';
  criteriaResults.push({
    code: 'AICTE_LAND_AREA',
    category: landCrit?.category || 'Land & Infrastructure',
    title: landCrit?.title || 'Minimum Campus Land Area',
    submittedValue: data.landAreaAcres,
    submittedValueFormatted: `${data.landAreaAcres} Acres (${data.locationCategory}, Title: ${data.landOwnershipType})`,
    requiredCondition: `>= ${minLandRequired} Acres (Contiguous registered title / 30-year lease for ${data.locationCategory})`,
    status: landSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: landSatisfied
      ? undefined
      : data.landOwnershipType === 'Rented'
        ? 'Campus land is on temporary rental basis; AICTE requires clear unencumbered ownership or minimum 30-year registered lease.'
        : `Available land (${data.landAreaAcres} acres) is below the statutory requirement of ${minLandRequired} acres for ${data.locationCategory} location (Deficit: ${(minLandRequired - data.landAreaAcres).toFixed(2)} acres).`,
    recommendation: landCrit?.improvementTip,
    isMandatory: true,
  });

  // 2. Built-up Instructional Area
  const builtUpCrit = getCrit('AICTE_BUILTUP_AREA');
  // AICTE benchmark: approx 4000 sqm for base UG intake (180-240) plus 10 sqm per additional student
  const effectiveIntake = Math.max(data.totalEnrolledStudents || 0, data.proposedIntake || 180);
  const minBuiltUpRequired = effectiveIntake > 240 ? 4000 + (effectiveIntake - 240) * 8 : 4000;
  const builtUpSatisfied = Number(data.builtUpAreaSqm) >= minBuiltUpRequired && data.buildingPlanApproved;
  criteriaResults.push({
    code: 'AICTE_BUILTUP_AREA',
    category: builtUpCrit?.category || 'Land & Infrastructure',
    title: builtUpCrit?.title || 'Total Built-up Instructional Area',
    submittedValue: data.builtUpAreaSqm,
    submittedValueFormatted: `${data.builtUpAreaSqm} sq.m (Plan Approved: ${data.buildingPlanApproved ? 'Yes' : 'No'})`,
    requiredCondition: `>= ${minBuiltUpRequired} sq.m with approved sanction plan from competent authority`,
    status: builtUpSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: builtUpSatisfied
      ? undefined
      : !data.buildingPlanApproved
        ? 'Building plan approval by town planning / local municipal body is missing.'
        : `Built-up area (${data.builtUpAreaSqm} sq.m) is lower than the required ${minBuiltUpRequired} sq.m for total student intake (Deficit: ${minBuiltUpRequired - data.builtUpAreaSqm} sq.m).`,
    recommendation: builtUpCrit?.improvementTip,
    isMandatory: true,
  });

  // 3. Classrooms
  const classCrit = getCrit('AICTE_CLASSROOMS');
  const requiredClassrooms = Math.max(4, Math.ceil((data.proposedIntake || 180) / 60));
  const classSatisfied = Number(data.classroomsCount) >= requiredClassrooms && Number(data.smartClassroomsCount) >= 1;
  criteriaResults.push({
    code: 'AICTE_CLASSROOMS',
    category: classCrit?.category || 'Instructional Facilities',
    title: classCrit?.title || 'Adequacy of Classrooms & Smart Boards',
    submittedValue: data.classroomsCount,
    submittedValueFormatted: `${data.classroomsCount} Classrooms (${data.smartClassroomsCount} Smart/ICT enabled)`,
    requiredCondition: `>= ${requiredClassrooms} Classrooms (with minimum 1 Smart ICT room)`,
    status: classSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: classSatisfied
      ? undefined
      : data.smartClassroomsCount < 1
        ? 'No Smart ICT-enabled classrooms reported; at least 1 digital projection classroom is mandatory.'
        : `Classroom count (${data.classroomsCount}) falls short of ${requiredClassrooms} divisions based on proposed intake of ${data.proposedIntake}.`,
    recommendation: classCrit?.improvementTip,
    isMandatory: true,
  });

  // 4. Laboratories & Workshops
  const labCrit = getCrit('AICTE_LABORATORIES');
  const minLabsRequired = data.institutionType === 'Polytechnic' ? 5 : 6;
  const labSatisfied = Number(data.laboratoriesCount) >= minLabsRequired && Number(data.workshopBaysCount) >= 1;
  criteriaResults.push({
    code: 'AICTE_LABORATORIES',
    category: labCrit?.category || 'Instructional Facilities',
    title: labCrit?.title || 'Specialized Domain Laboratories & Workshops',
    submittedValue: data.laboratoriesCount,
    submittedValueFormatted: `${data.laboratoriesCount} Labs, ${data.workshopBaysCount} Workshop bays`,
    requiredCondition: `>= ${minLabsRequired} Specialized Labs and >= 1 Central Workshop`,
    status: labSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: labSatisfied
      ? undefined
      : Number(data.workshopBaysCount) < 1
        ? 'Central Workshop bays missing or not reported.'
        : `Laboratory count (${data.laboratoriesCount}) is below the minimum norm of ${minLabsRequired} domain labs for ${data.proposedProgramme}.`,
    recommendation: labCrit?.improvementTip,
    isMandatory: true,
  });

  // 5. Faculty-to-Student Ratio (FSR)
  const fsrCrit = getCrit('AICTE_FSR');
  const totalStudents = Math.max(data.totalEnrolledStudents || 0, data.proposedIntake || 180);
  const totalFaculty = Number(data.totalFacultyCount) || 0;
  const actualRatio = totalFaculty > 0 ? (totalStudents / totalFaculty).toFixed(1) : '999';
  const targetRatioLimit = data.programmeLevel === 'PG' ? 15 : 20; // 1:15 for PG/Tier 1, 1:20 for standard UG
  const minFacultyRequired = Math.ceil(totalStudents / targetRatioLimit);
  const fsrSatisfied = totalFaculty > 0 && Number(actualRatio) <= targetRatioLimit;
  criteriaResults.push({
    code: 'AICTE_FSR',
    category: fsrCrit?.category || 'Faculty & Academic Cadre',
    title: fsrCrit?.title || 'Faculty to Student Ratio (FSR)',
    submittedValue: totalFaculty,
    submittedValueFormatted: `1 : ${actualRatio} (${totalFaculty} faculty for ${totalStudents} students)`,
    requiredCondition: `Maximum 1 : ${targetRatioLimit} (At least ${minFacultyRequired} regular faculty members required)`,
    status: fsrSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: fsrSatisfied
      ? undefined
      : `Current ratio 1:${actualRatio} exceeds the statutory ceiling of 1:${targetRatioLimit}. Deficit of ${Math.max(0, minFacultyRequired - totalFaculty)} faculty members.`,
    recommendation: fsrCrit?.improvementTip,
    isMandatory: true,
  });

  // 6. Cadre Ratio & Ph.D. Faculty
  const phdCrit = getCrit('AICTE_CADRE_PHD');
  const phdCount = Number(data.phdFacultyCount) || 0;
  const phdPercentage = totalFaculty > 0 ? Math.round((phdCount / totalFaculty) * 100) : 0;
  const phdSatisfied = phdPercentage >= 20 && (Number(data.professorsCount) + Number(data.associateProfessorsCount)) > 0;
  criteriaResults.push({
    code: 'AICTE_CADRE_PHD',
    category: phdCrit?.category || 'Faculty & Academic Cadre',
    title: phdCrit?.title || 'Cadre Ratio & Ph.D. Qualified Faculty',
    submittedValue: phdPercentage,
    submittedValueFormatted: `${phdPercentage}% (${phdCount} Ph.D. holders; Prof: ${data.professorsCount}, Assoc: ${data.associateProfessorsCount}, Asst: ${data.assistantProfessorsCount})`,
    requiredCondition: '>= 20% faculty with Ph.D. and balanced Cadre ratio (1:2:6)',
    status: phdSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: phdSatisfied
      ? undefined
      : phdPercentage < 20
        ? `Doctoral faculty percentage (${phdPercentage}%) is below the mandatory 20% threshold (Deficit: ${Math.ceil(totalFaculty * 0.2) - phdCount} Ph.D. faculty).`
        : 'Senior cadre imbalance: Lack of regular Professors and Associate Professors.',
    recommendation: phdCrit?.improvementTip,
    isMandatory: true,
  });

  // 7. Qualified Principal / Director
  const principalCrit = getCrit('AICTE_PRINCIPAL_QUALIFIED');
  const principalSatisfied = Boolean(data.principalHasPhd) && Number(data.principalExperienceYears) >= 15;
  criteriaResults.push({
    code: 'AICTE_PRINCIPAL_QUALIFIED',
    category: principalCrit?.category || 'Faculty & Academic Cadre',
    title: principalCrit?.title || 'Qualified Full-Time Principal / Director',
    submittedValue: data.principalHasPhd,
    submittedValueFormatted: `Ph.D. Qualified: ${data.principalHasPhd ? 'Yes' : 'No'}, Experience: ${data.principalExperienceYears || 0} Years`,
    requiredCondition: 'Full-time regular Principal with Ph.D. and minimum 15 years teaching/research experience',
    status: principalSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: principalSatisfied
      ? undefined
      : !data.principalHasPhd
        ? 'Appointed Principal does not hold a Ph.D. degree in a relevant branch as required by AICTE.'
        : `Principal experience (${data.principalExperienceYears} yrs) is under the 15-year statutory requirement.`,
    recommendation: principalCrit?.improvementTip,
    isMandatory: true,
  });

  // 8. Library Volumes & Titles
  const libCrit = getCrit('AICTE_LIBRARY_VOLUMES');
  const minVolumes = 3000;
  const minTitles = 500;
  const libSatisfied = Number(data.libraryBookVolumes) >= minVolumes && Number(data.libraryBookTitles) >= minTitles;
  criteriaResults.push({
    code: 'AICTE_LIBRARY_VOLUMES',
    category: libCrit?.category || 'Library & Information Resources',
    title: libCrit?.title || 'Library Book Volumes & Titles',
    submittedValue: data.libraryBookVolumes,
    submittedValueFormatted: `${data.libraryBookVolumes} Volumes across ${data.libraryBookTitles} Titles (Seats: ${data.readingRoomSeats || 0})`,
    requiredCondition: `>= ${minVolumes} Volumes and >= ${minTitles} distinct Titles`,
    status: libSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: libSatisfied
      ? undefined
      : `Library holdings (${data.libraryBookVolumes} volumes, ${data.libraryBookTitles} titles) fall below benchmark of ${minVolumes} volumes / ${minTitles} titles.`,
    recommendation: libCrit?.improvementTip,
    isMandatory: true,
  });

  // 9. Journals & Digital Library
  const journalCrit = getCrit('AICTE_LIBRARY_JOURNALS');
  const journalSatisfied = Boolean(data.internationalEJournalsSubscribed) && (Boolean(data.delnetMembership) || Number(data.nationalJournalsCount) >= 6);
  criteriaResults.push({
    code: 'AICTE_LIBRARY_JOURNALS',
    category: journalCrit?.category || 'Library & Information Resources',
    title: journalCrit?.title || 'National/International & E-Journals Subscriptions',
    submittedValue: data.internationalEJournalsSubscribed,
    submittedValueFormatted: `E-Journals: ${data.internationalEJournalsSubscribed ? 'Subscribed' : 'None'}, DELNET: ${data.delnetMembership ? 'Active' : 'No'}, Print Journals: ${data.nationalJournalsCount || 0}`,
    requiredCondition: 'Mandatory online e-journal consortium package (IEEE/Springer/ASME) & DELNET membership',
    status: journalSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: journalSatisfied
      ? undefined
      : 'E-journal subscriptions (IEEE/ScienceDirect/DELNET) are not activated.',
    recommendation: journalCrit?.improvementTip,
    isMandatory: true,
  });

  // 10. Student-to-Computer Ratio
  const compCrit = getCrit('AICTE_COMPUTERS_RATIO');
  const computers = Number(data.studentComputersCount) || 0;
  const compRatio = computers > 0 ? (totalStudents / computers).toFixed(1) : '999';
  const compSatisfied = computers >= 60 && Number(compRatio) <= 5;
  criteriaResults.push({
    code: 'AICTE_COMPUTERS_RATIO',
    category: compCrit?.category || 'Computing & Digital Infrastructure',
    title: compCrit?.title || 'Student-to-Computer Ratio',
    submittedValue: computers,
    submittedValueFormatted: `1 : ${compRatio} (${computers} PCs for ${totalStudents} students, Legal Software: ${data.licensedSoftwareCount || 0})`,
    requiredCondition: '<= 5 (At least 1 PC per 4-5 students, minimum 60 PCs total)',
    status: compSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: compSatisfied
      ? undefined
      : computers < 60
        ? `Computer inventory (${computers} PCs) is below minimum entry threshold of 60 machines.`
        : `Student to computer ratio 1:${compRatio} exceeds allowed ratio of 1:5.`,
    recommendation: compCrit?.improvementTip,
    isMandatory: true,
  });

  // 11. Internet Bandwidth
  const netCrit = getCrit('AICTE_INTERNET_BANDWIDTH');
  const bandwidth = Number(data.internetBandwidthMbps) || 0;
  const netSatisfied = bandwidth >= 100;
  criteriaResults.push({
    code: 'AICTE_INTERNET_BANDWIDTH',
    category: netCrit?.category || 'Computing & Digital Infrastructure',
    title: netCrit?.title || 'Dedicated Leased Line Internet Bandwidth',
    submittedValue: bandwidth,
    submittedValueFormatted: `${bandwidth} Mbps dedicated leased line (Wi-Fi: ${data.campusWifiEnabled ? 'Yes' : 'No'})`,
    requiredCondition: '>= 100 Mbps dedicated optical fiber line',
    status: netSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: netSatisfied
      ? undefined
      : `Internet bandwidth (${bandwidth} Mbps) is below the 100 Mbps standard mandated by AICTE.`,
    recommendation: netCrit?.improvementTip,
    isMandatory: true,
  });

  // 12. Fire Safety NOC
  const fireCrit = getCrit('AICTE_FIRE_SAFETY');
  const fireSatisfied = Boolean(data.fireSafetyNocValid);
  criteriaResults.push({
    code: 'AICTE_FIRE_SAFETY',
    category: fireCrit?.category || 'Statutory Safety & Approvals',
    title: fireCrit?.title || 'Fire Safety Certificate / NOC',
    submittedValue: data.fireSafetyNocValid,
    submittedValueFormatted: data.fireSafetyNocValid ? 'Valid Certificate on Record' : 'Missing / Expired',
    requiredCondition: 'Valid and current Fire Safety NOC from State Fire Services Department',
    status: fireSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: fireSatisfied
      ? undefined
      : 'Institution does not possess an active, valid Fire Safety Certificate from the State Fire Authority. This is a fatal statutory rejection criterion.',
    recommendation: fireCrit?.improvementTip,
    isMandatory: true,
  });

  // 13. Barrier-Free Environment
  const rampCrit = getCrit('AICTE_BARRIER_FREE');
  const rampSatisfied = Boolean(data.barrierFreeFacilities);
  criteriaResults.push({
    code: 'AICTE_BARRIER_FREE',
    category: rampCrit?.category || 'Statutory Safety & Approvals',
    title: rampCrit?.title || 'Barrier-Free Environment (Divyangjan Facilities)',
    submittedValue: data.barrierFreeFacilities,
    submittedValueFormatted: data.barrierFreeFacilities ? 'Compliant Ramps & Facilities Installed' : 'Non-compliant / Partial',
    requiredCondition: 'Continuous ramps with handrails, accessible toilets, and elevator for Divyangjan',
    status: rampSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: rampSatisfied
      ? undefined
      : 'Ramps, lifts, or designated accessible Divyangjan washrooms are lacking across instructional blocks.',
    recommendation: rampCrit?.improvementTip,
    isMandatory: true,
  });

  // 14. Mandatory Statutory Committees
  const commCrit = getCrit('AICTE_MANDATORY_COMMITTEES');
  const commSatisfied = Boolean(data.antiRaggingCommittee) &&
    Boolean(data.internalComplaintsCommittee) &&
    Boolean(data.grievanceRedressalCommittee) &&
    Boolean(data.scStCommittee);
  const missingComms: string[] = [];
  if (!data.antiRaggingCommittee) missingComms.push('Anti-Ragging Committee/Squad');
  if (!data.internalComplaintsCommittee) missingComms.push('Internal Complaints Committee (POSH/ICC)');
  if (!data.grievanceRedressalCommittee) missingComms.push('Grievance Redressal Committee');
  if (!data.scStCommittee) missingComms.push('SC/ST Committee');

  criteriaResults.push({
    code: 'AICTE_MANDATORY_COMMITTEES',
    category: commCrit?.category || 'Governance & Committees',
    title: commCrit?.title || 'Statutory Committees (Anti-Ragging, ICC/POSH, Grievance)',
    submittedValue: commSatisfied,
    submittedValueFormatted: commSatisfied ? 'All 4 Statutory Committees Active' : `Deficient: ${missingComms.join(', ')} missing`,
    requiredCondition: 'Constitution and publication of Anti-Ragging, ICC, GRC, and SC/ST Committees',
    status: commSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: commSatisfied
      ? undefined
      : `Missing mandatory committees: ${missingComms.join(', ')}. AICTE mandates public notification with ombudsman.`,
    recommendation: commCrit?.improvementTip,
    isMandatory: true,
  });

  // 15. Financial Reserve / Corpus Fund
  const fundCrit = getCrit('AICTE_CORPUS_FUND');
  const corpus = Number(data.corpusFundLakhs) || 0;
  const isGovt = data.managementType === 'Govt' || data.managementType === 'Govt-Aided';
  const minCorpusRequired = isGovt ? 0 : 100;
  const corpusSatisfied = isGovt || (corpus >= minCorpusRequired && Boolean(data.auditedFinancialsAvailable));
  criteriaResults.push({
    code: 'AICTE_CORPUS_FUND',
    category: fundCrit?.category || 'Financial Sustainability',
    title: fundCrit?.title || 'Fixed Deposit / Corpus Joint Reserve Fund',
    submittedValue: corpus,
    submittedValueFormatted: isGovt ? `Government Institution (Exempt, Budget: ₹${data.annualBudgetLakhs || 0}L)` : `₹${corpus} Lakhs (Audited: ${data.auditedFinancialsAvailable ? 'Yes' : 'No'})`,
    requiredCondition: isGovt ? 'Government budgetary allocation' : `>= ₹100 Lakhs Joint Fixed Deposit Receipt (FDR) and Audited Balance Sheets`,
    status: corpusSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: corpusSatisfied
      ? undefined
      : !data.auditedFinancialsAvailable
        ? 'Audited balance sheets for preceding financial years are unavailable.'
        : `Corpus/FDR fund (₹${corpus} Lakhs) is below the statutory requirement of ₹${minCorpusRequired} Lakhs.`,
    recommendation: fundCrit?.improvementTip,
    isMandatory: true,
  });

  // Compute summary stats
  const totalCriteria = criteriaResults.length;
  const satisfiedCount = criteriaResults.filter(c => c.status === 'Criteria Satisfied').length;
  const gapCount = totalCriteria - satisfiedCount;
  const complianceScore = Math.round((satisfiedCount / totalCriteria) * 100);

  let overallStatus: 'Satisfied' | 'Action Required' | 'Substantial Compliance';
  let overallMessage: string;

  if (gapCount === 0) {
    overallStatus = 'Satisfied';
    overallMessage = 'Eligibility Criteria Satisfied Based on the Configured Requirements.';
  } else if (gapCount <= 2 && complianceScore >= 80) {
    overallStatus = 'Substantial Compliance';
    overallMessage = `Assessment Complete: Substantial compliance (${complianceScore}%). ${gapCount} criteria require minor remediation before formal scrutiny.`;
  } else {
    overallStatus = 'Action Required';
    overallMessage = `Assessment Complete: ${satisfiedCount} Criteria Satisfied, ${gapCount} Criteria Require Improvement. Deficiencies must be addressed prior to AICTE application submission.`;
  }

  return {
    criteriaResults,
    overallStatus,
    overallMessage,
    complianceScore,
    totalCriteria,
    satisfiedCount,
    gapCount,
  };
}
