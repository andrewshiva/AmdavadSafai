import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, Flag, AlertTriangle } from 'lucide-react';

export const FlagReportModal = ({ isOpen, onClose, report, onSuccess }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      await fetch(`/api/reports/${report.id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } catch {
      // Local fallback simulation & storage update
      const stored = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
      const updated = stored.map((r) =>
        r.id === report.id ? { ...r, flagged: (r.flagged || 0) + 1, flag_reason: reason } : r
      );
      localStorage.setItem('amdavad_safai_local_reports', JSON.stringify(updated));
    } finally {
      setSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
            <Flag size={20} />
            {t('flag_incorrect')}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px', borderRadius: '8px', color: '#991B1B', fontSize: '12.5px' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{t('dispute_banner_text')}</span>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {t('flag_reason_prompt')}
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. This is a private bin inside a building compound, not a public garbage dump."
                className="modal-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-secondary" onClick={onClose} disabled={submitting}>
              {t('close')}
            </button>
            <button type="submit" className="modal-btn-primary" disabled={submitting} style={{ background: '#DC2626', color: 'white', border: 'none' }}>
              {submitting ? t('flagging') : t('submit_dispute')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FlagReportModal;
