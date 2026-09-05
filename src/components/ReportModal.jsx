import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, AlertCircle, MapPin, CheckCircle2, LocateFixed, Camera, Tag, Clock, Sparkles } from 'lucide-react';
import { addKarmaPoints } from '../utils/gamification';
import { generateAmcTicketId } from '../utils/amcTickets';
import { formatDateTime } from '../utils/dateTime';

export const ReportModal = ({ isOpen, onClose, wards, onSuccess, pickedCoords, onOutofCity }) => {
  const { t, lang } = useTranslation();
  const [wardId, setWardId] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descGu, setDescGu] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [category, setCategory] = useState('mixed_waste');
  const [photo, setPhoto] = useState(null);
  const [lat, setLat] = useState('23.0225');
  const [lng, setLng] = useState('72.5714');
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  useEffect(() => {
    if (pickedCoords && pickedCoords.lat && pickedCoords.lng) {
      setLat(pickedCoords.lat.toFixed(5));
      setLng(pickedCoords.lng.toFixed(5));
    }
  }, [pickedCoords]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPhoto(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser. Select a ward or place a pin on the map instead.');
      return;
    }

    setError('');
    setLocationMessage('Requesting your location…');
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLat = position.coords.latitude;
        const nextLng = position.coords.longitude;
        setLat(nextLat.toFixed(5));
        setLng(nextLng.toFixed(5));

        try {
          const response = await fetch('/api/wards/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: nextLat, lng: nextLng })
          });
          const match = await response.json();
          if (!response.ok) {
            if (response.status === 400 && match.detail && match.detail.includes('outside')) {
              onClose();
              if (onOutofCity) onOutofCity(match.detail);
              return;
            }
            throw new Error(match.detail || 'Unable to match this location to a ward.');
          }

          setWardId(match.ward.id);
          const wardName = lang === 'gu' ? match.ward.name_gu : match.ward.name_en;
          setLocationMessage(`${wardName} selected automatically (${Math.round(match.distance_m)} m from ward centre).`);
        } catch (locationError) {
          setLocationMessage('Location captured. Please select the correct ward manually.');
          setError(locationError.message || 'Unable to match this location to a ward.');
        } finally {
          setLocating(false);
        }
      },
      (locationError) => {
        setLocating(false);
        setLocationMessage('');
        setError(locationError.code === 1
          ? 'Location permission was denied. Select a ward or place a pin on the map instead.'
          : 'Unable to get your location. Select a ward or place a pin on the map instead.');
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!wardId) {
      setError(t('select_ward'));
      return;
    }
    if (!descEn.trim() && !descGu.trim()) {
      setError('Please provide a description');
      return;
    }

    const finalDescEn = descEn.trim() || descGu.trim();
    const finalDescGu = descGu.trim() || descEn.trim();
    const newAmcTicketId = generateAmcTicketId();
    const nowIso = new Date().toISOString();
    setSubmissionTimestamp(nowIso);

    setSubmitting(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_id: wardId,
          description_en: finalDescEn,
          description_gu: finalDescGu,
          severity: severity,
          category: category,
          amc_ticket_id: newAmcTicketId,
          amc_status: 'Assigned to SWM Inspector',
          amc_department: 'Solid Waste Management (SWM)',
          image_url: photo,
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        })
      });

      if (response.ok) {
        const createdData = await response.json().catch(() => ({}));
        addKarmaPoints('REPORT_SUBMITTED', 15, { targetId: createdData.id || `rpt_${Date.now()}`, description: `Filed Complaint (${wardId})` });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setDescEn('');
          setDescGu('');
          setPhoto(null);
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      } else {
        const err = await response.json().catch(() => ({}));
        if (response.status === 400 && err.detail && err.detail.includes('outside')) {
          onClose();
          if (onOutofCity) onOutofCity(err.detail);
          return;
        }
        setError(err.detail || 'Failed to submit complaint.');
      }
    } catch {
      // Fallback behavior if static deployment
      const selectedWard = wards.find((w) => w.id === wardId);
      const wardPartner = selectedWard ? `${selectedWard.name_en} Civic Association` : 'Ahmedabad Citizen Network';

      const newReport = {
        id: `rpt_local_${Date.now()}`,
        ward_id: wardId,
        description_en: finalDescEn,
        description_gu: finalDescGu,
        description_hi: finalDescEn,
        severity: severity,
        category: category,
        status: 'unresolved',
        amc_ticket_id: newAmcTicketId,
        amc_status: 'Assigned to SWM Inspector',
        amc_department: 'Solid Waste Management (SWM)',
        rwa_partner: wardPartner,
        image_url: photo,
        upvotes: 0,
        flagged: 0,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        reported_at: nowIso,
        created_at: nowIso
      };
      const stored = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
      localStorage.setItem('amdavad_safai_local_reports', JSON.stringify([newReport, ...stored]));

      addKarmaPoints('REPORT_SUBMITTED', 15, { targetId: newReport.id, description: `Filed Complaint (${wardId})` });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescEn('');
        setDescGu('');
        setPhoto(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } finally {
      setSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="report-title" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} className="text-primary" />
            {t('report_garbage')}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {success ? (
              <div className="modal-success-message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '32px 16px' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--color-minor)' }} />
                <span style={{ fontSize: '16px', fontWeight: 700 }}>{t('report_success')}</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>{t('filing_timestamp') || 'Filing Date & Time'}: <strong style={{ color: 'var(--color-text-primary)' }}>{formatDateTime(submissionTimestamp || new Date().toISOString(), lang)}</strong></span>
                </div>
              </div>
            ) : (
              <div className="modal-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p className="modal-description">{t('report_desc')}</p>

                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('report_location_label')}</label>
                  <button
                    type="button"
                    className="modal-btn-secondary"
                    onClick={useCurrentLocation}
                    disabled={locating || submitting}
                    style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <LocateFixed size={16} />
                    {locating ? t('finding_location') : t('use_my_location')}
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {t('location_ward_privacy_hint')}
                  </span>
                  {locationMessage && (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{locationMessage}</span>
                  )}
                </div>

                {/* Photo Upload Section */}
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={15} style={{ color: 'var(--color-primary)' }} />
                    {t('upload_photo')}
                  </label>
                  {photo ? (
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <img src={photo} alt="Report site" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '1px dashed var(--glass-border)', borderRadius: '8px', cursor: 'pointer', background: 'var(--color-bg-elevated)' }}>
                      <Camera size={18} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t('choose_image_take_photo')}</span>
                      <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* Ward Selection */}
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('select_ward')} *</label>
                  <select
                    value={wardId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setWardId(selectedId);
                      if (selectedId && !pickedCoords) {
                        const selectedWard = wards.find((w) => w.id === selectedId);
                        if (selectedWard) {
                          setLat(selectedWard.lat.toFixed(5));
                          setLng(selectedWard.lng.toFixed(5));
                        }
                      }
                    }}
                    className="modal-input"
                    required
                  >
                    <option value="">-- {t('select_ward')} --</option>
                    {wards && wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {lang === 'gu' ? `${w.name_gu} (${w.zone_gu})` : `${w.name_en} (${w.zone_en})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 1-Tap Fast Category Chips */}
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={15} style={{ color: 'var(--color-primary)' }} />
                    {t('category_label')} *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '4px' }}>
                    {[
                      { id: 'roadside_garbage', icon: '🗑️', label: t('cat_roadside_garbage') },
                      { id: 'overflowing_bin', icon: '📦', label: t('cat_overflowing_bin') },
                      { id: 'drainage_blockage', icon: '🌊', label: t('cat_drainage_blockage') },
                      { id: 'dead_animal', icon: '🐾', label: t('cat_dead_animal') },
                      { id: 'street_light', icon: '💡', label: t('cat_street_light') },
                      { id: 'public_toilet', icon: '🚻', label: t('cat_public_toilet') },
                      { id: 'construction_dump', icon: '🧱', label: t('cat_construction_dump') },
                      { id: 'mixed_waste', icon: '🍂', label: t('cat_mixed_waste') },
                      { id: 'other_issue', icon: '⚠️', label: t('cat_other_issue') }
                    ].map((c) => {
                      const isActive = category === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategory(c.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--glass-border)',
                            background: isActive ? 'rgba(13, 148, 136, 0.12)' : 'var(--color-bg-elevated)',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{c.icon}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1-Tap Fast Severity Chips */}
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('severity')} *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '4px' }}>
                    {[
                      { id: 'minor', label: t('filter_minor'), color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
                      { id: 'moderate', label: t('filter_moderate'), color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
                      { id: 'severe', label: t('filter_severe'), color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
                      { id: 'critical', label: t('filter_critical'), color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' }
                    ].map((s) => {
                      const isActive = severity === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSeverity(s.id)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: isActive ? `2px solid ${s.color}` : '1px solid var(--glass-border)',
                            background: isActive ? s.bg : 'var(--color-bg-elevated)',
                            color: isActive ? s.color : 'var(--color-text-secondary)',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description English */}
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('description_en')}</label>
                  <textarea
                    rows={2}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    placeholder="e.g., Overflowing garbage bins near bus stand"
                    className="modal-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Description Gujarati */}
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('description_gu')}</label>
                  <textarea
                    rows={2}
                    value={descGu}
                    onChange={(e) => setDescGu(e.target.value)}
                    placeholder="દા.ત., બસ સ્ટેન્ડ પાસે કચરાપેટી છલકાઈ રહી છે"
                    className="modal-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* AI Smart Triage Assistant */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(234, 88, 12, 0.12))',
                  border: '1px solid rgba(249, 115, 22, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={15} color="#EA580C" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C' }}>
                      AI Auto-Triage
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const text = descEn.trim() || descGu.trim();
                      if (!text || triageLoading) return;
                      setTriageLoading(true);
                      try {
                        const res = await fetch('/api/ai/triage', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ description: text, category })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setTriageResult(data);
                          if (data.predicted_category) setCategory(data.predicted_category);
                          if (data.predicted_severity) setSeverity(data.predicted_severity);
                        }
                      } catch (err) {
                        console.error('AI Triage error:', err);
                      } finally {
                        setTriageLoading(false);
                      }
                    }}
                    disabled={triageLoading || (!descEn.trim() && !descGu.trim())}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: (!descEn.trim() && !descGu.trim()) ? 'rgba(0,0,0,0.1)' : '#EA580C',
                      color: (!descEn.trim() && !descGu.trim()) ? 'var(--color-text-muted)' : '#FFFFFF',
                      border: 'none',
                      cursor: (!descEn.trim() && !descGu.trim()) ? 'default' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {triageLoading ? 'Analyzing...' : 'Auto-Route Department ✨'}
                  </button>
                </div>

                {triageResult && (
                  <div style={{
                    fontSize: '11px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(52, 211, 153, 0.1)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    color: '#065F46',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                      <CheckCircle2 size={13} color="#10B981" />
                      <span>AI Triage: {triageResult.predicted_department}</span>
                    </div>
                    <span style={{ color: '#047857' }}>{triageResult.summary}</span>
                  </div>
                )}

                {/* Coordinates Picker Info & Inputs */}
                <div className="input-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('location_coords')}</label>
                    <span style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {t('click_map_hint')}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Latitude</span>
                      <input
                        type="number"
                        step="0.00001"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="modal-input"
                        style={{ width: '100%' }}
                        required
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Longitude</span>
                      <input
                        type="number"
                        step="0.00001"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="modal-input"
                        style={{ width: '100%' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && <span className="error-text" style={{ color: 'var(--color-critical)', fontSize: '13px' }}>{error}</span>}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn-secondary"
              onClick={onClose}
              disabled={submitting || success}
            >
              {t('close')}
            </button>
            {!success && (
              <button
                type="submit"
                className="modal-btn-primary"
                disabled={submitting}
                style={{ background: 'var(--color-primary)', color: 'white', border: 'none' }}
              >
                {submitting ? t('submitting') : t('submit_report')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
export default ReportModal;
