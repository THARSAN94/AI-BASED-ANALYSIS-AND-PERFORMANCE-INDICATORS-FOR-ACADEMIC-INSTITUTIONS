import React, { useState } from 'react';
import {
  FileCheck2,
  Building,
  Users,
  BookOpen,
  Award,
  Coins,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Scale
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AssessmentResult } from '../../types';

interface UgcAssessmentFormProps {
  onAssessmentComplete: (result: AssessmentResult) => void;
  onCancel: () => void;
}

export interface UgcFormData {
  collegeName: string;
  establishmentYear: number;
  collegeType: string;
  address: string;
  state: string;
  district: string;
  managementCategory: string;
  sponsoringSocietyName: string;
  isRegisteredSocietyOrTrust: boolean;
  societyRegistrationAct: string;
  memorandumHasNonProfitClause: boolean;
  affiliatedUniversity: string;
  affiliationType: string;
  affiliationStandingYears: number;
  hasUniversityNocFor2f12b: boolean;
  ugProgrammesCount: number;
  pgProgrammesCount: number;
  departmentsCount: number;
  totalStudentStrength: number;
  finalYearPassPercentage: number;
  universityRanksCount: number;
  naacAccredited: boolean;
  naacGrade: string;
  naacCgpa: number;
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
  campusLocationType: string;
  campusLandOwnership: string;
  permanentBuildingAvailable: boolean;
  jointReserveFundLakhs: number;
  auditedAccountsThreeYears: boolean;
  antiRaggingCell: boolean;
  iqacCellActive: boolean;
  equalOpportunityCell: boolean;
  grievanceRedressalCell: boolean;
}

const DEFAULT_COMPLIANT_UGC_DATA: UgcFormData = {
  collegeName: 'Dr. Radhakrishnan Memorial Arts, Science & Commerce College',
  establishmentYear: 2011,
  collegeType: 'Affiliated',
  address: 'University Road, Vidyanagar Campus',
  state: 'Karnataka',
  district: 'Bengaluru',
  managementCategory: 'Trust / Society',
  sponsoringSocietyName: 'Vidya Vikas Education Trust',
  isRegisteredSocietyOrTrust: true,
  societyRegistrationAct: 'Societies Registration Act XXI of 1860',
  memorandumHasNonProfitClause: true,

  affiliatedUniversity: 'Bangalore University',
  affiliationType: 'Permanent',
  affiliationStandingYears: 13,
  hasUniversityNocFor2f12b: true,

  ugProgrammesCount: 8,
  pgProgrammesCount: 4,
  departmentsCount: 12,
  totalStudentStrength: 1100,

  finalYearPassPercentage: 84.5,
  universityRanksCount: 6,
  naacAccredited: true,
  naacGrade: 'A',
  naacCgpa: 3.24,
  hasActiveIiqaSubmission: true,

  totalTeachingStaff: 58,
  permanentTeachersCount: 48,
  netSetPhdQualifiedTeachersCount: 50,
  ugcPayScaleImplemented: true,
  salariesPaidThroughBank: true,
  nonTeachingStaffCount: 22,
  epfSchemeCovered: true,

  classroomsCount: 24,
  laboratoriesCount: 8,
  seminarAuditoriumAvailable: true,
  girlsCommonRoomAvailable: true,

  libraryBooksCount: 8400,
  annualBookBudgetInr: 350000,
  inflibnetNlistSubscribed: true,
  studentComputersCount: 95,

  campusLandAcres: 6.5,
  campusLocationType: 'Urban',
  campusLandOwnership: 'Freehold Owned',
  permanentBuildingAvailable: true,

  jointReserveFundLakhs: 25,
  auditedAccountsThreeYears: true,

  antiRaggingCell: true,
  iqacCellActive: true,
  equalOpportunityCell: true,
  grievanceRedressalCell: true,
};

