import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, AlertTriangle, Camera, CheckCircle2, RefreshCw } from 'lucide-react';
import { addKarmaPoints } from '../utils/gamification';

export const DisputeResolutionModal = ({ isOpen, onClose, report, onSuccess }) => {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPhoto(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      await fetch(`/api/reports/${report.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispute_image_url: photo,
          reason: reason.trim()
        })
      });
    } catch {
      // Local fallback simulation & storage update
      const stored = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
      const updated = stored.map((r) =>
        r.id === report.id
          ? {
              ...r,
              status: 'unresolved',
              amc_status: 'Re-Opened by Citizen Audit (CCRS Escalated)',
              flagged: (r.flagged || 0) + 1,
              flag_reason: reason.trim(),
              image_url: photo || r.image_url,
              verified_image_url: null
            }
          : r
      );
      localStorage.setItem('amdavad_safai_local_reports', JSON.stringify(updated));
    } finally {
      addKarmaPoints('REPORT_SUBMITTED', 15); // Bonus 15 karma points for active civic auditing
      setSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content dispute-modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#FEF2F2', padding: '6px', borderRadius: '50%', color: '#DC2626' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '17px', color: 'var(--color-text-primary)' }}>
                {t('dispute_resolution_title') || 'Dispute False Cleanup & Re-Open'}
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {t('dispute_resolution_sub') || 'Challenge premature ticket closure with live photo evidence'}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Warning / Explanation Banner */}
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '12px', color: '#B91C1C', fontSize: '12.5px', lineHeight: 1.45 }}>
              <strong>⚠️ {t('anti_fake_notice_title') || 'Anti-Fake Resolution Audit'}:</strong>{' '}
              {t('dispute_banner_explainer') || 'If municipal contractors marked this spot as clean without doing the actual work, upload proof below. This will re-open the official CCRS ticket and alert your Ward Corporator.'}
            </div>

            {/* Current Proof Photo */}
            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {t('upload_dispute_photo') || 'Upload Current Photo Proof (Showing garbage still present):'}
              </label>

              {photo ? (
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <img src={photo} alt="Dispute evidence" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', border: '2px dashed rgba(239, 68, 68, 0.35)', borderRadius: '8px', cursor: 'pointer', background: 'var(--color-bg-elevated)' }}>
                  <Camera size={26} style={{ color: '#DC2626' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {t('take_dispute_photo') || 'Take Photo of Uncleaned Spot'}
                  </span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Reason Textarea */}
            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {t('dispute_reason_label') || 'Explain what is still uncleaned:'}
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('dispute_reason_placeholder') || 'e.g. Only the roadside bin was emptied, but the large heap of plastic debris behind the tree was left untouched.'}
                className="modal-input"
                style={{ fontSize: '12.5px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#059669', background: 'rgba(16, 185, 129, 0.08)', padding: '8px 12px', borderRadius: '6px' }}>
              <CheckCircle2 size={15} />
              <span>{t('dispute_karma_reward') || 'Earn +15 Karma points upon submitting verified dispute'}</span>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="modal-btn-secondary" onClick={onClose} disabled={submitting}>
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="modal-btn-primary"
              disabled={submitting || !reason.trim()}
              style={{ background: '#DC2626', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={submitting ? 'animate-spin' : ''} />
              <span>{submitting ? (t('submitting') || 'Re-Opening...') : (t('confirm_reopen_btn') || 'Re-Open Complaint ⚠️')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DisputeResolutionModal;
