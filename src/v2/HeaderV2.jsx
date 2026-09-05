import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { Menu, BookOpen, X, ChevronRight, LogOut, User, Mail, FileText, Sparkles } from 'lucide-react';
import SubscribeModal from '../components/SubscribeModal';
import ChangelogModal from '../components/ChangelogModal';

export const HeaderV2 = ({
  activeView = 'about',
  setActiveView,
  currentUser,
  onOpenEvents,
  onOpenBadges,
  onOpenRWA,
  onOpenLogin,
  onLogout,
  onOpenVideo,
  onOpenAIAssistant,
  onSwitchVersion
}) => {
  const { t, lang, setLanguage } = useTranslation();
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const navLabels = {
    about: lang === 'gu' ? 'અમારા વિશે' : lang === 'hi' ? 'हमारे बारे में' : 'ABOUT US',
    dashboard: lang === 'gu' ? 'ડેશબોર્ડ' : lang === 'hi' ? 'डैशबोर्ड' : 'DASHBOARD',
    reports: lang === 'gu' ? 'ફરિયાદો' : lang === 'hi' ? 'शिकायतें' : 'REPORTS',
    wards: lang === 'gu' ? 'વોર્ડ વિગતો' : lang === 'hi' ? 'वार्ड प्रोफाइल' : 'WARDS',
    drives: lang === 'gu' ? 'સફાઈ અભિયાન' : lang === 'hi' ? 'सफाई अभियान' : 'DRIVES',
    stats: lang === 'gu' ? 'આંકડા' : lang === 'hi' ? 'आंकड़े' : 'STATISTICS',
    impact: lang === 'gu' ? 'ઇમ્પેક્ટ' : lang === 'hi' ? 'प्रभाव' : 'IMPACT',
    signin: lang === 'gu' ? 'સાઇન ઇન' : lang === 'hi' ? 'साइन इन' : 'SIGN IN',
  };

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

  const handleReportClick = () => {
    if (setActiveView) setActiveView('report');
  };

  const handleNavClick = (viewName) => {
    if (setActiveView) setActiveView(viewName);
    setIsMobileDrawerOpen(false);
  };

  return (
    <header className="header-container variant-header">
      {/* Left: Ahmedabad Safai Logo */}
      <div className="header-left variant-header-left">
        <button
          type="button"
          className="variant-logo-btn"
          onClick={() => handleNavClick('about')}
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
            <span className="logo-main-title">
              {lang === 'gu' ? 'અમદાવાદ સફાઈ' : lang === 'hi' ? 'अहमदाबाद सफाई' : 'AHMEDABAD SAFAI'}
            </span>
            <span className="logo-sub-title">
              {lang === 'gu' ? 'નાગરિક સ્વચ્છતા પોર્ટલ' : lang === 'hi' ? 'नागरिक स्वच्छता पोर्टल' : 'CIVIC CLEANLINESS PORTAL'}
            </span>
          </div>
        </button>

      </div>

      {/* Center: Navigation Links (About Us is always visible; Dashboard, Reports, Wards, Drives, Impact require login) */}
      <nav className="variant-center-nav header-desktop-only" aria-label="Main Navigation">
        <button
          type="button"
          className={`variant-nav-link ${activeView === 'about' ? 'active' : ''}`}
          onClick={() => handleNavClick('about')}
        >
          <span>{navLabels.about}</span>
        </button>

        <button
          type="button"
          className={`variant-nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <span>{navLabels.dashboard}</span>
        </button>

        <button
          type="button"
          className={`variant-nav-link ${activeView === 'reports' ? 'active' : ''}`}
          onClick={() => handleNavClick('reports')}
        >
          <span>{navLabels.reports}</span>
        </button>

        <button
          type="button"
          className={`variant-nav-link ${activeView === 'wards' ? 'active' : ''}`}
          onClick={() => handleNavClick('wards')}
        >
          <span>{navLabels.wards}</span>
        </button>

        <button
          type="button"
          className={`variant-nav-link ${activeView === 'drives' ? 'active' : ''}`}
          onClick={() => handleNavClick('drives')}
        >
          <span>{navLabels.drives}</span>
          <span className="events-count-badge">5</span>
        </button>

        <button
          type="button"
          className={`variant-nav-link ${activeView === 'impact' ? 'active' : ''}`}
          onClick={() => handleNavClick('impact')}
        >
          <span>{navLabels.impact}</span>
        </button>

        <button
          type="button"
          className={`variant-nav-link ${activeView === 'stats' ? 'active' : ''}`}
          onClick={() => handleNavClick('stats')}
        >
          <span>{navLabels.stats}</span>
        </button>
      </nav>

      {/* Right: Actions (Desktop & Mobile) */}
      <div className="header-right variant-header-right">
        {/* Desktop Language Switcher */}
        <div className="trilingual-toggle header-desktop-only">
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

        {/* Subtle Section Divider */}
        <div className="variant-nav-divider header-desktop-only" />

        {/* AI Assistant Button */}
        {onOpenAIAssistant && (
          <button
            type="button"
            className="variant-ai-btn header-desktop-only"
            onClick={onOpenAIAssistant}
            title="AmdavadSafai AI Assistant"
          >
            <Sparkles size={13} />
            <span className="variant-ai-label">AI Assistant</span>
          </button>
        )}

        {/* Desktop Karma Points */}
        {currentUser && onOpenBadges && (
          <button
            className="variant-karma-btn header-desktop-only"
            onClick={onOpenBadges}
            title={t('my_badges')}
          >
            <span>⚡ {karmaPoints} pts</span>
          </button>
        )}

        {/* Desktop User Avatar & Sign Out */}
        {currentUser ? (
          <div className="variant-user-auth-group header-desktop-only">
            <div className="variant-user-avatar-wrap">
              <button
                type="button"
                className="variant-avatar-circle-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                title={currentUser.name || 'Citizen Profile'}
              >
                <span>{currentUser.initials || 'JS'}</span>
              </button>

              {isUserMenuOpen && (
                <div className="variant-user-dropdown">
                  <div className="user-dropdown-info">
                    <strong>{currentUser.name || 'Amdavadi Citizen'}</strong>
                    <small>{currentUser.role === 'officer' ? 'AMC Sanitation Officer' : 'Active Citizen'}</small>
                  </div>
                  <hr className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsSubscribeOpen(true);
                    }}
                  >
                    <Mail size={15} />
                    <span>Monday Digest</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsChangelogOpen(true);
                    }}
                  >
                    <FileText size={15} />
                    <span>Changelog</span>
                  </button>
                  <button
                    type="button"
                    className="dropdown-item-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      window.open(`/guide/index.html?lang=${lang}`, '_blank');
                    }}
                  >
                    <BookOpen size={15} />
                    <span>{lang === 'gu' ? 'નાગરિક SOP માર્ગદર્શિકા' : lang === 'hi' ? 'नाગરિક SOP गाइड' : 'Citizen SOP Guide'}</span>
                  </button>
                  <hr className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item-btn text-danger"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Desktop Sign In Button */
          <button
            type="button"
            className="variant-signin-btn header-desktop-only"
            onClick={onOpenLogin}
            title="Sign In / Login"
          >
            <User size={13} />
            <span>{navLabels.signin}</span>
          </button>
        )}

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="variant-mobile-hamburger-btn"
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        {/* Action Button: REPORT / CANCEL */}
        {activeView === 'report' ? (
          <button
            type="button"
            className="variant-cancel-btn"
            onClick={() => handleNavClick('about')}
          >
            CANCEL
          </button>
        ) : (
          <button
            type="button"
            className="variant-report-issue-btn"
            onClick={handleReportClick}
          >
            REPORT
          </button>
        )}
      </div>

      {/* Mobile Slide-Out Navigation Drawer */}
      {isMobileDrawerOpen && ReactDOM.createPortal(
        <div className="variant-mobile-drawer-overlay" onClick={() => setIsMobileDrawerOpen(false)}>
          <div className="variant-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="variant-logo-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <span className="mobile-drawer-title">AHMEDABAD SAFAI</span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile or Login CTA */}
            {currentUser ? (
              <div className="mobile-user-card">
                <div className="mobile-user-avatar">
                  <span>{currentUser.initials || 'JS'}</span>
                </div>
                <div className="mobile-user-info">
                  <strong>{currentUser.name}</strong>
                  <span>⚡ {karmaPoints} Karma Points</span>
                </div>
                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    if (onLogout) onLogout();
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mobile-login-banner-btn"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  if (onOpenLogin) onOpenLogin();
                }}
              >
                <span>SIGN IN / LOGIN</span>
                <ChevronRight size={16} />
              </button>
            )}

            {/* Mobile Nav Links */}
            <div className="mobile-drawer-links">
              <button
                type="button"
                className={`mobile-nav-item ${activeView === 'about' ? 'active' : ''}`}
                onClick={() => handleNavClick('about')}
              >
                <span>{navLabels.about}</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
              >
                <span>{lang === 'gu' ? 'ડેશબોર્ડ (GIS નકશો)' : lang === 'hi' ? 'डैशबोर्ड (GIS मानचित्र)' : 'DASHBOARD (GIS MAP)'}</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeView === 'reports' ? 'active' : ''}`}
                onClick={() => handleNavClick('reports')}
              >
                <span>{lang === 'gu' ? 'નાગરિક ફરિયાદો' : lang === 'hi' ? 'नागरिक शिकायतें' : 'CIVIC REPORTS'}</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeView === 'wards' ? 'active' : ''}`}
                onClick={() => handleNavClick('wards')}
              >
                <span>{lang === 'gu' ? 'વોર્ડ પ્રોફાઇલ અને અધિકારીઓ' : lang === 'hi' ? 'वार्ड प्रोफाइल और अधिकारी' : 'WARD PROFILES & OFFICERS'}</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeView === 'drives' ? 'active' : ''}`}
                onClick={() => handleNavClick('drives')}
              >
                <span>{lang === 'gu' ? 'રવિવાર સફાઈ અભિયાન' : lang === 'hi' ? 'रविवार सफाई अभियान' : 'SUNDAY CLEANUP DRIVES'}</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeView === 'impact' ? 'active' : ''}`}
                onClick={() => handleNavClick('impact')}
              >
                <span>{lang === 'gu' ? 'સામુદાયિક પ્રભાવ ગેલેરી' : lang === 'hi' ? 'सामुदायिक प्रभाव गैलरी' : 'COMMUNITY IMPACT GALLERY'}</span>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${activeView === 'stats' ? 'active' : ''}`}
                onClick={() => handleNavClick('stats')}
              >
                <span>{lang === 'gu' ? 'લાઇવ આંકડા ડેશબોર્ડ' : lang === 'hi' ? 'लाइव सांख्यिकी डैशबोर्ड' : 'LIVE STATISTICS DASHBOARD'}</span>
                <ChevronRight size={16} />
              </button>

              {onOpenAIAssistant && (
                <button
                  type="button"
                  className="mobile-nav-item"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenAIAssistant();
                  }}
                  style={{ color: '#F97316' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} />
                    {lang === 'gu' ? 'સફાઈ AI સહાયક' : lang === 'hi' ? 'सफाई AI सहायक' : 'CIVIC AI ASSISTANT'}
                  </span>
                  <ChevronRight size={16} />
                </button>
              )}

              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  window.open(`/guide/index.html?lang=${lang}`, '_blank');
                }}
              >
                <span>{lang === 'gu' ? 'નાગરિક માર્ગદર્શિકા અને SOP' : lang === 'hi' ? 'नागरिक मार्गदर्शिका एवं SOP' : 'CIVIC SOP & GUIDE'}</span>
                <BookOpen size={16} />
              </button>

                  <button
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsSubscribeOpen(true);
                    }}
                  >
                    <span>{lang === 'gu' ? 'સોમવાર ડાયજેસ્ટ ન્યૂઝલેટર' : lang === 'hi' ? 'सोमवार डाइजेस्ट न्यूज़लेटर' : 'MONDAY DIGEST NEWSLETTER'}</span>
                    <Mail size={16} />
                  </button>

                  <button
                    type="button"
                    className="mobile-nav-item"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsChangelogOpen(true);
                    }}
                  >
                    <span>{lang === 'gu' ? 'પ્લેટફોર્મ ચેન્જલોગ' : lang === 'hi' ? 'प्लेटफ़ॉर्म चेंजलॉग' : 'PLATFORM CHANGELOG'}</span>
                    <FileText size={16} />
                  </button>
            </div>

            {/* Mobile Trilingual Toggle */}
            <div className="mobile-lang-section">
              <span className="mobile-section-label">LANGUAGE / ભાષા</span>
              <div className="trilingual-toggle full-width">
                <button
                  className={`lang-segment ${lang === 'gu' ? 'active' : ''}`}
                  onClick={() => setLanguage('gu')}
                >
                  ગુજરાતી
                </button>
                <button
                  className={`lang-segment ${lang === 'hi' ? 'active' : ''}`}
                  onClick={() => setLanguage('hi')}
                >
                  हिन्दी
                </button>
                <button
                  className={`lang-segment ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  ENGLISH
                </button>
              </div>
            </div>

            {/* Mobile Version Switcher */}
            {onSwitchVersion && (
              <div className="mobile-version-switch">
                <button
                  type="button"
                  className="mobile-switch-v1-btn"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onSwitchVersion();
                  }}
                >
                  👈 Switch to Version 1 (GIS Classic)
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

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

export default HeaderV2;