const DEFAULT_DEFICIENT_UGC_DATA: UgcFormData = {
  collegeName: 'City Degree College of Arts & Commerce',
  establishmentYear: 2022,
  collegeType: 'Affiliated',
  address: 'Station Road, Bypass Ward 4',
  state: 'Uttar Pradesh',
  district: 'Kanpur',
  managementCategory: 'Private Unaided',
  sponsoringSocietyName: 'City Welfare Foundation',
  isRegisteredSocietyOrTrust: true,
  societyRegistrationAct: 'State Societies Act',
  memorandumHasNonProfitClause: false,

  affiliatedUniversity: 'Chhatrapati Shahu Ji Maharaj University',
  affiliationType: 'Temporary / Provisional',
  affiliationStandingYears: 2,
  hasUniversityNocFor2f12b: false,

  ugProgrammesCount: 3,
  pgProgrammesCount: 0,
  departmentsCount: 4,
  totalStudentStrength: 450,

  finalYearPassPercentage: 54.0,
  universityRanksCount: 0,
  naacAccredited: false,
  naacGrade: '',
  naacCgpa: 0,
  hasActiveIiqaSubmission: false,

  // Faculty deficits (Only 40% NET/Ph.D., no UGC pay scale)
  totalTeachingStaff: 14,
  permanentTeachersCount: 5,
  netSetPhdQualifiedTeachersCount: 6,
  ugcPayScaleImplemented: false,
  salariesPaidThroughBank: false,
  nonTeachingStaffCount: 4,
  epfSchemeCovered: false,

  classroomsCount: 4,
  laboratoriesCount: 2,
  seminarAuditoriumAvailable: false,
  girlsCommonRoomAvailable: false,

  libraryBooksCount: 2100,
  annualBookBudgetInr: 50000,
  inflibnetNlistSubscribed: false,
  studentComputersCount: 15,

  // Land: 2.2 acres in Urban needs 5.0
  campusLandAcres: 2.2,
  campusLocationType: 'Urban',
  campusLandOwnership: 'Rental',
  permanentBuildingAvailable: false,

  jointReserveFundLakhs: 5,
  auditedAccountsThreeYears: false,

  antiRaggingCell: true,
  iqacCellActive: false,
  equalOpportunityCell: false,
  grievanceRedressalCell: true,
};

