import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  Users,
  BookOpen,
  Monitor,
  Flame,
  Coins,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AssessmentResult } from '../../types';

interface AicteAssessmentFormProps {
  onAssessmentComplete: (result: AssessmentResult) => void;
  onCancel: () => void;
}

export interface AicteFormData {
  collegeName: string;
  institutionType: string;
  address: string;
  state: string;
  district: string;
  managementType: string;
  establishmentYear: number;
  affiliatedUniversity: string;
  affiliationType: string;
  proposedProgramme: string;
  programmeLevel: string;
  proposedIntake: number;
  existingIntake: number;
  totalEnrolledStudents: number;
  landAreaAcres: number;
  locationCategory: string;
  builtUpAreaSqm: number;
  landOwnershipType: string;
  buildingPlanApproved: boolean;
  classroomsCount: number;
  smartClassroomsCount: number;
  laboratoriesCount: number;
  workshopBaysCount: number;
  seminarHallsCount: number;
  totalFacultyCount: number;
  professorsCount: number;
  associateProfessorsCount: number;
  assistantProfessorsCount: number;
  phdFacultyCount: number;
  principalHasPhd: boolean;
  principalExperienceYears: number;
  nonTeachingStaffCount: number;
  libraryBookTitles: number;
  libraryBookVolumes: number;
  nationalJournalsCount: number;
  internationalEJournalsSubscribed: boolean;
  delnetMembership: boolean;
  readingRoomSeats: number;
  studentComputersCount: number;
  internetBandwidthMbps: number;
  licensedSoftwareCount: number;
  campusWifiEnabled: boolean;
  fireSafetyNocValid: boolean;
  barrierFreeFacilities: boolean;
  antiRaggingCommittee: boolean;
  internalComplaintsCommittee: boolean;
  grievanceRedressalCommittee: boolean;
  scStCommittee: boolean;
  corpusFundLakhs: number;
  annualBudgetLakhs: number;
  auditedFinancialsAvailable: boolean;
}

const DEFAULT_COMPLIANT_DATA: AicteFormData = {
  collegeName: 'Apex Institute of Engineering & Technology',
  institutionType: 'Engineering',
  address: 'Sector 14, Knowledge Corridor, Tech Park Road',
  state: 'Maharashtra',
  district: 'Pune',
  managementType: 'Private-Unaided',
  establishmentYear: 2012,
  affiliatedUniversity: 'Savitribai Phule Pune University',
  affiliationType: 'Permanent',
  proposedProgramme: 'B.Tech in Computer Science & Artificial Intelligence',
  programmeLevel: 'UG',
  proposedIntake: 240,
  existingIntake: 180,
  totalEnrolledStudents: 720,

  // Land & Buildings
  landAreaAcres: 2.75,
  locationCategory: 'Urban',
  builtUpAreaSqm: 5600,
  landOwnershipType: 'Owned',
  buildingPlanApproved: true,

  // Classrooms & Labs
  classroomsCount: 14,
  smartClassroomsCount: 4,
  laboratoriesCount: 10,
  workshopBaysCount: 3,
  seminarHallsCount: 2,

  // Faculty
  totalFacultyCount: 48,
  professorsCount: 5,
  associateProfessorsCount: 11,
  assistantProfessorsCount: 32,
  phdFacultyCount: 16,
  principalHasPhd: true,
  principalExperienceYears: 18,
  nonTeachingStaffCount: 24,

  // Library
  libraryBookTitles: 1250,
  libraryBookVolumes: 6800,
  nationalJournalsCount: 12,
  internationalEJournalsSubscribed: true,
  delnetMembership: true,
  readingRoomSeats: 160,

  // Digital & Computing
  studentComputersCount: 220,
  internetBandwidthMbps: 300,
  licensedSoftwareCount: 15,
  campusWifiEnabled: true,

  // Safety & Statutory
  fireSafetyNocValid: true,
  barrierFreeFacilities: true,
  antiRaggingCommittee: true,
  internalComplaintsCommittee: true,
  grievanceRedressalCommittee: true,
  scStCommittee: true,

  // Financial
  corpusFundLakhs: 150,
  annualBudgetLakhs: 280,
  auditedFinancialsAvailable: true,
};

