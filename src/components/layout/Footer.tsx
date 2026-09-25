import React from 'react';
import { AlertTriangle, ShieldCheck, Scale, Award } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  const { style } = useTheme();

  const isDark = style === 'dark-cockpit';
  const isArchival = style === 'archival';

  const footerBg = isDark
    ? 'bg-[#030712] border-cyan-950 text-slate-300'
    : isArchival
      ? 'bg-[#0c1f38] border-amber-900/40 text-stone-300'
      : 'bg-[#0f172a] border-slate-800 text-slate-300';

  const noticeBg = isDark
    ? 'bg-[#060d1a] border-cyan-500/20 text-cyan-100'
    : isArchival
      ? 'bg-[#10243e] border-amber-500/30 text-amber-100/90'
      : 'bg-[#1e1b4b]/60 border-indigo-500/30 text-indigo-100/90';

  const accentText = isDark ? 'text-cyan-400' : isArchival ? 'text-amber-400' : 'text-indigo-400';
  const headingText = isDark ? 'text-cyan-200' : isArchival ? 'text-amber-200' : 'text-indigo-200';

  return (
    <footer className={`${footerBg} border-t text-sm mt-auto transition-colors duration-200`}>
      {/* Prominent Statutory Disclaimer Box */}
      <div className={`${noticeBg} border-y py-4 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto flex items-start gap-3.5">
          <AlertTriangle className={`w-5 h-5 ${accentText} shrink-0 mt-0.5`} />
          <div className="text-xs leading-relaxed">
            <strong className={`${headingText} font-serif text-sm font-bold block mb-0.5 tracking-wide`}>
              Statutory Pre-Assessment Notice & Legal Disclaimer:
            </strong>
            This platform is an automated compliance gap-analysis and decision support system engineered to assist educational institutions in conducting preliminary audits prior to submitting formal applications on the AICTE Portal or UGC Portal.{' '}
            <span className="font-semibold underline decoration-white/30">
              This system does not grant, promise, or replace official statutory approval, affiliation, or recognition
            </span>. Official approval under the AICTE Act 1987 or recognition under UGC Act 1956 Section 2(f) and Section 12(B) rests solely with the competent statutory councils and their designated Expert Visit/Scrutiny Committees upon physical and documentary verification.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: System info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
              <ShieldCheck className={`w-5 h-5 ${accentText}`} />
              <span>Academic Compliance</span>
            </div>
            <p className="text-xs text-stone-300 leading-normal">
              AI-Based Academic Performance and Approval Eligibility Analysis System for Higher Educational Institutions (HEIs) and Technical Colleges.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
              <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
              <span>Regulatory DB: Active Sync</span>
            </div>
          </div>

          {/* Col 2: Regulatory Frameworks */}
          <div className="space-y-2">
            <h4 className={`text-xs font-serif font-bold tracking-wider ${headingText} uppercase flex items-center gap-1.5`}>
              <Scale className={`w-3.5 h-3.5 ${accentText}`} />
              Regulatory Standards
            </h4>
            <ul className="text-xs space-y-1.5 text-stone-300">
              <li>AICTE Approval Process Handbook (APH)</li>
              <li>Cadre Ratio & Faculty Norms (1:15 / 1:20)</li>
              <li>UGC Act 1956 Section 2(f) Inclusion</li>
              <li>UGC Act 1956 Section 12(B) Grant Fitness</li>
              <li>NAAC Quality Benchmarks & SSR Alignment</li>
            </ul>
          </div>

          {/* Col 3: Institutional Modules */}
          <div className="space-y-2">
            <h4 className={`text-xs font-serif font-bold tracking-wider ${headingText} uppercase flex items-center gap-1.5`}>
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Audited Modules
            </h4>
            <ul className="text-xs space-y-1.5 text-stone-300">
              <li>Land Title, Conversion & Built-up Area</li>
              <li>Classrooms & Specialized Laboratory Bays</li>
              <li>Faculty Ph.D. Ratios & UGC 7th CPC Scales</li>
              <li>Digital Computing, Leased Line & DELNET</li>
              <li>Statutory Cells: Anti-Ragging, ICC, IQAC</li>
            </ul>
          </div>

          {/* Col 4: Institutional Assurance */}
          <div className="space-y-2">
            <h4 className={`text-xs font-serif font-bold tracking-wider ${headingText} uppercase`}>
              Audit Transparency
            </h4>
            <p className="text-xs text-stone-300 leading-normal">
              All compliance thresholds are stored dynamically in the central database engine and mapped directly against statutory gazette notifications.
            </p>
            <div className={`pt-2 text-[11px] ${accentText} font-mono`}>
              Database Edition: Multi-Tenant HEI Audit v2.4
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap justify-between items-center text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Academic Compliance & Regulatory Decision Support System. Developed for Educational Institutions.</p>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>AICTE APH Norms</span>
            <span>·</span>
            <span>UGC 2(f)/12(B) Guidelines</span>
            <span>·</span>
            <span>Independent Pre-Assessment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
