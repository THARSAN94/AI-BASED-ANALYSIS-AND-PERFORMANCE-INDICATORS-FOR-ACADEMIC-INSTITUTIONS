import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { getThemeClasses } from './utils/themeStyles';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { AicteAssessmentForm } from './components/forms/AicteAssessmentForm';
import { UgcAssessmentForm } from './components/forms/UgcAssessmentForm';
import { AssessmentResultView } from './components/results/AssessmentResultView';
import { AuthModal } from './components/auth/AuthModal';
import { CriteriaModal } from './components/criteria/CriteriaModal';
import { AssessmentResult } from './types';

function MainApp() {
  const { user, loading } = useAuth();
  const { style, mode } = useTheme();
  const theme = getThemeClasses(mode || style);

  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeAssessment, setActiveAssessment] = useState<AssessmentResult | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [criteriaType, setCriteriaType] = useState<'aicte' | 'ugc'>('aicte');

  // Track user ID across auth changes to guarantee account isolation
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const currentUserId = user ? user.id : null;

    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== currentUserId) {
      // User switched account or logged out: unconditionally wipe active assessment report
      setActiveAssessment(null);

      if (user) {
        // Logged in as a different user -> always redirect to fresh user dashboard
        setCurrentView('dashboard');
      } else {
        // Logged out -> redirect to landing page
        setCurrentView('landing');
      }
    } else if (prevUserIdRef.current === undefined && user && currentView === 'landing') {
      // First initialization when user is already logged in
      setCurrentView('dashboard');
    }

    prevUserIdRef.current = currentUserId;
  }, [user?.id]);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenCriteria = (type: 'aicte' | 'ugc' = 'aicte') => {
    setCriteriaType(type);
    setCriteriaModalOpen(true);
  };

  const handleStartAssessment = (module: 'aicte' | 'ugc') => {
    setCurrentView(module);
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setActiveAssessment(result);
    setCurrentView('result');
  };

  const handleViewHistoricalAssessment = (result: AssessmentResult) => {
    setActiveAssessment(result);
    setCurrentView('result');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.pageBg} flex flex-col items-center justify-center`}>
        <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></span>
        <h2 className={`text-base font-serif font-bold ${theme.textHeading} text-lg`}>
          Initializing Academic Compliance System...
        </h2>
        <p className={`text-xs ${theme.textMuted} mt-1`}>
          Connecting to statutory criteria database engine
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col font-sans transition-colors duration-200`}>
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'dashboard' && !user) {
            handleOpenAuth('login');
          } else {
            setCurrentView(view);
          }
        }}
        onOpenAuth={handleOpenAuth}
        onOpenCriteria={handleOpenCriteria}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartAssessment={handleStartAssessment}
            onOpenAuth={handleOpenAuth}
            onOpenCriteria={handleOpenCriteria}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            key={user?.id || 'guest_dash'}
            onSelectModule={handleStartAssessment}
            onViewAssessment={handleViewHistoricalAssessment}
            onOpenCriteria={handleOpenCriteria}
          />
        )}

        {currentView === 'history' && (
          <Dashboard
            key={`history_${user?.id || 'guest'}`}
            onSelectModule={handleStartAssessment}
            onViewAssessment={handleViewHistoricalAssessment}
            onOpenCriteria={handleOpenCriteria}
          />
        )}

        {currentView === 'aicte' && (
          <AicteAssessmentForm
            key={user?.id || 'guest_aicte'}
            onAssessmentComplete={handleAssessmentComplete}
            onCancel={() => setCurrentView(user ? 'dashboard' : 'landing')}
          />
        )}

        {currentView === 'ugc' && (
          <UgcAssessmentForm
            key={user?.id || 'guest_ugc'}
            onAssessmentComplete={handleAssessmentComplete}
            onCancel={() => setCurrentView(user ? 'dashboard' : 'landing')}
          />
        )}

        {currentView === 'result' && activeAssessment && (
          <AssessmentResultView
            key={activeAssessment.id || `${user?.id || 'guest'}_${activeAssessment.timestamp || 'current'}`}
            assessment={activeAssessment}
            onStartNew={(mod) => {
              setActiveAssessment(null);
              setCurrentView(mod || 'aicte');
            }}
            onBackToDashboard={() => {
              setActiveAssessment(null);
              setCurrentView(user ? 'dashboard' : 'landing');
            }}
            onOpenAuth={handleOpenAuth}
          />
        )}
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          setAuthModalOpen(false);
          setCurrentView('dashboard');
        }}
      />

      {/* Criteria Reference Directory Modal */}
      <CriteriaModal
        isOpen={criteriaModalOpen}
        onClose={() => setCriteriaModalOpen(false)}
        defaultType={criteriaType}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
