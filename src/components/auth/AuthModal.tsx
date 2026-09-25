import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Building, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../utils/themeStyles';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const { style, isDark, mode: themeMode } = useTheme();
  const theme = getThemeClasses(themeMode || style);

  const isArchival = style === 'archival';

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setSubmitting(false);
          return;
        }
        const result = await register({
          name,
          email,
          collegeName,
          password,
          confirmPassword,
        });

        // Upon registration, show success notification and prompt user to login with mail and password
        setSuccessMessage(result.message || 'Registration successful! Please sign in with your email and password.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setMode('login');
    setEmail('admin@institution.edu.in');
    setPassword('password123');
    setError(null);
    setSuccessMessage(null);
  };

  const activeTabClass = isDark
    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
    : isArchival
      ? 'bg-[#0c1f38] text-amber-100 shadow-sm'
      : 'bg-indigo-600 text-white shadow-sm';

  const submitButtonClass = isDark
    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-500/20'
    : isArchival
      ? 'bg-[#0c1f38] hover:bg-[#162e52] text-amber-100 border border-amber-500/30'
      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className={`${theme.cardBg} border ${theme.borderSubtle} w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative transition-colors duration-200`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${theme.textMuted} hover:${theme.textHeading} p-1.5 rounded-lg ${theme.cardMuted} transition-colors z-10 cursor-pointer`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className={`flex border-b ${theme.borderSubtle} ${theme.cardMuted} p-1.5`}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors rounded-lg cursor-pointer ${
              mode === 'login'
                ? activeTabClass
                : `${theme.textMuted} hover:${theme.textHeading}`
            }`}
          >
            Sign In to Institution
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors rounded-lg cursor-pointer ${
              mode === 'register'
                ? activeTabClass
                : `${theme.textMuted} hover:${theme.textHeading}`
            }`}
          >
            Register Institution
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5 text-center">
            <h3 className={`text-2xl font-serif font-bold ${theme.textHeading}`}>
              {mode === 'login' ? 'Institutional Sign In' : 'Create Institution Account'}
            </h3>
            <p className={`text-xs ${theme.textMuted} mt-1`}>
              {mode === 'login'
                ? 'Enter your institutional email and password to access the compliance dashboard.'
                : 'Register your college or university to access AICTE and UGC statutory audit modules.'}
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className={`block text-xs font-semibold ${theme.textHeading} mb-1`}>
                    Authorized Official / Registrar Name
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 absolute left-3 top-2.5 ${theme.textMuted}`} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Sharma, Principal"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 ${theme.cardBg} border ${theme.borderSubtle} rounded-lg text-xs ${theme.textHeading} placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${theme.textHeading} mb-1`}>
                    Institution / College Full Name
                  </label>
                  <div className="relative">
                    <Building className={`w-4 h-4 absolute left-3 top-2.5 ${theme.textMuted}`} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. National Institute of Technology"
                      value={collegeName}
                      onChange={e => setCollegeName(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 ${theme.cardBg} border ${theme.borderSubtle} rounded-lg text-xs ${theme.textHeading} placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={`block text-xs font-semibold ${theme.textHeading} mb-1`}>
                Official Email Address
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3 top-2.5 ${theme.textMuted}`} />
                <input
                  type="email"
                  required
                  placeholder="admin@institution.edu.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 ${theme.cardBg} border ${theme.borderSubtle} rounded-lg text-xs ${theme.textHeading} placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold ${theme.textHeading} mb-1`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3 top-2.5 ${theme.textMuted}`} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 ${theme.cardBg} border ${theme.borderSubtle} rounded-lg text-xs ${theme.textHeading} placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className={`block text-xs font-semibold ${theme.textHeading} mb-1`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3 top-2.5 ${theme.textMuted}`} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 ${theme.cardBg} border ${theme.borderSubtle} rounded-lg text-xs ${theme.textHeading} placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full mt-2 py-2.5 px-4 font-semibold text-xs rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${submitButtonClass}`}
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In & Enter Dashboard' : 'Complete Registration'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Demo account quick login helper */}
          <div className={`mt-5 pt-4 border-t ${theme.borderSubtle} flex flex-col gap-2`}>
            <button
              type="button"
              onClick={handleFillDemo}
              className={`w-full py-2 px-3 rounded-lg ${theme.cardMuted} hover:${theme.cardBg} ${theme.textBody} text-xs font-medium border ${theme.borderSubtle} transition-colors flex items-center justify-center gap-1.5 cursor-pointer`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : isArchival ? 'text-amber-700' : 'text-indigo-600'}`} />
              <span>Click to auto-fill sample Demo Institutional Credentials</span>
            </button>

            <p className={`text-[11px] ${theme.textMuted} text-center font-mono`}>
              Demo: admin@institution.edu.in / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
