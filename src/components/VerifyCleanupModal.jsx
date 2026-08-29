import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, CheckCircle2, Upload, Camera } from 'lucide-react';
import { addKarmaPoints } from '../utils/gamification';

export const VerifyCleanupModal = ({ isOpen, onClose, report, onSuccess }) => {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
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
    setSubmitting(true);

    try {
      await fetch(`/api/reports/${report.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified_image_url: photo, notes })
      });
    } catch {
      // Local fallback simulation & storage update
      const stored = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
      const updated = stored.map((r) =>
        r.id === report.id ? { ...r, status: 'resolved', verified_image_url: photo } : r
      );
      localStorage.setItem('amdavad_safai_local_reports', JSON.stringify(updated));
    } finally {
      addKarmaPoints('CLEANUP_VERIFIED', 25);
      setSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A' }}>
            <CheckCircle2 size={22} />
            {t('verify_cleanup')}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p className="modal-description" style={{ fontSize: '13px', margin: 0 }}>
              {t('verify_cleanup_desc')}
            </p>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {t('upload_clean_photo')}
              </label>

              {photo ? (
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <img src={photo} alt="Cleaned spot" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px', border: '2px dashed var(--glass-border)', borderRadius: '8px', cursor: 'pointer', background: 'var(--color-bg-elevated)' }}>
                  <Camera size={28} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {t('upload_photo')}
                  </span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('verification_notes_label')}</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('verification_notes_placeholder')}
                className="modal-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-secondary" onClick={onClose} disabled={submitting}>
              {t('close')}
            </button>
            <button type="submit" className="modal-btn-primary" disabled={submitting} style={{ background: '#16A34A', color: 'white', border: 'none' }}>
              {submitting ? t('verifying') : t('mark_as_resolved')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default VerifyCleanupModal;
