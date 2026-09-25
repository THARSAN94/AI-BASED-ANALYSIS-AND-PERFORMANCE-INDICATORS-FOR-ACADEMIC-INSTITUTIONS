import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  History,
  TrendingUp,
  CheckCircle2,
  Award,
  ArrowRight,
  Trash2,
  Eye,
  Building,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../utils/themeStyles';
import { api } from '../../services/api';
import { AssessmentResult, DashboardStats } from '../../types';

interface DashboardProps {
  onSelectModule: (module: 'aicte' | 'ugc') => void;
  onViewAssessment: (assessment: AssessmentResult) => void;
  onOpenCriteria: (type: 'aicte' | 'ugc') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectModule,
  onViewAssessment,
  onOpenCriteria,
}) => {
  const { user } = useAuth();
  const { style, isDark, mode } = useTheme();
  const theme = getThemeClasses(mode || style);

  const isArchival = style === 'archival';

  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user) {
      setHistory([]);
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setHistory([]);
    setStats(null);

    try {
      const [historyRes, statsRes] = await Promise.all([
        api.getHistory(),
        api.getStatsSummary(),
      ]);
      setHistory(historyRes.assessments);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this assessment record?')) return;
    setDeletingId(id);
    try {
      await api.deleteAssessment(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (stats) {
        setStats(prev => prev ? { ...prev, totalAssessments: Math.max(0, prev.totalAssessments - 1) } : null);
      }
    } catch (err) {
      console.error('Failed to delete assessment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans ${theme.pageBg} transition-colors duration-200`}>
      {/* Welcome & Institution Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden text-stone-100 ${
        isDark
          ? 'bg-gradient-to-r from-[#030712] via-[#091124] to-[#030712] border border-cyan-500/30'
          : isArchival
            ? 'bg-gradient-to-r from-[#0c1f38] via-[#142d4c] to-[#0c1f38] border border-amber-500/30'
            : 'bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border border-indigo-500/30'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-serif font-bold uppercase tracking-widest ${
                isDark ? 'text-cyan-300' : isArchival ? 'text-amber-300' : 'text-indigo-300'
              }`}>
                Institutional Compliance Portal
              </span>
              <span className="text-stone-400 font-mono text-[11px]">
                · Active Session: {user?.role || 'Institution Administrator'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Welcome, {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 flex items-center gap-2">
              <Building className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-400' : 'text-indigo-400'}`} />
              <span className="font-semibold text-white">{user?.collegeName}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectModule('aicte')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                  : isArchival
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              New AICTE Assessment
            </button>
            <button
              onClick={() => onSelectModule('ugc')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500/40"
            >
              <FileCheck2 className="w-4 h-4" />
              New UGC 2(f)/12(B) Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle}`}>
          <div className={`flex items-center justify-between ${theme.textMuted} text-xs mb-2`}>
            <span>Total Audits Run</span>
            <History className={`w-4 h-4 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
          </div>
          <div className={`text-3xl font-serif font-bold ${theme.textHeading}`}>
            {stats?.totalAssessments ?? history.length}
          </div>
          <div className={`text-[11px] ${theme.textMuted} mt-1 flex gap-2 font-mono`}>
            <span>AICTE: {stats?.aicteCount ?? 0}</span>
            <span>·</span>
            <span>UGC: {stats?.ugcCount ?? 0}</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle}`}>
          <div className={`flex items-center justify-between ${theme.textMuted} text-xs mb-2`}>
            <span>Avg. Compliance Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-serif font-bold text-emerald-600">
            {stats?.avgComplianceScore ?? 0}%
          </div>
          <div className={`text-[11px] ${theme.textMuted} mt-1`}>
            Across evaluated statutory streams
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle}`}>
          <div className={`flex items-center justify-between ${theme.textMuted} text-xs mb-2`}>
            <span>Fully Satisfied Audits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-3xl font-serif font-bold ${theme.textHeading}`}>
            {stats?.fullySatisfiedCount ?? 0}
          </div>
          <div className={`text-[11px] ${theme.textMuted} mt-1`}>
            Zero regulatory gaps identified
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle}`}>
          <div className={`flex items-center justify-between ${theme.textMuted} text-xs mb-2`}>
            <span>Statutory DB Engine</span>
            <Award className={`w-4 h-4 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-600' : 'text-indigo-600'}`} />
          </div>
          <div className={`text-lg font-serif font-bold ${theme.textHeading} mt-1`}>
            APH 2024-27 & UGC
          </div>
          <button
            onClick={() => onOpenCriteria('aicte')}
            className={`text-[11px] font-semibold underline-offset-2 hover:underline block mt-1 cursor-pointer ${
              isDark ? 'text-cyan-400' : isArchival ? 'text-[#0c1f38]' : 'text-indigo-600'
            }`}
          >
            Inspect Criteria Rules →
          </button>
        </div>
      </div>

      {/* Module Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-xl font-serif font-bold ${theme.textHeading}`}>Select Pre-Assessment Module</h2>
            <p className={`text-xs ${theme.textMuted}`}>Choose between the AICTE Approval or UGC Section 2(f)/12(B) statutory streams.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AICTE Launcher Card */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} hover:border-indigo-500/40 transition-all shadow-sm hover:shadow-md group flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : isArchival ? 'bg-[#0c1f38] text-amber-300' : 'bg-indigo-600 text-white'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isDark ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800' : isArchival ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  15 Handbook Benchmarks
                </span>
              </div>
              <h3 className={`text-lg font-serif font-bold ${theme.textHeading} group-hover:text-indigo-500 transition-colors`}>
                AICTE Approval Assessment
              </h3>
              <p className={`text-xs ${theme.textMuted} mt-1.5 leading-relaxed`}>
                Evaluates campus land area, built-up instructional spaces, FSR 1:15/1:20 ratios, Ph.D. cadre ratios, laboratory equipment, DELNET library subscriptions, Fire Safety NOC, and Divyangjan barrier-free compliance.
              </p>
            </div>

            <div className={`mt-6 pt-4 border-t ${theme.borderSubtle} flex items-center justify-between`}>
              <button
                onClick={() => onOpenCriteria('aicte')}
                className={`text-xs font-medium cursor-pointer ${theme.textMuted} hover:${theme.textHeading}`}
              >
                Inspect AICTE Rules
              </button>
              <button
                onClick={() => onSelectModule('aicte')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  isDark
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                    : isArchival
                      ? 'bg-[#0c1f38] hover:bg-[#162e52] text-amber-100 border border-amber-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <span>Launch AICTE Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* UGC Launcher Card */}
          <div className={`p-6 rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-md group flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  14 Statutory Rules
                </span>
              </div>
              <h3 className={`text-lg font-serif font-bold ${theme.textHeading} group-hover:text-emerald-600 transition-colors`}>
                UGC Section 2(f) / 12(B) Recognition Assessment
              </h3>
              <p className={`text-xs ${theme.textMuted} mt-1.5 leading-relaxed`}>
                Evaluates Society/Trust Registration Act status, 5+ years affiliation standing, owned campus land, 80% NET/Ph.D. qualified faculty, UGC 7th CPC scale implementation, NAAC status, and joint reserve fund accounts.
              </p>
            </div>

            <div className={`mt-6 pt-4 border-t ${theme.borderSubtle} flex items-center justify-between`}>
              <button
                onClick={() => onOpenCriteria('ugc')}
                className={`text-xs font-medium cursor-pointer ${theme.textMuted} hover:${theme.textHeading}`}
              >
                Inspect UGC Rules
              </button>
              <button
                onClick={() => onSelectModule('ugc')}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-emerald-600/30"
              >
                <span>Launch UGC Audit</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className={`w-5 h-5 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
            <h2 className={`text-xl font-serif font-bold ${theme.textHeading}`}>Previous Assessment History</h2>
          </div>
          <button
            onClick={loadDashboardData}
            className={`text-xs ${theme.textMuted} hover:${theme.textHeading} flex items-center gap-1 transition-colors cursor-pointer`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className={`p-12 text-center ${theme.textMuted} ${theme.cardBg} rounded-2xl border ${theme.borderSubtle}`}>
            <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
            <p className="text-xs">Loading institutional audit history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className={`p-10 text-center ${theme.cardBg} rounded-2xl border ${theme.borderSubtle}`}>
            <p className={`text-sm ${theme.textHeading} font-medium`}>No previous assessments on record yet.</p>
            <p className={`text-xs ${theme.textMuted} mt-1`}>
              Start an AICTE or UGC pre-assessment above to generate your first compliance report.
            </p>
          </div>
        ) : (
          <div className={`rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`${theme.cardMuted} ${theme.textMuted} uppercase tracking-wider font-semibold border-b ${theme.borderSubtle}`}>
                  <tr>
                    <th className="px-5 py-3.5">Audit Date</th>
                    <th className="px-5 py-3.5">Module</th>
                    <th className="px-5 py-3.5">Compliance Score</th>
                    <th className="px-5 py-3.5">Statutory Status</th>
                    <th className="px-5 py-3.5">Satisfied / Total</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.borderSubtle}`}>
                  {history.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => onViewAssessment(item)}
                      className={`hover:${theme.cardMuted} transition-colors cursor-pointer`}
                    >
                      <td className={`px-5 py-3.5 font-mono ${theme.textMuted}`}>
                        {new Date(item.timestamp || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-medium">
                        <span className={`inline-flex items-center gap-1.5 font-serif font-bold text-sm ${theme.textHeading}`}>
                          {item.moduleType === 'aicte' ? (
                            <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
                          ) : (
                            <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          )}
                          {item.moduleType.toUpperCase()} Approval
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.complianceScore === 100
                              ? 'text-emerald-600'
                              : item.complianceScore >= 80
                                ? 'text-amber-600'
                                : 'text-rose-600'
                          }`}
                        >
                          {item.complianceScore}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            item.overallStatus === 'Satisfied'
                              ? theme.badgeSatisfied
                              : item.overallStatus === 'Substantial Compliance'
                                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                : theme.badgeDeficient
                          }`}
                        >
                          {item.overallStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <span className="text-emerald-600 font-bold">{item.satisfiedCount}</span> / {item.totalCriteria}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewAssessment(item);
                            }}
                            className={`p-1.5 rounded-lg border ${theme.borderSubtle} ${theme.cardMuted} hover:${theme.cardBg} transition-colors cursor-pointer`}
                            title="View Full Assessment Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {item.id && (
                            <button
                              type="button"
                              onClick={(e) => handleDelete(item.id!, e)}
                              disabled={deletingId === item.id}
                              className={`p-1.5 rounded-lg border ${theme.borderSubtle} ${theme.cardMuted} hover:bg-rose-900/20 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer`}
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
