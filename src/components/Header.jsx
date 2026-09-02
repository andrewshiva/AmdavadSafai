import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Menu, Sparkles, BookOpen } from 'lucide-react';
import SocialMenu from './SocialMenu';
import SubscribeModal from './SubscribeModal';
import ChangelogModal from './ChangelogModal';

export const Header = ({
  activeView = 'map',
  setActiveView,
  onOpenEvents,
  onOpenBadges,
  onOpenCleanedSpots,
  onOpenRWA,
  onOpenReport
}) => {
  const { t, lang, setLanguage } = useTranslation();
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  const [karmaPoints, setKarmaPoints] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('amdavad_safai_karma_v1') || '{}');
      return data.points || 35;
    } catch {
      return 35;
    }
  });

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail && e.detail.points !== undefined) {
        setKarmaPoints(e.detail.points);
      }
    };
    window.addEventListener('amdavad-safai-karma-updated', handleUpdate);
    return () => window.removeEventListener('amdavad-safai-karma-updated', handleUpdate);
  }, []);

  return (
    <header className="header-container variant-header">
      {/* Left: Ahmedabad Safai Logo */}
      <div className="header-left">
        <button
          type="button"
          className="variant-logo-btn"
          onClick={() => setActiveView && setActiveView('map')}
          title="Ahmedabad Safai Home"
        >
          <div className="variant-logo-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
          <div className="variant-logo-text">
            <span className="logo-main-title">AHMEDABAD SAFAI</span>
            <span className="logo-sub-title">અમદાવાદ સફાઈ</span>
          </div>
        </button>
      </div>

      {/* Center: Navigation Links (Dashboard, Reports, About Us, Wards) */}
      <nav className="variant-center-nav" aria-label="Main Navigation">
        <button
          type="button"
          className={`variant-nav-link ${activeView === 'map' ? 'active' : ''}`}
          onClick={() => setActiveView && setActiveView('map')}
        >
          DASHBOARD
        </button>

        <button
          type="button"
          className={`variant-nav-link ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveView && setActiveView('list')}
        >
          REPORTS
        </button>

        <button
          type="button"
          className={`variant-nav-link ${activeView === 'about' ? 'active' : ''}`}
          onClick={() => setActiveView && setActiveView('about')}
        >
          ABOUT US
        </button>

        <button
          type="button"
          className="variant-nav-link"
          onClick={onOpenRWA}
        >
          WARDS
        </button>
      </nav>

      {/* Right: Actions, Language Toggle, Karma Pill & REPORT ISSUE CTA */}
      <div className="header-right variant-header-right">
        {/* 3-Way Language Segmented Control */}
        <div className="trilingual-toggle">
          <button
            className={`lang-segment ${lang === 'gu' ? 'active' : ''}`}
            onClick={() => setLanguage('gu')}
          >
            ગુજ
          </button>
          <button
            className={`lang-segment ${lang === 'hi' ? 'active' : ''}`}
            onClick={() => setLanguage('hi')}
          >
            हिં
          </button>
          <button
            className={`lang-segment ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        {/* Citizen Karma Points */}
        {onOpenBadges && (
          <button
            className="variant-karma-btn"
            onClick={onOpenBadges}
            title={t('my_badges')}
          >
            <span>⚡ {karmaPoints} pts</span>
          </button>
        )}

        {/* Cancel Button when in Report View or Report Issue CTA */}
        {activeView === 'report' ? (
          <button
            type="button"
            className="variant-cancel-btn"
            onClick={() => setActiveView && setActiveView('map')}
          >
            CANCEL
          </button>
        ) : (
          onOpenReport && (
            <button
              type="button"
              className="variant-report-issue-btn"
              onClick={() => (setActiveView ? setActiveView('report') : onOpenReport())}
            >
              REPORT ISSUE
            </button>
          )
        )}

        <button 
          className="lang-toggle-btn icon-only header-guide-btn" 
          onClick={() => window.open('/guide/', '_blank')}
          title={t('help_guide_title') || 'Guide'}
        >
          <BookOpen size={16} />
        </button>

        <div className="menu-wrapper">
          <button
            className="menu-toggle-btn"
            onClick={() => setIsSocialOpen(!isSocialOpen)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <SocialMenu
            isOpen={isSocialOpen}
            onClose={() => setIsSocialOpen(false)}
            onOpenSubscribe={() => setIsSubscribeOpen(true)}
            onOpenChangelog={() => setIsChangelogOpen(true)}
            onOpenAbout={() => setActiveView && setActiveView('about')}
          />
        </div>
      </div>

      {/* Modals */}
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

    </header>
  );
};

export default Header;
