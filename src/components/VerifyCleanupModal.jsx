import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, CheckCircle2, Camera, Sparkles } from 'lucide-react';
import { holdKarmaEscrow, finalizeKarmaEscrow, getOrCreateDeviceId } from '../utils/gamification';

const captureGps = () => new Promise((resolve) => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
  const timer = setTimeout(() => resolve(null), 4000);
  navigator.geolocation.getCurrentPosition(
    (pos) => { clearTimeout(timer); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
    () => { clearTimeout(timer); resolve(null); },
    { enableHighAccuracy: true, timeout: 3500, maximumAge: 60000 }
  );
});

export const VerifyCleanupModal = ({ isOpen, onClose, report, onSuccess }) => {
  const { t, lang } = useTranslation();
  const [photo, setPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);
  const [aiVisionResult, setAiVisionResult] = useState(null);
  const [pendingNotice, setPendingNotice] = useState(false);

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
      reader.onloadend = async () => {
        const photoData = reader.result;
        setPhoto(photoData);

        // Run SigLIP-2 AI Vision transformation check
        setVisionLoading(true);
        try {
          const res = await fetch('/api/ai/verify-vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              before_url: report.image_url || '',
              after_url: photoData
            })
          });
          if (res.ok) {
            const data = await res.json();
            setAiVisionResult(data);
          } else {
            // No verdict without a model response — community review decides.
            setAiVisionResult(null);
          }
        } catch {
          // Offline: no fake verdict. Community review decides.
          setAiVisionResult(null);
        } finally {
          setVisionLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setPendingNotice(false);
    const deviceId = getOrCreateDeviceId();

    // +30 held in escrow until the report certifies (reporter or 2-device quorum)
    holdKarmaEscrow('CLEANUP_VERIFIED', { targetId: report.id, description: `Verify Clean Spot (${report.ward_id || 'Ahmedabad'}) — pending certification` });

    // Best-effort live GPS at upload time (Q7 fallback tag when unavailable)
    const gps = await captureGps();

    try {
      const res = await fetch(`/api/reports/${report.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified_image_url: photo,
          notes,
          device_id: deviceId,
          verification_lat: gps ? gps.lat : null,
          verification_lng: gps ? gps.lng : null
        })
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.verification_state === 'certified') {
        finalizeKarmaEscrow(report.id);
        setSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
        return;
      }
      // Pending quorum: escrow stays held, volunteer sees the count state.
      setPendingNotice(true);
      setSubmitting(false);
    } catch {
      // Offline: mark locally as awaiting review, escrow stays held.
      try {
        const stored = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
        const updated = stored.map((r) =>
          r.id === report.id ? { ...r, verification_state: 'pending_review', verified_image_url: photo } : r
        );
        localStorage.setItem('amdavad_safai_local_reports', JSON.stringify(updated));
      } catch {
        // ignore
      }
      setPendingNotice(true);
      setSubmitting(false);
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
            <p style={{ fontSize: '11.5px', margin: 0, color: '#0284C7', fontWeight: 700 }}>
              {lang === 'gu'
                ? 'જાહેર ડ્યુઅલ-ફોટો પુરાવો — સફાઈ પ્રમાણિત થવા માટે ૨ પુષ્ટિ જોઈએ.'
                : lang === 'hi'
                ? 'सार्वजनिक डुअल-फोटो प्रमाण — प्रमाणन हेतु 2 पुष्टियां आवश्यक।'
                : 'Public dual-photo proof — 2 confirmations certify a cleanup.'}
            </p>

            {pendingNotice && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.12)', border: '1px solid #FCD34D', fontSize: '12px', color: '#92400E' }}>
                {lang === 'gu'
                  ? 'નોંધાઈ ગયું! તમારી પુષ્ટિ ૨ માંથી ૧ છે — બીજી પુષ્ટિ કે ફરિયાદીની મંજૂરી મળતાં +૩૦ કર્મા છૂટશે.'
                  : lang === 'hi'
                  ? 'दर्ज! आपकी पुष्टि 2 में से 1 है — दूसरी पुष्टि या शिकायतकर्ता की स्वीकृति पर +30 कर्मा जारी होगा।'
                  : 'Recorded! Your confirmation is 1 of 2 — +30 karma releases on a second confirmation or reporter approval.'}
              </div>
            )}

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

            {/* AI Vision Verification Banner */}
            {visionLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', fontSize: '11.5px', color: '#0284C7' }}>
                <Sparkles size={14} className="spin" />
                <span>AI Vision analyzing before ↔ after transformation...</span>
              </div>
            )}

            {aiVisionResult && !visionLoading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                background: aiVisionResult.is_genuine_cleanup ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                border: `1px solid ${aiVisionResult.is_genuine_cleanup ? '#86EFAC' : '#FECACA'}`,
                fontSize: '11.5px',
                color: aiVisionResult.is_genuine_cleanup ? '#15803D' : '#DC2626'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} />
                  <strong>AI Vision:</strong>
                  <span>{aiVisionResult.verdict}</span>
                </div>
                <strong style={{ fontSize: '12px' }}>{aiVisionResult.transformation_score}% Change</strong>
              </div>
            )}

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
              {pendingNotice ? (lang === 'gu' ? 'પૂર્ણ' : lang === 'hi' ? 'पूर्ण' : 'Done') : t('close')}
            </button>
            {!pendingNotice && (
              <button type="submit" className="modal-btn-primary" disabled={submitting} style={{ background: '#16A34A', color: 'white', border: 'none' }}>
                {submitting ? t('verifying') : t('mark_as_resolved')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default VerifyCleanupModal;
