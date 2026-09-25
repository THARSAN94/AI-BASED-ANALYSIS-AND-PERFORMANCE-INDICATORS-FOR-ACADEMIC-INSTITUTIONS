import { CriterionDoc } from '../db/store.js';
import { CriterionEvaluationResult } from './aicteEvaluator.js';

export interface UgcSubmissionData {
  collegeName: string;
  establishmentYear: number;
  collegeType: 'Affiliated' | 'Autonomous' | 'Constituent';
  address: string;
  state: string;
  district: string;
  managementCategory: 'Government' | 'Private Unaided' | 'Trust / Society' | 'Minority Institution';
  sponsoringSocietyName: string;
  isRegisteredSocietyOrTrust: boolean;
  societyRegistrationAct: string; // e.g. Societies Registration Act XXI of 1860
  memorandumHasNonProfitClause: boolean;

  affiliatedUniversity: string;
  affiliationType: 'Permanent' | 'Temporary / Provisional';
  affiliationStandingYears: number;
  hasUniversityNocFor2f12b: boolean;

  ugProgrammesCount: number;
  pgProgrammesCount: number;
  departmentsCount: number;
  totalStudentStrength: number;

  finalYearPassPercentage: number;
  universityRanksCount: number;
  naacAccredited: boolean;
  naacGrade?: string; // e.g. A++, A+, A, B++, B+, B
  naacCgpa?: number;
  hasActiveIiqaSubmission: boolean;

  totalTeachingStaff: number;
  permanentTeachersCount: number;
  netSetPhdQualifiedTeachersCount: number;
  ugcPayScaleImplemented: boolean;
  salariesPaidThroughBank: boolean;
  nonTeachingStaffCount: number;
  epfSchemeCovered: boolean;

  classroomsCount: number;
  laboratoriesCount: number;
  seminarAuditoriumAvailable: boolean;
  girlsCommonRoomAvailable: boolean;

  libraryBooksCount: number;
  annualBookBudgetInr: number;
  inflibnetNlistSubscribed: boolean;
  studentComputersCount: number;

  campusLandAcres: number;
  campusLocationType: 'Urban' | 'Rural';
  campusLandOwnership: 'Freehold Owned' | 'Registered Long-term Lease' | 'Rental';
  permanentBuildingAvailable: boolean;

  jointReserveFundLakhs: number;
  auditedAccountsThreeYears: boolean;

  antiRaggingCell: boolean;
  iqacCellActive: boolean;
  equalOpportunityCell: boolean;
  grievanceRedressalCell: boolean;
}

