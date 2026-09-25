import React from 'react';
import {
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../utils/themeStyles';

interface LandingPageProps {
  onStartAssessment: (module: 'aicte' | 'ugc') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenCriteria: (type: 'aicte' | 'ugc') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAssessment,
  onOpenAuth,
  onOpenCriteria,
}) => {
  const { user } = useAuth();
  const { style, isDark, mode } = useTheme();
  const theme = getThemeClasses(mode || style);

  const isArchival = style === 'archival';

  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col font-sans transition-colors duration-200`}>
      {/* Hero Section */}
      <section className={`relative overflow-hidden py-16 lg:py-24 ${theme.heroGradient}`}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Institutional Kicker (Zero-Pill Discipline) */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-600' : 'text-indigo-600'}`} />
            <span className={isDark ? 'text-cyan-400' : isArchival ? 'text-amber-800' : 'text-indigo-600'}>
              Statutory Academic Accreditation & Compliance Intelligence
            </span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-serif font-bold ${theme.textHeading} tracking-tight leading-[1.15] max-w-4xl mx-auto text-balance`}>
            Academic Performance & Approval Eligibility Analysis System
          </h1>

          <p className={`mt-6 text-base sm:text-lg ${theme.textBody} max-w-3xl mx-auto leading-relaxed`}>
            Empowering technical colleges and universities to rigorously audit institutional readiness against statutory{' '}
            <span className={`font-semibold underline ${isDark ? 'text-cyan-300 decoration-cyan-500/50' : isArchival ? 'text-[#0c1f38] decoration-amber-500/50' : 'text-indigo-600 decoration-indigo-400/50'}`}>
              AICTE Approval Process Handbook (APH) norms
            </span>{' '}
            and{' '}
            <span className={`font-semibold underline ${isDark ? 'text-emerald-400 decoration-emerald-500/50' : 'text-emerald-700 decoration-emerald-500/50'}`}>
              UGC Section 2(f) & 12(B) recognition standards
            </span>.
          </p>

          {/* Statutory Pre-Assessment Callout */}
          <div className={`mt-8 max-w-2xl mx-auto p-4 rounded-xl ${theme.noticeBanner} text-xs flex items-start gap-3.5 text-left shadow-sm`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
            <p className="leading-relaxed">
              <strong className={`font-serif font-bold tracking-wide ${isDark ? 'text-cyan-300' : isArchival ? 'text-amber-900' : 'text-indigo-950'}`}>
                Statutory Regulatory Notice:
              </strong>{' '}
              This platform serves as an independent pre-assessment audit and decision support system. It does not replace or grant official AICTE council approval or UGC recognition orders, which remain within the sole constitutional prerogative of statutory scrutiny committees upon physical verification.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={() => onStartAssessment('aicte')}
              className={`px-6 py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                  : isArchival
                    ? 'bg-[#0c1f38] hover:bg-[#162e52] text-amber-50 border border-amber-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Launch AICTE Assessment</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </button>

            <button
              onClick={() => onStartAssessment('ugc')}
              className={`px-6 py-3.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-[#15803d] hover:bg-[#166534] text-white border border-emerald-600/30'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Launch UGC 2(f)/12(B) Assessment</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </button>

            {!user && (
              <button
                onClick={() => onOpenAuth('register')}
                className={`px-6 py-3.5 rounded-xl border font-semibold text-sm shadow-sm transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : isArchival
                      ? 'bg-white hover:bg-stone-50 border-stone-300 text-stone-800'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                Register Institution
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className={`mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t ${theme.borderSubtle} text-left`}>
            <div className={`p-4 rounded-xl ${theme.cardBg} border ${theme.borderSubtle}`}>
              <div className={`text-2xl font-serif font-bold ${isDark ? 'text-cyan-400' : isArchival ? 'text-[#0c1f38]' : 'text-indigo-600'}`}>15+</div>
              <div className={`text-xs ${theme.textMuted} mt-1`}>AICTE APH Benchmarks</div>
            </div>
            <div className={`p-4 rounded-xl ${theme.cardBg} border ${theme.borderSubtle}`}>
              <div className={`text-2xl font-serif font-bold ${isDark ? 'text-emerald-400' : isArchival ? 'text-[#0c1f38]' : 'text-indigo-600'}`}>14+</div>
              <div className={`text-xs ${theme.textMuted} mt-1`}>UGC 2(f)/12(B) Criteria</div>
            </div>
            <div className={`p-4 rounded-xl ${theme.cardBg} border ${theme.borderSubtle}`}>
              <div className={`text-2xl font-serif font-bold ${theme.textHeading}`}>100%</div>
              <div className={`text-xs ${theme.textMuted} mt-1`}>Database-Driven Rules</div>
            </div>
            <div className={`p-4 rounded-xl ${theme.cardBg} border ${theme.borderSubtle}`}>
              <div className={`text-2xl font-serif font-bold ${theme.textHeading}`}>Instant</div>
              <div className={`text-xs ${theme.textMuted} mt-1`}>Deficiency & Gap Reports</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Module Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-2xl sm:text-4xl font-serif font-bold ${theme.textHeading} tracking-tight`}>
            Two Specialized Compliance Analysis Engines
          </h2>
          <p className={`mt-2 text-sm ${theme.textMuted} max-w-2xl mx-auto`}>
            Select the statutory regulatory track matching your institution's charter and accreditation goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: AICTE Module */}
          <div className={`rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} hover:border-indigo-500/50 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}>
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm ${
                isDark ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : isArchival ? 'bg-[#0c1f38] text-amber-300' : 'bg-indigo-600 text-white'
              }`}>
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-xl font-serif font-bold ${theme.textHeading}`}>AICTE Approval Assessment</h3>
                <span className={`text-xs ${theme.textMuted} font-medium`}>
                  Technical HEIs · APH Norms
                </span>
              </div>
              <p className={`text-xs ${theme.textBody} mb-6 leading-relaxed`}>
                Evaluates institutional eligibility for New Technical Institutions, Extension of Approval (EoA), and Intake Expansion under the AICTE Approval Process Handbook.
              </p>

              <div className={`space-y-2.5 mb-6 text-xs ${theme.textBody}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
                  <span>Land, Freehold Ownership & Built-up Instructional Area</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
                  <span>Faculty-Student Ratio (1:15/1:20), Cadre Balance & Ph.D. Principal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
                  <span>Specialized Laboratories, Workshop Bays & ICT Classrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
                  <span>Central Library Volumes, Titles, IEEE/DELNET E-Journals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
                  <span>Fire Safety NOC, Divyangjan Ramps, Anti-Ragging & Joint FDR</span>
                </div>
              </div>
            </div>

            <div className={`pt-6 border-t ${theme.borderSubtle} flex items-center justify-between`}>
              <button
                onClick={() => onOpenCriteria('aicte')}
                className={`text-xs font-semibold underline-offset-4 hover:underline cursor-pointer ${
                  isDark ? 'text-cyan-400' : isArchival ? 'text-[#0c1f38]' : 'text-indigo-600'
                }`}
              >
                View 15 AICTE Handbook Criteria
              </button>
              <button
                onClick={() => onStartAssessment('aicte')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                    : isArchival
                      ? 'bg-[#0c1f38] hover:bg-[#162e52] text-amber-50 border border-amber-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                Start AICTE Audit <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: UGC Module */}
          <div className={`rounded-2xl ${theme.cardBg} border ${theme.borderSubtle} hover:border-emerald-500/50 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}>
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center mb-5 shadow-sm">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-xl font-serif font-bold ${theme.textHeading}`}>UGC Section 2(f) & 12(B) Recognition</h3>
                <span className={`text-xs ${theme.textMuted} font-medium`}>
                  Affiliated & Autonomous · Act 1956
                </span>
              </div>
              <p className={`text-xs ${theme.textBody} mb-6 leading-relaxed`}>
                Assesses institutional fitness for UGC Section 2(f) listing and Section 12(B) central financial development grants eligibility.
              </p>

              <div className={`space-y-2.5 mb-6 text-xs ${theme.textBody}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Registered Society/Trust (Act 1860) & Non-Profit Memorandum</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Permanent Affiliation OR 5+ Years Continuous University Standing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>80% NET/SET/Ph.D. Qualified Faculty & UGC 7th CPC Scales</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>EPF Social Security, Girls Common Room & INFLIBNET N-LIST</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NAAC Accreditation Status & Joint Endowment Reserve Fund</span>
                </div>
              </div>
            </div>

            <div className={`pt-6 border-t ${theme.borderSubtle} flex items-center justify-between`}>
              <button
                onClick={() => onOpenCriteria('ugc')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline-offset-4 hover:underline cursor-pointer"
              >
                View 14 UGC Recognition Criteria
              </button>
              <button
                onClick={() => onStartAssessment('ugc')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-600/30"
              >
                Start UGC Audit <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section className={`py-16 ${theme.cardMuted} border-y ${theme.borderSubtle}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-2xl sm:text-4xl font-serif font-bold ${theme.textHeading} tracking-tight`}>
              End-to-End Compliance Verification Workflow
            </h2>
            <p className={`mt-2 text-sm ${theme.textMuted} max-w-2xl mx-auto`}>
              How the platform compares institutional parameters against stored statutory criteria in the central database.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} shadow-sm`}>
              <div className={`font-serif text-2xl font-bold mb-2 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`}>
                01.
              </div>
              <h4 className={`text-base font-serif font-bold ${theme.textHeading} mb-1.5`}>Data Input Audit</h4>
              <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                Submit comprehensive institutional parameters: land, built-up areas, classrooms, faculty numbers, cadre ratios, library volumes, and legal documents.
              </p>
            </div>

            <div className={`p-6 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} shadow-sm`}>
              <div className={`font-serif text-2xl font-bold mb-2 ${theme.textHeading}`}>
                02.
              </div>
              <h4 className={`text-base font-serif font-bold ${theme.textHeading} mb-1.5`}>Rule Engine Evaluation</h4>
              <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                Backend REST APIs evaluate each submitted field against dynamic threshold criteria stored in the database, calculating exact mathematical ratios.
              </p>
            </div>

            <div className={`p-6 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} shadow-sm`}>
              <div className={`font-serif text-2xl font-bold mb-2 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`}>
                03.
              </div>
              <h4 className={`text-base font-serif font-bold ${theme.textHeading} mb-1.5`}>Deficiency Detection</h4>
              <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                Every criterion is marked "Criteria Satisfied" or "Criteria Not Satisfied", detailing exact deficits (e.g. land shortfall, FSR overages, missing NOCs).
              </p>
            </div>

            <div className={`p-6 rounded-xl ${theme.cardBg} border ${theme.borderSubtle} shadow-sm`}>
              <div className="font-serif text-2xl font-bold text-emerald-600 mb-2">
                04.
              </div>
              <h4 className={`text-base font-serif font-bold ${theme.textHeading} mb-1.5`}>Actionable Roadmap</h4>
              <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                Targeted improvement suggestions with prioritized timelines (Critical / High / Medium) to rectify gaps prior to formal statutory inspection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`p-8 sm:p-12 rounded-3xl shadow-2xl ${
          isDark
            ? 'bg-gradient-to-r from-[#030712] via-[#091124] to-[#030712] border border-cyan-500/30 text-white'
            : isArchival
              ? 'bg-gradient-to-r from-[#0c1f38] via-[#122845] to-[#0c1f38] border border-amber-600/30 text-stone-100'
              : 'bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border border-indigo-500/30 text-white'
        }`}>
          <h3 className="text-2xl sm:text-4xl font-serif font-bold mb-3 text-white">
            Ready to Assess Your College's Approval Readiness?
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
            Run an automated audit in under 5 minutes with our pre-populated institutional demo templates, or evaluate your live campus metrics.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onStartAssessment('aicte')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer ${
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                  : isArchival
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              Evaluate AICTE Criteria
            </button>
            <button
              onClick={() => onStartAssessment('ugc')}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md transition-all cursor-pointer border border-emerald-500/40"
            >
              Evaluate UGC 2(f)/12(B)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
