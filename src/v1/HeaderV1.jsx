import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Menu, Sparkles, BookOpen } from 'lucide-react';
import SocialMenu from '../components/SocialMenu';
import SubscribeModal from '../components/SubscribeModal';
import ChangelogModal from '../components/ChangelogModal';

export const HeaderV1 = ({
  onOpenEvents,
  onOpenBadges,
  onOpenCleanedSpots,
  onOpenRWA,
  onSwitchVersion
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
    <header className="header-container header-v1">
      <div className="header-left">
        <div className="header-logo">
          <Sparkles size={20} className="logo-sparkle" />
          <span className="logo-title">{t('app_name')}</span>
        </div>
        
        <button
          className="version-badge header-desktop-only"
          onClick={() => setIsChangelogOpen(true)}
          title="Changelog & Version Notes"
        >
          v1.1.0 (GIS Classic)
        </button>

        {onSwitchVersion && (
          <button
            className="version-switch-pill"
            onClick={onSwitchVersion}
            title="Switch to Version 2 (Variant Portal)"
          >
            <span>👉 Switch to v2</span>
          </button>
        )}

        {/* Desktop Quick Action Buttons */}
        <div className="header-desktop-actions">
          {onOpenCleanedSpots && (
            <button
              className="header-action-btn cleaned-spots-btn"
              onClick={onOpenCleanedSpots}
              title={t('wall_of_cleaned_title') || 'Wall of Cleaned Spots'}
            >
              <span>✨ {t('cleaned_spots_short') || 'Cleaned Spots'}</span>
            </button>
          )}

          {onOpenRWA && (
            <button
              className="header-action-btn rwa-btn"
              onClick={onOpenRWA}
              title={t('rwa_hub_title') || 'RWA & Ward Hub'}
            >
              <span>🏢 {t('rwa_hub_short') || 'RWA Hub'}</span>
            </button>
          )}

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
        </div>

        {/* Citizen Karma Points Pill (Visible on both desktop & mobile header) */}
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
            हिં
          </button>
          <button
            className={`lang-segment ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

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

export default HeaderV1;
