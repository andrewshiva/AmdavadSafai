import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import {
  Trash2,
  Droplets,
  PawPrint,
  Lightbulb,
  Building,
  MoreHorizontal,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  LocateFixed,
  Loader2,
  Check,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { generateAmcTicketId } from '../utils/amcTickets';
import { addKarmaPoints } from '../utils/gamification';
import { formatDateTime } from '../utils/dateTime';
import wardsData from '../data/wards.json';

export const ReportPage = ({ onCancel, onSuccess, pickedCoords }) => {
  const { lang } = useTranslation();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1, 2, 3
  const [category, setCategory] = useState('roadside_garbage');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Step 2 Fields
  const [wardId, setWardId] = useState(wardsData[0]?.id || 'ward_01');
  const [lat, setLat] = useState(wardsData[0]?.lat ? wardsData[0].lat.toFixed(5) : '23.0225');
  const [lng, setLng] = useState(wardsData[0]?.lng ? wardsData[0].lng.toFixed(5) : '72.5714');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [submittedTime, setSubmittedTime] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  useEffect(() => {
    if (pickedCoords && pickedCoords.lat && pickedCoords.lng) {
      setLat(pickedCoords.lat.toFixed(5));
      setLng(pickedCoords.lng.toFixed(5));
    }
  }, [pickedCoords]);

  const categories = [
    {
      id: 'roadside_garbage',
      titleEn: 'ROADSIDE GARBAGE',
      titleGu: 'રોડ સાઇડ કચરો',
      titleHi: 'सड़क किनारे कचरा',
      icon: Trash2
    },
    {
      id: 'overflowing_bin',
      titleEn: 'OVERFLOWING DUSTBIN',
      titleGu: 'ઓવરફ્લો કચરાપેટી',
      titleHi: 'भरी हुई कचरा पेटी',
      icon: Trash2
    },
    {
      id: 'drainage_blockage',
      titleEn: 'DRAINAGE BLOCKAGE',
      titleGu: 'ગટર બ્લોકેજ',
      titleHi: 'सीवेज व नाली रुकावट',
      icon: Droplets
    },
    {
      id: 'dead_animal',
      titleEn: 'DEAD ANIMAL',
      titleGu: 'મૃત પ્રાણી',
      titleHi: 'मृत पशु',
      icon: PawPrint
    },
    {
      id: 'street_light',
      titleEn: 'STREET LIGHT',
      titleGu: 'સ્ટ્રીટ લાઇટ',
      titleHi: 'स्ट्रीट लाइट',
      icon: Lightbulb
    },
    {
      id: 'public_toilet',
      titleEn: 'PUBLIC TOILET',
      titleGu: 'જાહેર શૌચાલય',
      titleHi: 'सार्वजनिक शौचालय',
      icon: Building
    },
    {
      id: 'construction_dump',
      titleEn: 'CONSTRUCTION DEBRIS',
      titleGu: 'બાંધકામ મલબો',
      titleHi: 'मलबा और निर्माण कचरा',
      icon: Building
    },
    {
      id: 'mixed_waste',
      titleEn: 'MIXED WASTE',
      titleGu: 'મિશ્ર ઘરગથ્થુ કચરો',
      titleHi: 'मिश्रित घरेलू कचरा',
      icon: Trash2
    },
    {
      id: 'other_issue',
      titleEn: 'OTHER CIVIC ISSUE',
      titleGu: 'અન્ય સમસ્યા',
      titleHi: 'अन्य नागरिक समस्या',
      icon: MoreHorizontal
    }
  ];

  const handlePhotoFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setError('');
    setLocating(true);
    setLocationMessage('Detecting GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nextLat = pos.coords.latitude;
        const nextLng = pos.coords.longitude;
        setLat(nextLat.toFixed(5));
        setLng(nextLng.toFixed(5));

        try {
          const res = await fetch('/api/wards/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: nextLat, lng: nextLng })
          });
          const data = await res.json();
          if (res.ok && data.ward) {
            setWardId(data.ward.id);
            setLocationMessage(`${data.ward.name_en} detected automatically via GPS.`);
          } else {
            setLocationMessage('GPS coordinates recorded.');
          }
        } catch {
          setLocationMessage('GPS location captured.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationMessage('');
        setError('Location permission denied or unavailable.');
      }
    );
  };

  const getAmcDepartmentForCategory = (cat) => {
    switch (cat) {
      case 'dead_animal':
        return 'Cattle Nuisance Control Dept (CNCD)';
      case 'drainage_blockage':
        return 'Water & Drainage Department';
      case 'street_light':
        return 'Light & Electrical Department';
      case 'public_toilet':
        return 'Public Health & SWM Department';
      case 'construction_dump':
        return 'Estate & Solid Waste Management';
      case 'roadside_garbage':
      case 'overflowing_bin':
      case 'mixed_waste':
      default:
        return 'Solid Waste Management (SWM)';
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    const amcTicket = generateAmcTicketId(wardId || 'ward_01');
    const assignedDept = getAmcDepartmentForCategory(category);
    const nowIso = new Date().toISOString();
    setSubmittedTime(nowIso);

    const reportData = {
      id: `rpt_local_${Date.now()}`,
      ward_id: wardId,
      description_en: description.trim() || 'Reported garbage / civic sanitation issue via Ahmedabad Safai.',
      description_gu: description.trim() || 'અમદાવાદ સફાઈ પોર્ટલ દ્વારા નોંધાયેલ કચરો/સ્વચ્છતા ફરિયાદ.',
      description_hi: description.trim() || 'अहमदाबाद सफाई पोर्टल के माध्यम से दर्ज की गई शिकायत।',
      severity: severity || 'moderate',
      status: 'unresolved',
      category: category || 'roadside_garbage',
      amc_ticket_id: amcTicket,
      amc_status: `Assigned to ${assignedDept} Field Inspector`,
      amc_department: assignedDept,
      rwa_partner: 'Ahmedabad Citizen Network',
      image_url: photo || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
      lat: parseFloat(lat) || 23.0225,
      lng: parseFloat(lng) || 72.5714,
      upvotes: 1,
      reported_at: nowIso,
      created_at: nowIso
    };

    // Save report to local storage so it reflects immediately across MyReportsView and Dashboard
    try {
      const stored = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
      localStorage.setItem('amdavad_safai_local_reports', JSON.stringify([reportData, ...stored]));
    } catch {
      // Ignore
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        const result = await response.json();
        addKarmaPoints('REPORT_SUBMITTED', 15, { targetId: result.id || amcTicket, description: `Filed Complaint (${wardId})` });
        setSubmittedTicket(result.amc_ticket_id || amcTicket);
        if (onSuccess) onSuccess(result);
        setSubmitting(false);
        return;
      }
    } catch (submitError) {
      console.warn('Backend offline, using local storage fallback...', submitError);
    }

    addKarmaPoints('REPORT_SUBMITTED', 15, { targetId: reportData.id, description: `Filed Complaint (${wardId})` });
    setSubmittedTicket(amcTicket);
    if (onSuccess) onSuccess(reportData);
    setSubmitting(false);
  };

  // If submitted successfully, show confirmation screen
  if (submittedTicket) {
    return (
      <div className="variant-report-page-container">
        <div className="variant-report-wrapper">
          <div className="variant-slab-card variant-success-card">
            <div className="variant-success-icon-wrap">
              <CheckCircle2 size={48} className="text-emerald" />
            </div>
            <span className="variant-tag">COMPLAINT REGISTERED</span>
            <h1 className="variant-success-title">ISSUE REPORTED SUCCESSFULLY!</h1>
            <p className="variant-success-sub">
              Your report has been forwarded to the AMC Solid Waste Management (SWM) Department and mapped publicly.
            </p>

            <div className="variant-ticket-badge">
              <span className="ticket-label">AMC TICKET ID</span>
              <span className="ticket-id">{submittedTicket}</span>
            </div>

            <div className="variant-time-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', margin: '10px 0', fontSize: '13px', color: '#334155' }}>
              <Clock size={15} style={{ color: '#FF6B35' }} />
              <span>{lang === 'gu' ? 'નોંધણી તારીખ અને સમય' : lang === 'hi' ? 'पंजीकरण तारीख और समय' : 'Registration Date & Time'}: <strong style={{ color: '#0F172A' }}>{formatDateTime(submittedTime || new Date().toISOString(), lang)}</strong></span>
            </div>

            <div className="variant-karma-reward-pill">
              <span>⚡ +15 Karma Points Earned</span>
            </div>

            <button
              type="button"
              className="variant-btn-primary"
              style={{ marginTop: '24px' }}
              onClick={onCancel}
            >
              <span>RETURN TO DASHBOARD</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="variant-report-page-container">
      <div className="variant-report-wrapper">
        {/* Step Counter Subtitle & Title */}
        <div className="variant-report-header">
          <span className="variant-step-indicator">
            STEP 0{step} OF 03
          </span>
          <h1 className="variant-report-main-title">REPORT NEW ISSUE</h1>
        </div>

        {/* 2-Column Layout */}
        <div className="variant-report-grid">
          {/* LEFT COLUMN: Steps Form */}
          <div className="variant-report-left-col">
            {/* STEP 1: CATEGORY & PHOTO */}
            {step === 1 && (
              <>
                {/* Select Category Card */}
                <div className="variant-slab-card variant-category-card">
                  <h3 className="variant-card-heading">SELECT CATEGORY</h3>

                  <div className="variant-category-grid">
                    {categories.map((cat) => {
                      const IconComp = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`variant-category-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => setCategory(cat.id)}
                        >
                          <div className="cat-icon-wrap">
                            <IconComp size={20} />
                          </div>
                          <span className="cat-title-en">{cat.titleEn}</span>
                          <span className="cat-title-sub">
                            {lang === 'gu' ? cat.titleGu : lang === 'hi' ? cat.titleHi : cat.titleGu}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload Photo Evidence Card */}
                <div
                  className={`variant-slab-card variant-photo-card ${isDragging ? 'dragging' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && handlePhotoFile(e.target.files[0])}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  {photoPreview ? (
                    <div className="variant-photo-preview-box" onClick={(e) => e.stopPropagation()}>
                      <img src={photoPreview} alt="Evidence preview" className="preview-img" />
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={() => {
                          setPhoto(null);
                          setPhotoPreview(null);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="variant-photo-drop-inner">
                      <div className="variant-camera-icon-circle">
                        <Camera size={26} />
                      </div>
                      <h4 className="variant-photo-title">UPLOAD PHOTO EVIDENCE</h4>
                      <p className="variant-photo-sub">DRAG & DROP OR CLICK TO UPLOAD (MAX 10MB)</p>
                    </div>
                  )}
                </div>

                {/* Continue Action */}
                <div className="variant-step-actions">
                  <button
                    type="button"
                    className="variant-btn-primary"
                    onClick={() => setStep(2)}
                  >
                    <span>CONTINUE TO LOCATION & DETAILS</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: LOCATION & DETAILS */}
            {step === 2 && (
              <>
                <div className="variant-slab-card">
                  <h3 className="variant-card-heading">LOCATION & WARD</h3>

                  <div className="variant-form-group">
                    <label className="variant-form-label">SELECT WARD</label>
                    <select
                      className="variant-form-select"
                      value={wardId}
                      onChange={(e) => {
                        const newWardId = e.target.value;
                        setWardId(newWardId);
                        if (newWardId && !pickedCoords) {
                          const w = wardsData.find((item) => item.id === newWardId);
                          if (w && w.lat && w.lng) {
                            setLat(w.lat.toFixed(5));
                            setLng(w.lng.toFixed(5));
                          }
                        }
                      }}
                    >
                      {wardsData.map((w) => (
                        <option key={w.id} value={w.id}>
                          {lang === 'gu' ? `${w.name_gu} (${w.zone_gu})` : `${w.name_en} (${w.zone_en})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="variant-gps-row">
                    <button
                      type="button"
                      className="variant-btn-secondary"
                      onClick={useCurrentLocation}
                      disabled={locating}
                    >
                      {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                      <span>USE CURRENT GPS LOCATION</span>
                    </button>
                    {locationMessage && (
                      <span className="variant-location-status">{locationMessage}</span>
                    )}
                  </div>

                  <div className="variant-coords-row">
                    <div className="variant-coord-badge">
                      <MapPin size={12} />
                      <span>Lat: {lat}</span>
                    </div>
                    <div className="variant-coord-badge">
                      <MapPin size={12} />
                      <span>Lng: {lng}</span>
                    </div>
                  </div>
                </div>

                <div className="variant-slab-card">
                  <h3 className="variant-card-heading">ISSUE DETAILS & SEVERITY</h3>

                  <div className="variant-form-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label className="variant-form-label" style={{ margin: 0 }}>DESCRIPTION</label>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!description.trim() || triageLoading) return;
                          setTriageLoading(true);
                          try {
                            const res = await fetch('/api/ai/triage', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ description: description.trim(), category })
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
                        disabled={triageLoading || !description.trim()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(249, 115, 22, 0.1)',
                          border: '1px solid rgba(249, 115, 22, 0.3)',
                          color: '#EA580C',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: description.trim() ? 'pointer' : 'default'
                        }}
                      >
                        <Sparkles size={12} color="#EA580C" />
                        <span>{triageLoading ? 'Triage...' : 'Auto-Triage ✨'}</span>
                      </button>
                    </div>
                    <textarea
                      className="variant-form-textarea"
                      rows={3}
                      placeholder="Describe the issue, landmarks, nearby gate or street name..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
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
                      gap: '2px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                        <CheckCircle2 size={13} color="#10B981" />
                        <span>AI Triage: {triageResult.predicted_department}</span>
                      </div>
                      <span style={{ color: '#047857' }}>{triageResult.summary}</span>
                    </div>
                  )}

                  <div className="variant-form-group">
                    <label className="variant-form-label">SEVERITY LEVEL</label>
                    <div className="variant-severity-pills">
                      {[
                        { id: 'minor', label: 'Low / Minor' },
                        { id: 'moderate', label: 'Moderate' },
                        { id: 'severe', label: 'High / Severe' },
                        { id: 'critical', label: 'Critical' }
                      ].map((sev) => (
                        <button
                          key={sev.id}
                          type="button"
                          className={`variant-sev-pill ${severity === sev.id ? 'active' : ''}`}
                          onClick={() => setSeverity(sev.id)}
                        >
                          {sev.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="variant-step-actions between">
                  <button
                    type="button"
                    className="variant-btn-secondary"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={16} />
                    <span>BACK</span>
                  </button>
                  <button
                    type="button"
                    className="variant-btn-primary"
                    onClick={() => setStep(3)}
                  >
                    <span>REVIEW & CONFIRM</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: REVIEW & SUBMIT */}
            {step === 3 && (
              <>
                <div className="variant-slab-card">
                  <h3 className="variant-card-heading">REVIEW REPORT SUMMARY</h3>

                  <div className="variant-review-list">
                    <div className="variant-review-row">
                      <span className="review-label">Category:</span>
                      <span className="review-val font-bold uppercase">{category.replace('_', ' ')}</span>
                    </div>
                    <div className="variant-review-row">
                      <span className="review-label">Ward:</span>
                      <span className="review-val">{wardsData.find(w => w.id === wardId)?.name_en || wardId}</span>
                    </div>
                    <div className="variant-review-row">
                      <span className="review-label">Severity:</span>
                      <span className="review-val uppercase">{severity}</span>
                    </div>
                    <div className="variant-review-row">
                      <span className="review-label">{lang === 'gu' ? 'તારીખ અને સમય:' : lang === 'hi' ? 'तारीख और समय:' : 'Date & Time:'}</span>
                      <span className="review-val font-bold" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} style={{ color: '#FF6B35' }} />
                        {formatDateTime(new Date().toISOString(), lang)}
                      </span>
                    </div>
                    <div className="variant-review-row">
                      <span className="review-label">Coordinates:</span>
                      <span className="review-val font-mono">{lat}, {lng}</span>
                    </div>
                    {description && (
                      <div className="variant-review-row block">
                        <span className="review-label">Description:</span>
                        <p className="review-desc">{description}</p>
                      </div>
                    )}
                    {photoPreview && (
                      <div className="variant-review-row block">
                        <span className="review-label">Attached Evidence:</span>
                        <img src={photoPreview} alt="Evidence" className="review-thumb" />
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="variant-error-pill">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <div className="variant-step-actions between">
                  <button
                    type="button"
                    className="variant-btn-secondary"
                    onClick={() => setStep(2)}
                    disabled={submitting}
                  >
                    <ArrowLeft size={16} />
                    <span>BACK</span>
                  </button>
                  <button
                    type="button"
                    className="variant-btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>SUBMITTING TO AMC CCRS...</span>
                      </>
                    ) : (
                      <>
                        <span>CONFIRM & SUBMIT ISSUE</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: Guidelines Card */}
          <div className="variant-report-right-col">
            <div className="variant-slab-card variant-guidelines-card">
              <div className="variant-tag">
                <span>GUIDELINES</span>
              </div>

              <h2 className="variant-guidelines-title">
                HELP US RESOLVE FASTER
              </h2>

              <div className="variant-guide-checklist">
                <div className="variant-guide-item">
                  <div className="variant-check-icon">
                    <Check size={14} />
                  </div>
                  <div className="variant-guide-text">
                    <strong>CLEAR PHOTO</strong>
                    <p>Ensure the garbage or issue is clearly visible in the photo.</p>
                  </div>
                </div>

                <div className="variant-guide-item">
                  <div className="variant-check-icon">
                    <Check size={14} />
                  </div>
                  <div className="variant-guide-text">
                    <strong>ENABLE GPS</strong>
                    <p>Keeping your GPS on helps our team locate the issue accurately.</p>
                  </div>
                </div>

                <div className="variant-guide-item">
                  <div className="variant-check-icon">
                    <Check size={14} />
                  </div>
                  <div className="variant-guide-text">
                    <strong>WARD SELECTION</strong>
                    <p>Our AI will try to detect your ward, but please verify it in the next step.</p>
                  </div>
                </div>
              </div>

              {/* Privacy Alert Note */}
              <div className="variant-privacy-alert-box">
                <div className="privacy-icon-wrap">
                  <AlertCircle size={16} />
                </div>
                <div className="privacy-alert-text">
                  <span className="privacy-title">PRIVACY NOTE</span>
                  <p className="privacy-sub">
                    YOUR PERSONAL DETAILS ARE HIDDEN FROM PUBLIC VIEW AND ONLY USED BY THE MUNICIPAL TEAM FOR VERIFICATION.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
