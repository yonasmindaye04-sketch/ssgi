import React, { useState, useCallback } from 'react';
import { MarketingHeader } from '../MarketingHeader';
import { MarketingFooter } from '../MarketingFooter';
import { FAQPage } from '../FAQPage';
import { FeesPage } from '../FeesPage';
import { AboutPage } from '../AboutPage';
import { CaseStudiesPage } from '../CaseStudiesPage';
import { PrivacyPage } from '../PrivacyPage';
import { TermsPage } from '../TermsPage';
import { useTheme } from '../theme/ThemeContext';
import { YekisStoryLanding } from './YekisStoryLanding';
import { YekisPlatformAuth, PlatformRoleChoice } from './YekisPlatformAuth';
import { UserRoleOption } from '../utils/yekisMath';

export type MarketingPageRoute =
  | 'home'
  | 'faq'
  | 'fees'
  | 'about'
  | 'case-studies'
  | 'privacy'
  | 'terms';

export const YekisCorporateStage: React.FC = () => {
  const { theme } = useTheme();

  const [currentPage, setCurrentPage] = useState<MarketingPageRoute>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<PlatformRoleChoice>('CLIENT');

  const handleNavigate = useCallback((page: string) => {
    const normalized = (page || 'home') as MarketingPageRoute;
    setShowAuth(false);
    setCurrentPage(normalized);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleStart = useCallback(
    (mode: 'login' | 'register', role: UserRoleOption = 'CLIENT') => {
      setAuthMode(mode);
      setAuthRole(role === 'FREELANCER' ? 'FREELANCER' : 'CLIENT');
      setShowAuth(true);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    },
    []
  );

  if (showAuth) {
    return (
      <YekisPlatformAuth
        initialMode={authMode}
        initialRole={authRole}
        onBackToHome={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div
      className={`yk-neb-shell ${theme === 'light' ? 'yk-neb-light' : 'yk-neb-dark'}`}
      data-theme={theme}
      data-page={currentPage}
    >
      {/* Authentic Original Yekis Header with FAQ, Fees, About, Case Studies Subpages */}
      <MarketingHeader
        onNavigate={handleNavigate}
        onStart={(mode) => handleStart(mode, 'CLIENT')}
      />

      <main className="yk-subpage-main">
        {currentPage === 'home' && (
          <YekisStoryLanding
            onNavigate={handleNavigate}
            onStart={handleStart}
          />
        )}
        {currentPage === 'faq' && (
          <FAQPage
            onNavigate={handleNavigate}
            onStart={(mode) => handleStart(mode, 'CLIENT')}
          />
        )}
        {currentPage === 'fees' && (
          <FeesPage
            onNavigate={handleNavigate}
            onStart={(mode) => handleStart(mode, 'CLIENT')}
          />
        )}
        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onStart={(mode) => handleStart(mode, 'CLIENT')}
          />
        )}
        {currentPage === 'case-studies' && (
          <CaseStudiesPage
            onNavigate={handleNavigate}
            onStart={(mode) => handleStart(mode, 'CLIENT')}
          />
        )}
        {currentPage === 'privacy' && (
          <PrivacyPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'terms' && (
          <TermsPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Authentic Old Yekis Footer Section (Frosted Card + Giant 'Yekis' Wordmark Below) */}
      <MarketingFooter onNavigate={handleNavigate} />
    </div>
  );
};
