import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Menu, Globe, Sparkles, BookOpen } from 'lucide-react';
import SocialMenu from './SocialMenu';
import SubscribeModal from './SubscribeModal';
import ChangelogModal from './ChangelogModal';
import { GuideModal } from './GuideModal';

export const Header = () => {
  const { t, lang, toggleLang } = useTranslation();
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
          v1.0.0
        </button>
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
        <button className="lang-toggle-btn" onClick={toggleLang}>
          <Globe size={16} />
          <span>{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
        </button>

        <button 
          className="lang-toggle-btn" 
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
