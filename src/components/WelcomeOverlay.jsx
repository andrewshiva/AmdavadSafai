import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Trash2 } from 'lucide-react';

export const WelcomeOverlay = () => {
  const { t } = useTranslation();
  const [hasVisited, setHasVisited] = useLocalStorage('amdavad_safai_visited', false);
  const [isClosing, setIsClosing] = useState(false);

  if (hasVisited && !isClosing) return null;

  const dismiss = () => {
    setIsClosing(true);
    window.setTimeout(() => setHasVisited(true), 220);
  };

  return (
    <div className={`welcome-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="welcome-card">
        <div className="welcome-logo-container">
          <Trash2 size={48} className="welcome-logo-icon" />
        </div>
        <h1 className="welcome-title">{t('app_name')}</h1>
        <p className="welcome-tagline">{t('tagline')}</p>
        <p className="welcome-description">{t('welcome_desc')}</p>
        <button className="welcome-btn" onClick={dismiss}>
          {t('get_started')}
        </button>
      </div>
    </div>
  );
};
export default WelcomeOverlay;