export const UgcAssessmentForm: React.FC<UgcAssessmentFormProps> = ({
  onAssessmentComplete,
  onCancel,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UgcFormData>({
    ...DEFAULT_COMPLIANT_UGC_DATA,
    collegeName: user?.collegeName || DEFAULT_COMPLIANT_UGC_DATA.collegeName,
  });

  // Keep collegeName synchronized with current user's institution
  React.useEffect(() => {
    if (user?.collegeName) {
      setFormData(prev => ({
        ...prev,
        collegeName: user.collegeName,
      }));
    }
  }, [user?.collegeName]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sectionsOpen, setSectionsOpen] = useState({
    profile: true,
    academics: true,
    faculty: true,
    infrastructure: true,
    library: true,
    governance: true,
  });

  const toggleSection = (sec: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Live Calculated Metrics
  const calculatedQualifiedPercent = formData.totalTeachingStaff > 0
    ? Math.round((formData.netSetPhdQualifiedTeachersCount / formData.totalTeachingStaff) * 100)
    : 0;

  const calculatedPermanentPercent = formData.totalTeachingStaff > 0
    ? Math.round((formData.permanentTeachersCount / formData.totalTeachingStaff) * 100)
    : 0;

  const calculatedTsr = formData.totalTeachingStaff > 0
    ? (formData.totalStudentStrength / formData.totalTeachingStaff).toFixed(1)
    : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.evaluateAssessment('ugc', formData, Boolean(user));
      onAssessmentComplete(res.assessment);
    } catch (err: any) {
      setError(err.message || 'UGC Assessment evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillCompliantDemo = () => {
    setFormData({
      ...DEFAULT_COMPLIANT_UGC_DATA,
      collegeName: user?.collegeName || DEFAULT_COMPLIANT_UGC_DATA.collegeName,
    });
  };

  const fillDeficientDemo = () => {
    setFormData({
      ...DEFAULT_DEFICIENT_UGC_DATA,
      collegeName: user?.collegeName ? `${user.collegeName} (UGC Deficient Test)` : DEFAULT_DEFICIENT_UGC_DATA.collegeName,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Form Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 border border-emerald-800/60 shadow-xl mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">UGC Section 2(f) / 12(B) Recognition Assessment</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  UGC Act 1956
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Audits university affiliation standing, permanent faculty ratios, 7th CPC scale adherence, and NAAC readiness for central grants fitness.
              </p>
            </div>
          </div>

          {/* Quick Demo Pre-fill Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fillCompliantDemo}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Load fully compliant institution scenario"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Pre-fill Compliant UGC Demo
            </button>
            <button
              type="button"
              onClick={fillDeficientDemo}
              className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700/80 text-amber-300 hover:bg-amber-900/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Load deficient scenario with multiple regulatory gaps"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Pre-fill Deficient Scenario
            </button>
          </div>
        </div>

        {/* Real-time Indicator Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-200 text-xs">
          <div className="p-2.5 rounded-lg bg-[#071324] border border-white/10 text-stone-200">
            <span className="text-stone-500 block text-[10px]">NET / Ph.D. Faculty:</span>
            <span className={`font-bold font-mono ${calculatedQualifiedPercent >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>
              {calculatedQualifiedPercent}% {calculatedQualifiedPercent >= 80 ? '✓ (Norm >= 80%)' : '✗ (Shortfall)'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#071324] border border-white/10 text-stone-200">
            <span className="text-stone-500 block text-[10px]">Permanent Staff Ratio:</span>
            <span className={`font-bold font-mono ${calculatedPermanentPercent >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
              {calculatedPermanentPercent}% {calculatedPermanentPercent >= 75 ? '✓ (Norm >= 75%)' : '✗ (< 75%)'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#071324] border border-white/10 text-stone-200">
            <span className="text-stone-500 block text-[10px]">Teacher-Student Ratio:</span>
            <span className={`font-bold font-mono ${Number(calculatedTsr) <= 20 ? 'text-emerald-400' : 'text-red-400'}`}>
              1 : {calculatedTsr} {Number(calculatedTsr) <= 20 ? '✓ (Norm <= 1:20)' : '✗ (Exceeds)'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#071324] border border-white/10 text-stone-200">
            <span className="text-stone-500 block text-[10px]">NAAC Accreditation:</span>
            <span className={`font-bold ${formData.naacAccredited ? 'text-emerald-400' : formData.hasActiveIiqaSubmission ? 'text-amber-400' : 'text-red-400'}`}>
              {formData.naacAccredited ? `Accredited (${formData.naacGrade})` : formData.hasActiveIiqaSubmission ? 'IIQA Submitted' : 'Not Accredited ✗'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Evaluation Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: College Standing & University Affiliation */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('profile')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Section 1: College Standing & University Affiliation</span>
            </div>
            {sectionsOpen.profile ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.profile && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-stone-700 mb-1 font-medium">College Name</label>
                <input
                  type="text"
                  required
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Establishment Year</label>
                <input
                  type="number"
                  name="establishmentYear"
                  value={formData.establishmentYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">College Status / Type</label>
                <select
                  name="collegeType"
                  value={formData.collegeType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Affiliated">Affiliated College</option>
                  <option value="Autonomous">Autonomous College</option>
                  <option value="Constituent">Constituent College</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Management Category</label>
                <select
                  name="managementCategory"
                  value={formData.managementCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Trust / Society">Trust / Registered Society</option>
                  <option value="Private Unaided">Private Unaided</option>
                  <option value="Government">Government College</option>
                  <option value="Minority Institution">Minority Educational Institution</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 mb-1 font-medium">Affiliating University (Recognized under UGC Act)</label>
                <input
                  type="text"
                  name="affiliatedUniversity"
                  value={formData.affiliatedUniversity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Affiliation Nature</label>
                <select
                  name="affiliationType"
                  value={formData.affiliationType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Permanent">Permanent Affiliation</option>
                  <option value="Temporary / Provisional">Temporary / Provisional</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Continuous Standing (Years)</label>
                <input
                  type="number"
                  name="affiliationStandingYears"
                  value={formData.affiliationStandingYears}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 5 years standing for 12(B) if provisional</span>
              </div>

              <div className="sm:col-span-2 flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="hasUniversityNocFor2f12b"
                    checked={formData.hasUniversityNocFor2f12b}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>No-Objection Certificate (NOC) & Fitness Recommendation issued by University</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Management & Society Registration */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('governance')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Section 2: Sponsoring Society / Trust Registration & Finance</span>
            </div>
            {sectionsOpen.governance ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.governance && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Sponsoring Society / Trust Name</label>
                <input
                  type="text"
                  name="sponsoringSocietyName"
                  value={formData.sponsoringSocietyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Registration Act</label>
                <input
                  type="text"
                  name="societyRegistrationAct"
                  value={formData.societyRegistrationAct}
                  onChange={handleInputChange}
                  placeholder="e.g. Societies Registration Act XXI of 1860"
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Reserve / Joint Fixed Deposit (₹ in Lakhs)</label>
                <input
                  type="number"
                  name="jointReserveFundLakhs"
                  value={formData.jointReserveFundLakhs}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. ₹20 Lakhs in joint account with Univ/DHE</span>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="isRegisteredSocietyOrTrust"
                    checked={formData.isRegisteredSocietyOrTrust}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Society/Trust registered under relevant Registration Act</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="memorandumHasNonProfitClause"
                    checked={formData.memorandumHasNonProfitClause}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Memorandum of Association explicitly contains non-profit & non-proprietary clause</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="auditedAccountsThreeYears"
                    checked={formData.auditedAccountsThreeYears}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Audited Statements of Accounts for last 3 preceding academic years on record</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Campus Land & Building Infrastructure */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('infrastructure')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Section 3: Campus Land Ownership & Building Infrastructure</span>
            </div>
            {sectionsOpen.infrastructure ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.infrastructure && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Campus Land Area (in Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  name="campusLandAcres"
                  value={formData.campusLandAcres}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 5 acres (Urban) or 10 acres (Rural)</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Location Setting</label>
                <select
                  name="campusLocationType"
                  value={formData.campusLocationType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Urban">Urban / Municipal Limit</option>
                  <option value="Rural">Rural Area</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Land Title Ownership</label>
                <select
                  name="campusLandOwnership"
                  value={formData.campusLandOwnership}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Freehold Owned">Freehold Owned in College Name</option>
                  <option value="Registered Long-term Lease">Registered 30+ Year Lease</option>
                  <option value="Rental">Rental / Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Total Classrooms</label>
                <input
                  type="number"
                  name="classroomsCount"
                  value={formData.classroomsCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Laboratories</label>
                <input
                  type="number"
                  name="laboratoriesCount"
                  value={formData.laboratoriesCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="permanentBuildingAvailable"
                    checked={formData.permanentBuildingAvailable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Permanent Owned Academic Pucca Building</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="girlsCommonRoomAvailable"
                    checked={formData.girlsCommonRoomAvailable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Designated Girls Common Room with Attached Restroom</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Teaching Staff, Qualifications & UGC Pay Scales */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('faculty')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Section 4: Teaching Staff, NET/Ph.D. Qualifications & UGC Pay Scales</span>
            </div>
            {sectionsOpen.faculty ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.faculty && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Total Teaching Staff</label>
                <input
                  type="number"
                  name="totalTeachingStaff"
                  value={formData.totalTeachingStaff}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Permanent / Regular Teachers</label>
                <input
                  type="number"
                  name="permanentTeachersCount"
                  value={formData.permanentTeachersCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 75% on permanent basis</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">NET / SLET / Ph.D. Qualified Faculty</label>
                <input
                  type="number"
                  name="netSetPhdQualifiedTeachersCount"
                  value={formData.netSetPhdQualifiedTeachersCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 80% qualified as per UGC norms</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Total Enrolled Student Strength</label>
                <input
                  type="number"
                  name="totalStudentStrength"
                  value={formData.totalStudentStrength}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Non-Teaching Staff Count</label>
                <input
                  type="number"
                  name="nonTeachingStaffCount"
                  value={formData.nonTeachingStaffCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2 pt-2 sm:col-span-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="ugcPayScaleImplemented"
                    checked={formData.ugcPayScaleImplemented}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Implementation of UGC / State Government 7th Pay Commission salary scales</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="salariesPaidThroughBank"
                    checked={formData.salariesPaidThroughBank}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Salaries disbursed monthly through bank accounts (Electronic Bank Transfer / ECS)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="epfSchemeCovered"
                    checked={formData.epfSchemeCovered}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Employees Provident Fund (EPF) Scheme enrolled for all teaching & non-teaching staff</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Academic Performance, NAAC & Library */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('academics')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Section 5: Academic Performance, NAAC Accreditation & Library Resources</span>
            </div>
            {sectionsOpen.academics ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.academics && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Final Year Exam Pass Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="finalYearPassPercentage"
                  value={formData.finalYearPassPercentage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Target min. 65% pass rate</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">University Ranks / Medals Won</label>
                <input
                  type="number"
                  name="universityRanksCount"
                  value={formData.universityRanksCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Total Library Books & Volumes</label>
                <input
                  type="number"
                  name="libraryBooksCount"
                  value={formData.libraryBooksCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 5,000 volumes required</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">NAAC Grade (if accredited)</label>
                <input
                  type="text"
                  name="naacGrade"
                  value={formData.naacGrade}
                  onChange={handleInputChange}
                  placeholder="e.g. A++, A+, A, B++"
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">NAAC CGPA Score</label>
                <input
                  type="number"
                  step="0.01"
                  name="naacCgpa"
                  value={formData.naacCgpa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Student Computers Count</label>
                <input
                  type="number"
                  name="studentComputersCount"
                  value={formData.studentComputersCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2 pt-2 sm:col-span-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="naacAccredited"
                    checked={formData.naacAccredited}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Accredited by NAAC with valid accreditation cycle</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="hasActiveIiqaSubmission"
                    checked={formData.hasActiveIiqaSubmission}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Institutional Information for Quality Assessment (IIQA) submitted to NAAC</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="inflibnetNlistSubscribed"
                    checked={formData.inflibnetNlistSubscribed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
                  />
                  <span>Active subscription to INFLIBNET N-LIST e-ShodhSindhu digital library consortium</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Statutory UGC Cells & Quality Assurance */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-[#fafaf7] border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Section 6: Mandatory UGC Statutory Cells & Equity</span>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-800">
              <input
                type="checkbox"
                name="iqacCellActive"
                checked={formData.iqacCellActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
              />
              <span>Functional Internal Quality Assurance Cell (IQAC) with minutes uploaded</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-800">
              <input
                type="checkbox"
                name="antiRaggingCell"
                checked={formData.antiRaggingCell}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
              />
              <span>Statutory Anti-Ragging Cell & squad constituted under UGC Regulations</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-800">
              <input
                type="checkbox"
                name="equalOpportunityCell"
                checked={formData.equalOpportunityCell}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
              />
              <span>Equal Opportunity Cell for SC, ST, OBC and Divyangjan students</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-800">
              <input
                type="checkbox"
                name="grievanceRedressalCell"
                checked={formData.grievanceRedressalCell}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-emerald-500"
              />
              <span>Student Grievance Redressal Committee formed under UGC Regulations</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Cancel & Return to Dashboard
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white border border-emerald-500/30 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Auditing Against UGC 2(f)/12(B) Regulations...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>Execute UGC 2(f)/12(B) Recognition Pre-Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