const DEFAULT_DEFICIENT_DATA: AicteFormData = {
  collegeName: 'Sunrise Polytechnic & Technical College',
  institutionType: 'Engineering',
  address: 'Gram Panchayat Road, Old Tehsil',
  state: 'Madhya Pradesh',
  district: 'Bhopal',
  managementType: 'Private-Unaided',
  establishmentYear: 2021,
  affiliatedUniversity: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya',
  affiliationType: 'Provisional / Temporary',
  proposedProgramme: 'B.Tech in Mechanical Engineering',
  programmeLevel: 'UG',
  proposedIntake: 180,
  existingIntake: 120,
  totalEnrolledStudents: 360,

  // Land & Buildings (Deficits: 1.1 acres in Rural needs 2.5, built-up deficit)
  landAreaAcres: 1.1,
  locationCategory: 'Rural',
  builtUpAreaSqm: 2800,
  landOwnershipType: 'Rented',
  buildingPlanApproved: false,

  // Classrooms & Labs
  classroomsCount: 3,
  smartClassroomsCount: 0,
  laboratoriesCount: 4,
  workshopBaysCount: 0,
  seminarHallsCount: 0,

  // Faculty (FSR deficit: 360 students / 12 faculty = 1:30; 0 Ph.D.)
  totalFacultyCount: 12,
  professorsCount: 0,
  associateProfessorsCount: 1,
  assistantProfessorsCount: 11,
  phdFacultyCount: 1,
  principalHasPhd: false,
  principalExperienceYears: 8,
  nonTeachingStaffCount: 6,

  // Library
  libraryBookTitles: 320,
  libraryBookVolumes: 1800,
  nationalJournalsCount: 2,
  internationalEJournalsSubscribed: false,
  delnetMembership: false,
  readingRoomSeats: 30,

  // Digital
  studentComputersCount: 40,
  internetBandwidthMbps: 45,
  licensedSoftwareCount: 3,
  campusWifiEnabled: false,

  // Safety (Missing Fire NOC and Ramps)
  fireSafetyNocValid: false,
  barrierFreeFacilities: false,
  antiRaggingCommittee: false,
  internalComplaintsCommittee: true,
  grievanceRedressalCommittee: false,
  scStCommittee: false,

  // Financial
  corpusFundLakhs: 35,
  annualBudgetLakhs: 45,
  auditedFinancialsAvailable: false,
};

