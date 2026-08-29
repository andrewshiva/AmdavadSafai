import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Menu, Globe, Sparkles, BookOpen } from 'lucide-react';
import SocialMenu from './SocialMenu';
import SubscribeModal from './SubscribeModal';
import ChangelogModal from './ChangelogModal';
import { GuideModal } from './GuideModal';

export const Header = ({ onOpenEvents, onOpenBadges }) => {
  const { t, lang, setLanguage } = useTranslation();
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
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
    <header className="header-container">
      <div className="header-left">
        <div className="header-logo">
          <Sparkles size={22} className="logo-sparkle" />
          <span className="logo-title">{t('app_name')}</span>
        </div>
        <button
          className="version-badge"
          onClick={() => setIsChangelogOpen(true)}
        >
          v1.1.0
        </button>

        {/* Community Cleanup Drives Button */}
        {onOpenEvents && (
          <button
            className="header-action-btn events-btn"
            onClick={onOpenEvents}
            title={t('cleanup_drives')}
          >
            <span>🧹 {t('cleanup_drives')}</span>
            <span className="events-count-badge">5</span>
          </button>
        )}

        {/* Citizen Karma Points Pill */}
        {onOpenBadges && (
          <button
            className="header-action-btn karma-pill-btn"
            onClick={onOpenBadges}
            title={t('my_badges')}
          >
            <span>⚡ {karmaPoints} pts</span>
          </button>
        )}
      </div>

      <div className="header-center">
        <button
          className="digest-banner-btn"
          onClick={() => setIsSubscribeOpen(true)}
        >
          {t('subscribe_banner')}
        </button>
      </div>

      <div className="header-right">
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
            हिं
          </button>
          <button
            className={`lang-segment ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        <button 
          className="lang-toggle-btn icon-only" 
          onClick={() => setIsGuideOpen(true)}
          title={t('help_guide_title') || 'Guide'}
        >
          <BookOpen size={16} />
        </button>

        <div className="menu-wrapper">
          <button
            className="menu-toggle-btn"
            onClick={() => setIsSocialOpen(!isSocialOpen)}
          >
            <Menu size={20} />
          </button>
          <SocialMenu
            isOpen={isSocialOpen}
            onClose={() => setIsSocialOpen(false)}
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
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        t={t}
      />
    </header>
  );
};
export default Header;
