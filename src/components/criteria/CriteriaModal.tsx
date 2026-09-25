import React, { useState, useEffect } from 'react';
import { X, BookOpen, ShieldCheck, FileCheck2, Search, CheckCircle2, AlertOctagon, Scale } from 'lucide-react';
import { CriterionDoc } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'aicte' | 'ugc';
}

export const CriteriaModal: React.FC<CriteriaModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'aicte',
}) => {
  const { isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<'aicte' | 'ugc'>(defaultType);
  const [criteria, setCriteria] = useState<CriterionDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
      loadCriteria(selectedType);
    }
  }, [isOpen, selectedType]);

  const loadCriteria = async (type: 'aicte' | 'ugc') => {
    setLoading(true);
    try {
      const res = await api.getCriteria(type);
      setCriteria(res.criteria);
    } catch (err) {
      console.error('Failed to load statutory criteria:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(criteria.map(c => c.category)))];

  const filteredCriteria = criteria.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.statutoryReference.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border ${
        isDark ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark
            ? 'bg-[#070b14] border-slate-800 text-slate-100'
            : 'bg-[#0c1f38] border-amber-900/40 text-stone-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              isDark
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
                : 'bg-amber-600/30 text-amber-300 border-amber-500/40'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Statutory Regulatory Criteria Directory</span>
                <span className={`text-xs px-2 py-0.5 rounded font-mono border ${
                  isDark
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  Database-Backed
                </span>
              </h3>
              <p className="text-xs text-stone-300">
                Official benchmarks extracted from statutory gazettes and loaded dynamically from the central database store.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Module Switcher & Search Bar */}
        <div className={`p-4 border-b flex flex-wrap gap-3 items-center justify-between ${
          isDark ? 'bg-[#080e1c] border-slate-800' : 'bg-[#fafaf7] border-stone-200'
        }`}>
          {/* Tabs */}
          <div className={`flex p-1 rounded-lg border shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200'
          }`}>
            <button
              onClick={() => {
                setSelectedType('aicte');
                setSelectedCategory('All');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedType === 'aicte'
                  ? isDark
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-[#0c1f38] text-amber-100 shadow'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-200' : 'text-amber-400'}`} />
              AICTE Approval Criteria ({selectedType === 'aicte' ? criteria.length : 15})
            </button>
            <button
              onClick={() => {
                setSelectedType('ugc');
                setSelectedCategory('All');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedType === 'ugc'
                  ? 'bg-emerald-700 text-white shadow'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-200" />
              UGC 2(f) / 12(B) Criteria ({selectedType === 'ugc' ? criteria.length : 14})
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search criteria or regulation..."
              className={`w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs transition-colors focus:outline-none ${
                isDark
                  ? 'bg-[#0d162b] border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400'
                  : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-[#0c1f38]'
              }`}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className={`px-4 py-2 border-b flex gap-2 overflow-x-auto text-xs ${
          isDark ? 'bg-[#091124] border-slate-800' : 'bg-[#f5f2ea] border-stone-200'
        }`}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? isDark
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#0c1f38] text-amber-100 font-semibold shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 ${
          isDark ? 'bg-[#070b14]' : 'bg-[#fafaf7]'
        }`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <span className={`w-8 h-8 border-2 ${isDark ? 'border-cyan-400' : 'border-amber-600'} border-t-transparent rounded-full animate-spin mb-3`}></span>
              <p className="text-sm">Fetching statutory criteria from backend database...</p>
            </div>
          ) : filteredCriteria.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm">
              No criteria matched your search filter.
            </div>
          ) : (
            filteredCriteria.map((crit, idx) => (
              <div
                key={crit.id || idx}
                className={`p-4 rounded-xl border shadow-sm transition-colors ${
                  isDark
                    ? 'bg-[#0f172a] border-slate-800 text-slate-200 hover:border-slate-700'
                    : 'bg-white border-stone-200 text-stone-900 hover:border-stone-300'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                      isDark ? 'bg-slate-800 text-cyan-300 border-slate-700' : 'bg-stone-100 text-stone-800 border-stone-300'
                    }`}>
                      {crit.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {crit.category}
                    </span>
                    {crit.isMandatory ? (
                      <span className={`text-[11px] px-2 py-0.5 rounded border flex items-center gap-1 font-semibold ${
                        isDark ? 'bg-rose-950/80 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}>
                        <AlertOctagon className="w-3 h-3 text-rose-500" />
                        Mandatory Statutory
                      </span>
                    ) : (
                      <span className={`text-[11px] px-2 py-0.5 rounded border ${
                        isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}>
                        Institutional Quality
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] flex items-center gap-1 font-mono ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                    <Scale className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-amber-700'}`} />
                    <span>{crit.statutoryReference}</span>
                  </div>
                </div>

                <h4 className={`text-base font-serif font-bold mb-1.5 ${isDark ? 'text-white' : 'text-[#0c1f38]'}`}>
                  {crit.title}
                </h4>
                <p className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                  {crit.description}
                </p>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t text-xs ${
                  isDark ? 'border-slate-800' : 'border-stone-200'
                }`}>
                  <div className={`p-2.5 rounded-lg border ${
                    isDark ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}>
                    <span className="block text-[11px] font-semibold mb-0.5 opacity-90">Statutory Benchmark Rule:</span>
                    <span className="font-semibold flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {crit.benchmarkRule}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-lg border ${
                    isDark ? 'bg-[#091124] border-slate-800 text-slate-300' : 'bg-[#fafaf7] border-stone-200 text-stone-700'
                  }`}>
                    <span className={`block text-[11px] font-semibold mb-0.5 ${isDark ? 'text-slate-400' : 'text-stone-600'}`}>
                      Compliance Advisory / Remediation:
                    </span>
                    <span className="leading-relaxed">{crit.improvementTip}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex justify-between items-center text-xs px-6 ${
          isDark ? 'bg-[#080e1c] border-slate-800 text-slate-400' : 'bg-[#f5f2ea] border-stone-200 text-stone-600'
        }`}>
          <span className="font-mono">Total Loaded Criteria: {criteria.length} statutory requirements</span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              isDark
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500/30'
                : 'bg-[#0c1f38] hover:bg-[#162e52] text-amber-100 border-amber-500/30'
            }`}
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