export const AicteAssessmentForm: React.FC<AicteAssessmentFormProps> = ({
  onAssessmentComplete,
  onCancel,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AicteFormData>({
    ...DEFAULT_COMPLIANT_DATA,
    collegeName: user?.collegeName || DEFAULT_COMPLIANT_DATA.collegeName,
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

  // Collapsible section toggles
  const [sectionsOpen, setSectionsOpen] = useState({
    basic: true,
    infrastructure: true,
    instructional: true,
    faculty: true,
    library: true,
    computing: true,
    statutory: true,
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

  // Calculated Real-Time Metrics
  const calculatedFSR = formData.totalFacultyCount > 0
    ? (formData.totalEnrolledStudents / formData.totalFacultyCount).toFixed(1)
    : '0';
  const calculatedCompRatio = formData.studentComputersCount > 0
    ? (formData.totalEnrolledStudents / formData.studentComputersCount).toFixed(1)
    : '0';
  const calculatedPhdPercent = formData.totalFacultyCount > 0
    ? Math.round((formData.phdFacultyCount / formData.totalFacultyCount) * 100)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.evaluateAssessment('aicte', formData, Boolean(user));
      onAssessmentComplete(res.assessment);
    } catch (err: any) {
      setError(err.message || 'Assessment evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillCompliantDemo = () => {
    setFormData({
      ...DEFAULT_COMPLIANT_DATA,
      collegeName: user?.collegeName || DEFAULT_COMPLIANT_DATA.collegeName,
    });
  };

  const fillDeficientDemo = () => {
    setFormData({
      ...DEFAULT_DEFICIENT_DATA,
      collegeName: (user?.collegeName ? `${user.collegeName} (Audit Deficient Test)` : DEFAULT_DEFICIENT_DATA.collegeName),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Form Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1f38] via-[#142d4c] to-[#0c1f38] border border-amber-500/30 text-stone-100 shadow-xl mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">AICTE Approval Assessment Form</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  APH 2024-27 Norms
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Enter your institution metrics to verify compliance against official AICTE Approval Process Handbook criteria.
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
              Pre-fill Compliant Demo
            </button>
            <button
              type="button"
              onClick={fillDeficientDemo}
              className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700/80 text-amber-300 hover:bg-amber-900/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Load deficient scenario with multiple regulatory gaps"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Pre-fill Deficient Demo
            </button>
          </div>
        </div>

        {/* Real-time Indicator Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-200 text-xs">
          <div className="p-2.5 rounded-lg bg-[#071324] border border-white/10 text-stone-200">
            <span className="text-stone-500 block text-[10px]">Calculated FSR:</span>
            <span className={`font-bold font-mono ${Number(calculatedFSR) <= 20 ? 'text-emerald-400' : 'text-red-400'}`}>
              1 : {calculatedFSR} {Number(calculatedFSR) <= 20 ? '✓ (Norm <= 1:20)' : '✗ (Over Cap)'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#071324] border border-white/10 text-stone-200">
            <span className="text-stone-500 block text-[10px]">Student : PC Ratio:</span>
            <span className={`font-bold font-mono ${Number(calculatedCompRatio) <= 5 ? 'text-emerald-400' : 'text-red-400'}`}>
              1 : {calculatedCompRatio} {Number(calculatedCompRatio) <= 5 ? '✓ (Norm <= 1:5)' : '✗ (Shortfall)'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#071324] border border-white/10 text-stone-200">
            <span className="text-stone-500 block text-[10px]">Faculty Ph.D. Ratio:</span>
            <span className={`font-bold font-mono ${calculatedPhdPercent >= 20 ? 'text-emerald-400' : 'text-red-400'}`}>
              {calculatedPhdPercent}% {calculatedPhdPercent >= 20 ? '✓ (>= 20%)' : '✗ (< 20%)'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#071324] border border-white/10 text-stone-200">
            <span className="text-stone-500 block text-[10px]">Fire Safety NOC:</span>
            <span className={`font-bold ${formData.fireSafetyNocValid ? 'text-emerald-400' : 'text-red-400'}`}>
              {formData.fireSafetyNocValid ? 'Valid on Record ✓' : 'Deficient / Missing ✗'}
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
        {/* Section 1: Institution & Academic Profile */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('basic')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Section 1: Institution Identity & Programme Profile</span>
            </div>
            {sectionsOpen.basic ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.basic && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-stone-700 mb-1 font-medium">Institution / College Name</label>
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
                <label className="block text-stone-700 mb-1 font-medium">Institution Discipline Type</label>
                <select
                  name="institutionType"
                  value={formData.institutionType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Engineering">Engineering & Technology</option>
                  <option value="Management">Management (MBA/PGDM)</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Polytechnic">Polytechnic Diploma</option>
                  <option value="Architecture">Architecture & Town Planning</option>
                  <option value="MCA">Computer Applications (MCA)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Management Structure</label>
                <select
                  name="managementType"
                  value={formData.managementType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Private-Unaided">Private-Unaided (Trust / Society)</option>
                  <option value="Govt">Government</option>
                  <option value="Govt-Aided">Government-Aided</option>
                </select>
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
                <label className="block text-stone-700 mb-1 font-medium">State & Union Territory</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-700 mb-1 font-medium">Affiliating University</label>
                <input
                  type="text"
                  name="affiliatedUniversity"
                  value={formData.affiliatedUniversity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Affiliation Type</label>
                <select
                  name="affiliationType"
                  value={formData.affiliationType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Permanent">Permanent Affiliation</option>
                  <option value="Provisional / Temporary">Provisional / Temporary</option>
                  <option value="Autonomous">Autonomous Status</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Programme Level</label>
                <select
                  name="programmeLevel"
                  value={formData.programmeLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                  <option value="Diploma">Diploma Level</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Proposed Intake (Annual)</label>
                <input
                  type="number"
                  name="proposedIntake"
                  value={formData.proposedIntake}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Total Enrolled Students</label>
                <input
                  type="number"
                  name="totalEnrolledStudents"
                  value={formData.totalEnrolledStudents}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Land & Infrastructure */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('infrastructure')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Section 2: Land & Physical Campus Infrastructure</span>
            </div>
            {sectionsOpen.infrastructure ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.infrastructure && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Land Area (in Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  name="landAreaAcres"
                  value={formData.landAreaAcres}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 2.5 acres (Rural) or 1.5 acres (Urban)</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Territorial Location Category</label>
                <select
                  name="locationCategory"
                  value={formData.locationCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Urban">Urban / Municipal Area</option>
                  <option value="Rural">Rural / Panchayat Area</option>
                  <option value="Mega/Metro">Mega / Metro City Area</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Land Title Ownership</label>
                <select
                  name="landOwnershipType"
                  value={formData.landOwnershipType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                >
                  <option value="Owned">Freehold Owned (Registered Deed)</option>
                  <option value="Registered Lease (30+ yrs)">Registered Long-Term Lease (30+ yrs)</option>
                  <option value="Rented">Rented / Short-term Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Total Built-Up Area (sq.m)</label>
                <input
                  type="number"
                  name="builtUpAreaSqm"
                  value={formData.builtUpAreaSqm}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 4,000 sq.m for standard division</span>
              </div>

              <div className="sm:col-span-2 flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="buildingPlanApproved"
                    checked={formData.buildingPlanApproved}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Building Plan officially sanctioned & approved by Competent Municipal Authority / DTCP</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Instructional Space & Laboratories */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('instructional')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Section 3: Classrooms, Laboratories & Workshops</span>
            </div>
            {sectionsOpen.instructional ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.instructional && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Total Instructional Classrooms</label>
                <input
                  type="number"
                  name="classroomsCount"
                  value={formData.classroomsCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Smart / ICT Classrooms</label>
                <input
                  type="number"
                  name="smartClassroomsCount"
                  value={formData.smartClassroomsCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Domain Specialized Labs</label>
                <input
                  type="number"
                  name="laboratoriesCount"
                  value={formData.laboratoriesCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Central Workshop Bays</label>
                <input
                  type="number"
                  name="workshopBaysCount"
                  value={formData.workshopBaysCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Seminar Halls / Auditoriums</label>
                <input
                  type="number"
                  name="seminarHallsCount"
                  value={formData.seminarHallsCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Faculty Strength & Cadre Ratio */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('faculty')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Section 4: Faculty Qualifications & Cadre Ratio (FSR)</span>
            </div>
            {sectionsOpen.faculty ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.faculty && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Total Full-Time Faculty</label>
                <input
                  type="number"
                  name="totalFacultyCount"
                  value={formData.totalFacultyCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Professors</label>
                <input
                  type="number"
                  name="professorsCount"
                  value={formData.professorsCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Associate Professors</label>
                <input
                  type="number"
                  name="associateProfessorsCount"
                  value={formData.associateProfessorsCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Assistant Professors</label>
                <input
                  type="number"
                  name="assistantProfessorsCount"
                  value={formData.assistantProfessorsCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Ph.D. Degree Holders</label>
                <input
                  type="number"
                  name="phdFacultyCount"
                  value={formData.phdFacultyCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min 20% of total faculty</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Principal Experience (Years)</label>
                <input
                  type="number"
                  name="principalExperienceYears"
                  value={formData.principalExperienceYears}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min 15 years required</span>
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

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="principalHasPhd"
                    checked={formData.principalHasPhd}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Principal holds Ph.D. Degree</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Library & Information Resources */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('library')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Section 5: Library Resources, Books & E-Journals</span>
            </div>
            {sectionsOpen.library ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.library && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Book Volumes</label>
                <input
                  type="number"
                  name="libraryBookVolumes"
                  value={formData.libraryBookVolumes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 3,000 volumes required</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Distinct Titles</label>
                <input
                  type="number"
                  name="libraryBookTitles"
                  value={formData.libraryBookTitles}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 500 titles required</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Reading Room Seating Capacity</label>
                <input
                  type="number"
                  name="readingRoomSeats"
                  value={formData.readingRoomSeats}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">National Print Journals</label>
                <input
                  type="number"
                  name="nationalJournalsCount"
                  value={formData.nationalJournalsCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="internationalEJournalsSubscribed"
                    checked={formData.internationalEJournalsSubscribed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>International E-Journals Subscribed (IEEE / Springer / ScienceDirect)</span>
                </label>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="delnetMembership"
                    checked={formData.delnetMembership}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>DELNET / National Digital Library Membership</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Computing, Software & Internet */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('computing')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span>Section 6: Computing Infrastructure & Internet Bandwidth</span>
            </div>
            {sectionsOpen.computing ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.computing && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Student Computing Terminals</label>
                <input
                  type="number"
                  name="studentComputersCount"
                  value={formData.studentComputersCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 60 computers & 1:5 ratio</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Internet Bandwidth (Mbps)</label>
                <input
                  type="number"
                  name="internetBandwidthMbps"
                  value={formData.internetBandwidthMbps}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">Min. 100 Mbps dedicated leased line</span>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Legal System/Application Software</label>
                <input
                  type="number"
                  name="licensedSoftwareCount"
                  value={formData.licensedSoftwareCount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                />
              </div>

              <div className="sm:col-span-3 flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="campusWifiEnabled"
                    checked={formData.campusWifiEnabled}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Campus-wide secured Wi-Fi infrastructure with firewall</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Statutory Safety, Committees & Financial Reserve */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('statutory')}
            className="w-full p-4 bg-[#fafaf7] hover:bg-[#f5f2ea] flex items-center justify-between text-left border-b border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#0c1f38] font-serif font-bold text-base">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Section 7: Statutory Safety, Mandatory Committees & Joint Corpus</span>
            </div>
            {sectionsOpen.statutory ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
          </button>

          {sectionsOpen.statutory && (
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 mb-1 font-medium">Corpus / Joint Fixed Deposit (₹ in Lakhs)</label>
                  <input
                    type="number"
                    name="corpusFundLakhs"
                    value={formData.corpusFundLakhs}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">Min. ₹100 Lakhs (₹1 Crore) for Private Unaided</span>
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-medium">Annual Recurring Operating Budget (₹ in Lakhs)</label>
                  <input
                    type="number"
                    name="annualBudgetLakhs"
                    value={formData.annualBudgetLakhs}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#fafaf7] border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:border-[#0c1f38] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="fireSafetyNocValid"
                    checked={formData.fireSafetyNocValid}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Valid Fire Safety Certificate / NOC from State Fire Department</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="barrierFreeFacilities"
                    checked={formData.barrierFreeFacilities}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Barrier-Free Access (Ramps, Divyangjan Restrooms & Lifts)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="antiRaggingCommittee"
                    checked={formData.antiRaggingCommittee}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Anti-Ragging Committee & Anti-Ragging Squad Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="internalComplaintsCommittee"
                    checked={formData.internalComplaintsCommittee}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Internal Complaints Committee (ICC / POSH)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="grievanceRedressalCommittee"
                    checked={formData.grievanceRedressalCommittee}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Student Grievance Redressal Committee & Ombudsman</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    name="scStCommittee"
                    checked={formData.scStCommittee}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>SC / ST Committee Formed as per Act</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-800 sm:col-span-2">
                  <input
                    type="checkbox"
                    name="auditedFinancialsAvailable"
                    checked={formData.auditedFinancialsAvailable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-[#fafaf7] border-stone-300 rounded text-[#0c1f38] focus:ring-blue-500"
                  />
                  <span>Audited Financial Statements (Last 3 Years) Certified by Chartered Accountant</span>
                </label>
              </div>
            </div>
          )}
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
            className="px-6 py-3 rounded-xl bg-[#0c1f38] hover:bg-[#162e52] text-amber-50 border border-amber-500/30 font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Auditing Against AICTE Database Benchmarks...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Execute AICTE Approval Pre-Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
