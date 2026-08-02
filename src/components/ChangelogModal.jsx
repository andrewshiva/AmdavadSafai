import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, History, Sparkles } from 'lucide-react';

export const ChangelogModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="changelog-title" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 id="changelog-title" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} className="text-primary" />
            {t('version_history')}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
          <p className="modal-description" style={{ margin: 0 }}>{t('changelog_desc')}</p>

          {/* Release v1.0.0 */}
          <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
                <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                {t('v1_0_0_title')}
              </span>
              <span className="badge status-resolved" style={{ fontSize: '11px', padding: '2px 8px' }}>Current</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {t('v1_0_0_desc')}
            </p>
            <ul style={{ margin: '8px 0 0 16px', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Added dynamic Cleanliness Score ($0-100$) computation for all 20 wards</li>
              <li>Added Citizen Garbage Complaint submission form with interactive location picker</li>
              <li>Integrated Ahmedabad ward polygon outlines (`ahmedabad_wards.geojson`)</li>
              <li>Added Zone-wise and Severity breakdown charts in sliding statistics drawer</li>
            </ul>
          </div>

          {/* Release v0.9.0 */}
          <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.85 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                {t('v0_9_0_title')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Initial Beta</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {t('v0_9_0_desc')}
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-btn-secondary" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
export default ChangelogModal;