export function evaluateUgcSubmission(data: UgcSubmissionData, criteriaList: CriterionDoc[]): {
  criteriaResults: CriterionEvaluationResult[];
  overallStatus: 'Satisfied' | 'Action Required' | 'Substantial Compliance';
  overallMessage: string;
  complianceScore: number;
  totalCriteria: number;
  satisfiedCount: number;
  gapCount: number;
} {
  const criteriaResults: CriterionEvaluationResult[] = [];
  const getCrit = (code: string) => criteriaList.find(c => c.code === code);

  // 1. Society / Trust Registration under Act
  const socCrit = getCrit('UGC_SOCIETY_REGISTRATION');
  const isGovt = data.managementCategory === 'Government';
  const socSatisfied = isGovt || (Boolean(data.isRegisteredSocietyOrTrust) && Boolean(data.memorandumHasNonProfitClause));
  criteriaResults.push({
    code: 'UGC_SOCIETY_REGISTRATION',
    category: socCrit?.category || 'Institutional Legal Status',
    title: socCrit?.title || 'Registration under Societies Act or Public Trust',
    submittedValue: isGovt ? 'Government College' : data.societyRegistrationAct,
    submittedValueFormatted: isGovt ? 'Government Controlled' : `Registered: ${data.isRegisteredSocietyOrTrust ? 'Yes' : 'No'} (${data.societyRegistrationAct || 'Not specified'}, Non-Profit: ${data.memorandumHasNonProfitClause ? 'Yes' : 'No'})`,
    requiredCondition: 'Registered Society/Trust under Act XXI of 1860 or Public Trust Act with explicit non-profit clause',
    status: socSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: socSatisfied
      ? undefined
      : !data.isRegisteredSocietyOrTrust
        ? 'College is not managed by a registered Society or Trust as required under UGC Section 2(f) rules.'
        : 'Memorandum of Association lacks statutory non-profit and non-proprietary character clauses.',
    recommendation: socCrit?.improvementTip,
    isMandatory: true,
  });

  // 2. University Affiliation Status & Standing (2(f) & 12(B))
  const affCrit = getCrit('UGC_PERMANENT_AFFILIATION');
  const standingYears = Number(data.affiliationStandingYears) || 0;
  // 12(B) requirement: Permanent affiliation OR 5+ years with continuous standing + NOC
  const affSatisfied = (data.affiliationType === 'Permanent' || standingYears >= 5) && Boolean(data.hasUniversityNocFor2f12b);
  criteriaResults.push({
    code: 'UGC_PERMANENT_AFFILIATION',
    category: affCrit?.category || 'Affiliation & Standing',
    title: affCrit?.title || 'University Affiliation Status & Standing',
    submittedValue: data.affiliationType,
    submittedValueFormatted: `${data.affiliationType} Affiliation (${standingYears} yrs standing, Affiliated to ${data.affiliatedUniversity || 'State Univ'}, NOC: ${data.hasUniversityNocFor2f12b ? 'Obtained' : 'Pending'})`,
    requiredCondition: 'Permanent affiliation OR min 5 years standing with parent university NOC for 2(f)/12(B)',
    status: affSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: affSatisfied
      ? undefined
      : !data.hasUniversityNocFor2f12b
        ? 'No-Objection Certificate (NOC) and certification of fitness from affiliating university is not on record.'
        : `Standing of ${standingYears} years is below the 5-year threshold for temporary affiliated colleges seeking 12(B) grant fitness.`,
    recommendation: affCrit?.improvementTip,
    isMandatory: true,
  });

  // 3. Campus Land Ownership
  const landCrit = getCrit('UGC_CAMPUS_LAND');
  const landAcres = Number(data.campusLandAcres) || 0;
  const minLand = data.campusLocationType === 'Rural' ? 10 : 5;
  const landSatisfied = isGovt || (landAcres >= minLand && data.campusLandOwnership !== 'Rental');
  criteriaResults.push({
    code: 'UGC_CAMPUS_LAND',
    category: landCrit?.category || 'Campus & Infrastructure',
    title: landCrit?.title || 'Dedicated Campus Land Ownership',
    submittedValue: landAcres,
    submittedValueFormatted: `${landAcres} Acres (${data.campusLocationType}, Title: ${data.campusLandOwnership})`,
    requiredCondition: `>= ${minLand} Acres (${data.campusLocationType} location, Freehold or registered 30+ year lease)`,
    status: landSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: landSatisfied
      ? undefined
      : data.campusLandOwnership === 'Rental'
        ? 'Campus land held on short-term lease or rent; UGC Section 2(f)/12(B) requires unencumbered land registered in institution name.'
        : `Campus land area (${landAcres} acres) does not satisfy the UGC requirement of ${minLand} acres in ${data.campusLocationType} zone (Deficit: ${(minLand - landAcres).toFixed(2)} acres).`,
    recommendation: landCrit?.improvementTip,
    isMandatory: true,
  });

  // 4. Permanent Pucca Building
  const bldgCrit = getCrit('UGC_PERMANENT_BUILDING');
  const bldgSatisfied = Boolean(data.permanentBuildingAvailable) &&
    Number(data.classroomsCount) >= 4 &&
    Boolean(data.girlsCommonRoomAvailable);
  criteriaResults.push({
    code: 'UGC_PERMANENT_BUILDING',
    category: bldgCrit?.category || 'Campus & Infrastructure',
    title: bldgCrit?.title || 'Permanent Pucca Academic Buildings',
    submittedValue: data.permanentBuildingAvailable,
    submittedValueFormatted: `${data.permanentBuildingAvailable ? 'Permanent Owned' : 'Temporary'}, Classrooms: ${data.classroomsCount || 0}, Girls Common Room: ${data.girlsCommonRoomAvailable ? 'Yes' : 'No'}`,
    requiredCondition: 'Owned permanent building, min 4 classrooms, staff room, and designated separate common room for female students',
    status: bldgSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: bldgSatisfied
      ? undefined
      : !data.permanentBuildingAvailable
        ? 'College does not operate out of its own permanent building.'
        : !data.girlsCommonRoomAvailable
          ? 'Mandatory separate Girls Common Room with restroom facilities is missing.'
          : `Insufficient instructional classrooms (${data.classroomsCount} reported).`,
    recommendation: bldgCrit?.improvementTip,
    isMandatory: true,
  });

  // 5. UGC Norms Qualified Teachers (NET/SET/Ph.D.)
  const qualCrit = getCrit('UGC_FACULTY_QUALIFIED');
  const totalFaculty = Number(data.totalTeachingStaff) || 0;
  const netSetCount = Number(data.netSetPhdQualifiedTeachersCount) || 0;
  const qualPercentage = totalFaculty > 0 ? Math.round((netSetCount / totalFaculty) * 100) : 0;
  const qualSatisfied = qualPercentage >= 80;
  criteriaResults.push({
    code: 'UGC_FACULTY_QUALIFIED',
    category: qualCrit?.category || 'Teaching Staff & Qualifications',
    title: qualCrit?.title || 'UGC Norms Qualified Teachers (NET/SET/Ph.D.)',
    submittedValue: qualPercentage,
    submittedValueFormatted: `${qualPercentage}% (${netSetCount} of ${totalFaculty} teachers hold NET/SET/Ph.D.)`,
    requiredCondition: '>= 80% regular teaching faculty must possess UGC specified qualifications (NET/SLET/Ph.D.)',
    status: qualSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: qualSatisfied
      ? undefined
      : `Qualified faculty percentage (${qualPercentage}%) is below UGC 80% mandate. Deficit of ${Math.ceil(totalFaculty * 0.8) - netSetCount} qualified teachers.`,
    recommendation: qualCrit?.improvementTip,
    isMandatory: true,
  });

  // 6. UGC Pay Scale & Bank Payment
  const payCrit = getCrit('UGC_FACULTY_PAY_SCALE');
  const paySatisfied = Boolean(data.ugcPayScaleImplemented) && Boolean(data.salariesPaidThroughBank);
  criteriaResults.push({
    code: 'UGC_FACULTY_PAY_SCALE',
    category: payCrit?.category || 'Teaching Staff & Qualifications',
    title: payCrit?.title || 'Implementation of UGC / State Pay Scales',
    submittedValue: paySatisfied,
    submittedValueFormatted: `UGC Scale: ${data.ugcPayScaleImplemented ? 'Implemented' : 'Not Implemented'}, Bank Transfer: ${data.salariesPaidThroughBank ? 'Yes' : 'Cash/Other'}`,
    requiredCondition: 'Adoption of UGC / State 7th Pay Commission scales disbursed through account payee bank transfers',
    status: paySatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: paySatisfied
      ? undefined
      : !data.ugcPayScaleImplemented
        ? 'College does not pay teachers in UGC / State prescribed scales of pay.'
        : 'Salaries are not certified as disbursed via electronic bank transfer (ECS/RTGS).',
    recommendation: payCrit?.improvementTip,
    isMandatory: true,
  });

  // 7. Permanent Faculty Ratio against Sanctioned Strength
  const permCrit = getCrit('UGC_PERMANENT_STAFF_RATIO');
  const permCount = Number(data.permanentTeachersCount) || 0;
  const permPercentage = totalFaculty > 0 ? Math.round((permCount / totalFaculty) * 100) : 0;
  const permSatisfied = permPercentage >= 75;
  criteriaResults.push({
    code: 'UGC_PERMANENT_STAFF_RATIO',
    category: permCrit?.category || 'Teaching Staff & Qualifications',
    title: permCrit?.title || 'Permanent Faculty against Sanctioned Strength',
    submittedValue: permPercentage,
    submittedValueFormatted: `${permPercentage}% (${permCount} permanent of ${totalFaculty} total staff)`,
    requiredCondition: '>= 75% teaching faculty appointed on regular permanent basis through statutory selection',
    status: permSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: permSatisfied
      ? undefined
      : `Permanent faculty proportion (${permPercentage}%) is below 75%. Over-reliance on temporary or guest lecturers breaches UGC guidelines.`,
    recommendation: permCrit?.improvementTip,
    isMandatory: true,
  });

  // 8. Teacher-to-Student Ratio
  const tsrCrit = getCrit('UGC_TEACHER_STUDENT_RATIO');
  const totalStudents = Number(data.totalStudentStrength) || 0;
  const actualTsr = totalFaculty > 0 ? (totalStudents / totalFaculty).toFixed(1) : '999';
  const tsrSatisfied = totalFaculty > 0 && Number(actualTsr) <= 20;
  criteriaResults.push({
    code: 'UGC_TEACHER_STUDENT_RATIO',
    category: tsrCrit?.category || 'Teaching Staff & Qualifications',
    title: tsrCrit?.title || 'Teacher to Student Ratio',
    submittedValue: totalFaculty,
    submittedValueFormatted: `1 : ${actualTsr} (${totalFaculty} teachers for ${totalStudents} enrolled students)`,
    requiredCondition: '<= 20 (Target 1:20 or better across Arts/Science/Commerce)',
    status: tsrSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: tsrSatisfied
      ? undefined
      : `Teacher student ratio (1:${actualTsr}) exceeds 1:20. Need additional ${Math.ceil(totalStudents / 20) - totalFaculty} faculty members.`,
    recommendation: tsrCrit?.improvementTip,
    isMandatory: true,
  });

  // 9. EPF / Social Security
  const epfCrit = getCrit('UGC_EPF_SOCIAL_SECURITY');
  const epfSatisfied = Boolean(data.epfSchemeCovered);
  criteriaResults.push({
    code: 'UGC_EPF_SOCIAL_SECURITY',
    category: epfCrit?.category || 'Staff Welfare & Social Security',
    title: epfCrit?.title || 'Employees Provident Fund (EPF) Scheme',
    submittedValue: data.epfSchemeCovered,
    submittedValueFormatted: data.epfSchemeCovered ? 'EPF Code Active & Enrolled' : 'Not Implemented / Partial',
    requiredCondition: 'Mandatory coverage of teaching and non-teaching personnel under EPFO Act 1952',
    status: epfSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: epfSatisfied
      ? undefined
      : 'Employees Provident Fund (EPF) scheme is not extended to faculty and non-teaching staff, breaching 12(B) fitness requirements.',
    recommendation: epfCrit?.improvementTip,
    isMandatory: true,
  });

  // 10. Library Books & Resources
  const libCrit = getCrit('UGC_LIBRARY_BOOKS');
  const books = Number(data.libraryBooksCount) || 0;
  const libSatisfied = books >= 5000 && Boolean(data.inflibnetNlistSubscribed);
  criteriaResults.push({
    code: 'UGC_LIBRARY_BOOKS',
    category: libCrit?.category || 'Library & Learning Resources',
    title: libCrit?.title || 'Adequacy of Library Volumes & Reading Room',
    submittedValue: books,
    submittedValueFormatted: `${books} Books (INFLIBNET N-LIST: ${data.inflibnetNlistSubscribed ? 'Subscribed' : 'No'}, Budget: ₹${data.annualBookBudgetInr || 0})`,
    requiredCondition: '>= 5,000 Academic Books/Volumes and active INFLIBNET N-LIST consortium membership',
    status: libSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: libSatisfied
      ? undefined
      : books < 5000
        ? `Library book inventory (${books} books) is below the minimum threshold of 5,000 standard volumes.`
        : 'INFLIBNET N-LIST / e-ShodhSindhu digital library subscription is not active.',
    recommendation: libCrit?.improvementTip,
    isMandatory: true,
  });

  // 11. University Examination Pass Percentage
  const acadCrit = getCrit('UGC_ACADEMIC_PASS_PERCENTAGE');
  const passRate = Number(data.finalYearPassPercentage) || 0;
  const acadSatisfied = passRate >= 65;
  criteriaResults.push({
    code: 'UGC_ACADEMIC_PASS_PERCENTAGE',
    category: acadCrit?.category || 'Academic Performance & Quality',
    title: acadCrit?.title || 'University Final Year Examination Pass Percentage',
    submittedValue: passRate,
    submittedValueFormatted: `${passRate}% Average Pass Rate (${data.universityRanksCount || 0} University Ranks)`,
    requiredCondition: '>= 65% graduation pass rate in affiliating university final examinations',
    status: acadSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: acadSatisfied
      ? undefined
      : `Average pass rate (${passRate}%) is under the 65% quality benchmark. Academic remediation needed.`,
    recommendation: acadCrit?.improvementTip,
    isMandatory: false,
  });

  // 12. NAAC Accreditation (Mandatory for 12-B)
  const naacCrit = getCrit('UGC_NAAC_ACCREDITATION');
  const naacSatisfied = Boolean(data.naacAccredited) || Boolean(data.hasActiveIiqaSubmission);
  criteriaResults.push({
    code: 'UGC_NAAC_ACCREDITATION',
    category: naacCrit?.category || 'Academic Performance & Quality',
    title: naacCrit?.title || 'NAAC Accreditation Status (Mandatory for 12-B)',
    submittedValue: data.naacAccredited,
    submittedValueFormatted: data.naacAccredited ? `Accredited (Grade: ${data.naacGrade || 'Valid'}, CGPA: ${data.naacCgpa || 'N/A'})` : data.hasActiveIiqaSubmission ? 'IIQA Submitted to NAAC' : 'Not Accredited / No IIQA',
    requiredCondition: 'Valid NAAC Accreditation Grade or formal submission of IIQA to NAAC',
    status: naacSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: naacSatisfied
      ? undefined
      : 'College is neither accredited by NAAC nor has submitted IIQA for assessment. Under UGC 12(B) norms, NAAC accreditation is prerequisite for central grants.',
    recommendation: naacCrit?.improvementTip,
    isMandatory: true,
  });

  // 13. Reserve / Endowment Fund in Joint Account
  const resCrit = getCrit('UGC_RESERVE_FUND');
  const reserveFund = Number(data.jointReserveFundLakhs) || 0;
  const resSatisfied = isGovt || (reserveFund >= 20 && Boolean(data.auditedAccountsThreeYears));
  criteriaResults.push({
    code: 'UGC_RESERVE_FUND',
    category: resCrit?.category || 'Financial Viability',
    title: resCrit?.title || 'Reserve / Endowment Fund in Joint Account',
    submittedValue: reserveFund,
    submittedValueFormatted: isGovt ? 'Government Institution (Exempt)' : `₹${reserveFund} Lakhs (Audited 3 Yrs: ${data.auditedAccountsThreeYears ? 'Yes' : 'No'})`,
    requiredCondition: isGovt ? 'Government state funding' : '>= ₹20 Lakhs in Joint Fixed Deposit with University/Directorate and 3 years audited balance sheets',
    status: resSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: resSatisfied
      ? undefined
      : !data.auditedAccountsThreeYears
        ? 'Audited balance sheets for 3 preceding academic years are missing.'
        : `Joint Reserve Fund (₹${reserveFund} Lakhs) falls short of ₹20 Lakhs benchmark.`,
    recommendation: resCrit?.improvementTip,
    isMandatory: true,
  });

  // 14. Statutory UGC Mandatory Cells
  const cellsCrit = getCrit('UGC_MANDATORY_CELLS');
  const cellsSatisfied = Boolean(data.iqacCellActive) &&
    Boolean(data.antiRaggingCell) &&
    Boolean(data.equalOpportunityCell) &&
    Boolean(data.grievanceRedressalCell);
  const missingCells: string[] = [];
  if (!data.iqacCellActive) missingCells.push('IQAC Cell');
  if (!data.antiRaggingCell) missingCells.push('Anti-Ragging Cell');
  if (!data.equalOpportunityCell) missingCells.push('Equal Opportunity Cell');
  if (!data.grievanceRedressalCell) missingCells.push('Grievance Redressal Cell');

  criteriaResults.push({
    code: 'UGC_MANDATORY_CELLS',
    category: cellsCrit?.category || 'Governance & Equity',
    title: cellsCrit?.title || 'IQAC, Anti-Ragging, and Equal Opportunity Cell',
    submittedValue: cellsSatisfied,
    submittedValueFormatted: cellsSatisfied ? 'All 4 Mandatory UGC Cells Operational' : `Missing: ${missingCells.join(', ')}`,
    requiredCondition: 'Functional IQAC, Anti-Ragging Cell, Equal Opportunity Cell, and Student Grievance Redressal Cell',
    status: cellsSatisfied ? 'Criteria Satisfied' : 'Criteria Not Satisfied',
    identifiedGap: cellsSatisfied
      ? undefined
      : `Missing mandatory UGC statutory cells: ${missingCells.join(', ')}.`,
    recommendation: cellsCrit?.improvementTip,
    isMandatory: true,
  });

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
    overallMessage = `Assessment Complete: Substantial compliance (${complianceScore}%). ${gapCount} criteria require minor remediation before formal UGC 2(f)/12(B) submission.`;
  } else {
    overallStatus = 'Action Required';
    overallMessage = `Assessment Complete: ${satisfiedCount} Criteria Satisfied, ${gapCount} Criteria Require Improvement. Deficiencies must be remediated to qualify under UGC Section 2(f)/12(B).`;
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
