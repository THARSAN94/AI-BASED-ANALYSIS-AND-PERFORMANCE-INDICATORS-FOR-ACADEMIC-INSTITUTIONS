import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Save,
  RotateCcw,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  BookmarkCheck,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { AssessmentResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AssessmentResultViewProps {
  assessment: AssessmentResult;
  onStartNew: (module?: 'aicte' | 'ugc') => void;
  onBackToDashboard: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  assessment,
  onStartNew,
  onBackToDashboard,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'All' | 'Satisfied' | 'Gaps'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(Boolean(assessment.id));

  const isAllSatisfied = assessment.gapCount === 0;

  const categories = ['All', ...Array.from(new Set(assessment.criteriaResults.map(c => c.category)))];

  const filteredCriteria = assessment.criteriaResults.filter(item => {
    const matchStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Satisfied' && item.status === 'Criteria Satisfied') ||
      (filterStatus === 'Gaps' && item.status === 'Criteria Not Satisfied');

    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchStatus && matchCategory;
  });

  const handleSave = async () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setSaving(true);
    try {
      await api.saveAssessment(assessment);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to save assessment to history:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none font-sans">
      {/* Top action bar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          ← Return to Dashboard
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            Print / Save PDF
          </button>

          {!saveSuccess ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-lg bg-[#0c1f38] hover:bg-[#162e52] text-amber-100 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm border border-amber-500/30"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Save className="w-3.5 h-3.5 text-amber-300" />
              )}
              {user ? 'Save to Assessment History' : 'Sign In to Save Report'}
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-1.5 shadow-sm">
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
              Saved in Record
            </div>
          )}

          <button
            onClick={() => onStartNew(assessment.moduleType)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Re-evaluate / New Audit
          </button>
        </div>
      </div>

      {/* Main Assessment Report Header */}
      <div className="rounded-3xl bg-white border border-stone-200 shadow-md overflow-hidden mb-8">
        {/* Banner with Status Color */}
        <div
          className={`p-6 sm:p-8 text-stone-100 ${
            isAllSatisfied
              ? 'bg-gradient-to-r from-emerald-900 via-[#0c1f38] to-emerald-950 border-b border-emerald-700/60'
              : assessment.complianceScore >= 80
                ? 'bg-gradient-to-r from-[#0c1f38] via-[#1a3356] to-amber-950/80 border-b border-amber-600/40'
                : 'bg-gradient-to-r from-rose-950 via-[#0c1f38] to-stone-900 border-b border-rose-800/60'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-serif font-bold uppercase tracking-wider bg-white/10 text-amber-200 border border-white/20">
                  {assessment.moduleType === 'aicte' ? 'AICTE Approval Assessment' : 'UGC 2(f)/12(B) Recognition Assessment'}
                </span>
                <span className="text-xs text-stone-300 font-mono">
                  Date: {new Date(assessment.timestamp || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                {assessment.institutionName}
              </h1>

              {/* Overall Status Message */}
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isAllSatisfied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : assessment.complianceScore >= 80
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                  }`}
                >
                  {isAllSatisfied ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                    {isAllSatisfied
                      ? 'Eligibility Criteria Satisfied Based on the Configured Requirements'
                      : assessment.overallMessage}
                  </h3>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {isAllSatisfied
                      ? 'The institutional data complies with all configured benchmarks in the database.'
                      : `Identified ${assessment.gapCount} statutory deficit area(s) requiring remediation before formal submission.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Radial / Badge */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#071324]/80 rounded-2xl border border-white/15 min-w-[140px] text-stone-100">
              <div
                className={`text-4xl font-serif font-bold ${
                  isAllSatisfied
                    ? 'text-emerald-400'
                    : assessment.complianceScore >= 80
                      ? 'text-amber-400'
                      : 'text-rose-400'
                }`}
              >
                {assessment.complianceScore}%
              </div>
              <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider mt-1">
                Compliance Score
              </span>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isAllSatisfied
                      ? 'bg-emerald-400'
                      : assessment.complianceScore >= 80
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                  }`}
                  style={{ width: `${assessment.complianceScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Legal Disclaimer Notice */}
        <div className="px-6 py-3.5 bg-amber-50/90 border-b border-amber-200/80 flex items-start gap-2.5 text-xs text-stone-700">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-900 font-serif font-bold">Statutory Pre-Assessment Notice:</strong> This audit report is generated by comparing submitted institutional parameters against statutory criteria rules stored in the database. <span className="underline decoration-amber-400 font-semibold text-amber-950">It is an advisory pre-assessment tool and does not grant official approval or recognition</span>. Official recognition or approval is determined exclusively by the respective statutory councils (AICTE / UGC) through inspection committees and formal gazette notification.
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-stone-200 text-xs">
          <div className="bg-white p-4">
            <span className="text-stone-500 block text-[11px]">Total Criteria Evaluated:</span>
            <span className="text-2xl font-serif font-bold text-[#0c1f38]">{assessment.totalCriteria}</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Statutory Benchmarks</span>
          </div>

          <div className="bg-white p-4">
            <span className="text-stone-500 block text-[11px]">Criteria Satisfied:</span>
            <span className="text-2xl font-serif font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {assessment.satisfiedCount}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Requirements Met</span>
          </div>

          <div className="bg-white p-4">
            <span className="text-stone-500 block text-[11px]">Criteria Needing Improvement:</span>
            <span className="text-2xl font-serif font-bold text-rose-700 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              {assessment.gapCount}
            </span>
            <span className="text-[10px] text-rose-600 block mt-0.5">Identified Gaps</span>
          </div>

          <div className="bg-white p-4">
            <span className="text-stone-500 block text-[11px]">Overall Assessment Status:</span>
            <span
              className={`text-sm font-serif font-bold block truncate mt-1 ${
                isAllSatisfied
                  ? 'text-emerald-700'
                  : assessment.overallStatus === 'Substantial Compliance'
                    ? 'text-amber-800'
                    : 'text-rose-700'
              }`}
            >
              {assessment.overallStatus}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Pre-Assessment Outcome</span>
          </div>
        </div>
      </div>

      {/* AI / Expert Executive Analysis Diagnosis */}
      {assessment.aiExecutiveSummary && (
        <div className="p-6 rounded-2xl bg-[#f5f2ea] border border-amber-900/15 shadow-sm mb-8">
          <div className="flex items-center gap-2.5 mb-3 text-[#0c1f38] font-serif font-bold text-base">
            <div className="p-1.5 rounded-lg bg-amber-600 text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Executive Regulatory Diagnosis & Strategic Readiness Analysis</span>
          </div>
          <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed border-l-2 border-amber-600 pl-4 font-sans">
            {assessment.aiExecutiveSummary}
          </div>
        </div>
      )}

      {/* Criteria Breakdown Section */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0c1f38] flex items-center gap-2">
              <span>Detailed Statutory Criteria Comparison</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                {filteredCriteria.length} of {assessment.totalCriteria}
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              Direct comparison of submitted institutional values against configured statutory thresholds.
            </p>
          </div>

          {/* Filter Controls (Status & Categories) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex bg-white p-1 rounded-lg border border-stone-200 text-xs shadow-sm">
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  filterStatus === 'All' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({assessment.totalCriteria})
              </button>
              <button
                onClick={() => setFilterStatus('Satisfied')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  filterStatus === 'Satisfied' ? 'bg-emerald-700 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Satisfied ({assessment.satisfiedCount})
              </button>
              <button
                onClick={() => setFilterStatus('Gaps')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  filterStatus === 'Gaps' ? 'bg-rose-700 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Gaps ({assessment.gapCount})
              </button>
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0c1f38] text-amber-50 font-semibold shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Detailed Table / Cards */}
        <div className="space-y-3.5">
          {filteredCriteria.map((item, index) => {
            const isSatisfied = item.status === 'Criteria Satisfied';

            return (
              <div
                key={index}
                className={`rounded-xl border transition-all ${
                  isSatisfied
                    ? 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
                    : 'bg-white border-rose-300 shadow-sm'
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-serif font-bold text-stone-900">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSatisfied ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Criteria Satisfied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Criteria Not Satisfied
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2-Column Comparison: Submitted vs Required */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#fafaf7] border border-stone-200">
                      <span className="text-[11px] font-medium text-stone-500 block mb-1">
                        Submitted College Information:
                      </span>
                      <span className="font-semibold text-stone-900 font-mono">
                        {item.submittedValueFormatted}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#f6f8fb] border border-blue-200/80">
                      <span className="text-[11px] font-medium text-stone-500 block mb-1">
                        Applicable Required Value / Condition:
                      </span>
                      <span className="font-semibold text-[#0c1f38] font-mono">
                        {item.requiredCondition}
                      </span>
                    </div>
                  </div>

                  {/* Identified Gap and Remediation Suggestion (if deficient) */}
                  {!isSatisfied && (
                    <div className="mt-3 p-3.5 rounded-lg bg-rose-50/80 border border-rose-200 space-y-2 text-xs">
                      <div>
                        <span className="font-serif font-bold text-rose-900 block mb-0.5">Identified Regulatory Gap:</span>
                        <p className="text-rose-800 leading-relaxed">{item.identifiedGap}</p>
                      </div>

                      {item.recommendation && (
                        <div className="pt-2 border-t border-rose-200">
                          <span className="font-serif font-bold text-amber-900 block mb-0.5">Practical Improvement Suggestion:</span>
                          <p className="text-stone-700 leading-relaxed">{item.recommendation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practical Improvement Suggestions & Recommendations Roadmap */}
      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <div className="mb-12">
          <div className="mb-4">
            <h2 className="text-xl font-serif font-bold text-[#0c1f38] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-700" />
              <span>Prioritized Improvement & Remediation Roadmap</span>
            </h2>
            <p className="text-xs text-stone-500">
              Departmental action plans engineered to resolve identified deficiencies ahead of formal inspection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessment.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-stone-500">{rec.category}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        rec.priority === 'Critical'
                          ? 'bg-rose-50 text-rose-800 border border-rose-300'
                          : rec.priority === 'High'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-blue-50 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#0c1f38] mb-1.5">{rec.title}</h3>
                  <p className="text-xs text-stone-600 mb-3 leading-relaxed">{rec.description}</p>

                  <div className="space-y-1.5 text-xs text-stone-700 bg-[#fafaf7] p-3 rounded-lg border border-stone-200 mb-3">
                    <span className="text-[11px] font-serif font-bold text-stone-900 block mb-1">Recommended Action Steps:</span>
                    {rec.actionItems.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2">
                        <span className="text-amber-700 font-bold shrink-0 mt-0.5">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Target Timeline: <strong className="text-stone-800">{rec.timeline}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h4 className="text-base font-serif font-bold text-[#0c1f38]">Perform Another Regulatory Pre-Assessment</h4>
          <p className="text-xs text-stone-500">Evaluate other academic branches or switch between AICTE and UGC streams.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartNew('aicte')}
            className="px-4 py-2 rounded-lg bg-[#0c1f38] hover:bg-[#162e52] text-amber-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/30"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            New AICTE Audit
          </button>
          <button
            onClick={() => onStartNew('ugc')}
            className="px-4 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-600/30"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-200" />
            New UGC Audit
          </button>
        </div>
      </div>
    </div>
  );
};
