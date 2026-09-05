import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { X, Calendar, MapPin, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import wardsData from '../data/wards.json';
import { addKarmaPoints } from '../utils/gamification';

export const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const { t, lang } = useTranslation();
  const [wardId, setWardId] = useState('ward_08');
  const [titleEn, setTitleEn] = useState('');
  const [titleGu, setTitleGu] = useState('');
  const [locationName, setLocationName] = useState('');
  const [dateTime, setDateTime] = useState('This Sunday • 7:00 AM - 9:00 AM');
  const [targetVolunteers, setTargetVolunteers] = useState(25);
  const [requiredItems, setRequiredItems] = useState('Gloves, Garbage Bags, Water Bottle');
  const [organizerName, setOrganizerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!titleEn.trim() && !titleGu.trim()) {
      setError('Please provide a title for the cleanup drive');
      return;
    }
    if (!locationName.trim()) {
      setError('Please specify a landmark or meeting location');
      return;
    }

    const selectedWard = wardsData.find((w) => w.id === wardId) || wardsData[0];
    const finalTitleEn = titleEn.trim() || titleGu.trim();
    const finalTitleGu = titleGu.trim() || titleEn.trim();

    const payload = {
      ward_id: wardId,
      title_en: finalTitleEn,
      title_gu: finalTitleGu,
      description_en: `Citizen-led community cleanliness drive at ${locationName}. All Ahmedabad residents welcome to participate.`,
      description_gu: `${locationName} ખાતે નાગરિક આગેવાની હેઠળ સામુદાયિક સફાઈ અભિયાન. અમદાવાદના તમામ નાગરિકોનું સ્વાગત છે.`,
      location_name: locationName.trim(),
      date_time: dateTime.trim(),
      organizer_name: organizerName.trim() || 'Amdavad Clean Volunteer Squad',
      target_volunteers: parseInt(targetVolunteers, 10) || 25,
      volunteers_joined: 1,
      required_items: requiredItems.trim(),
      lat: selectedWard.lat,
      lng: selectedWard.lng,
      status: 'upcoming'
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        addKarmaPoints('EVENT_CREATED', 100, { targetId: created.id, description: `Organized Cleanup Drive: ${finalTitleEn}` });
        setSuccess(true);
        if (onEventCreated) onEventCreated(created);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      } else {
        setError('Failed to create event. Please try again.');
      }
    } catch {
      // Optimistic offline fallback
      addKarmaPoints('EVENT_CREATED', 100, { targetId: `event_local_${Date.now()}`, description: `Organized Cleanup Drive: ${finalTitleEn}` });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', borderRadius: '16px', overflow: 'hidden' }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            padding: '18px 22px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} />
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
              {t('create_event_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {error && <div style={{ color: '#DC2626', fontSize: '12px', background: '#FEE2E2', padding: '8px 12px', borderRadius: '6px' }}>{error}</div>}
          {success && (
            <div style={{ color: '#16A34A', fontSize: '13px', background: '#DCFCE7', padding: '10px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Cleanup drive created! +100 Karma Points earned!
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
              {t('select_ward')}
            </label>
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            >
              {wardsData.map((w) => (
                <option key={w.id} value={w.id}>
                  {lang === 'gu' ? w.name_gu : lang === 'hi' ? w.name_hi || w.name_en : w.name_en} ({lang === 'gu' ? w.zone_gu : w.zone_en})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
              {t('event_title_label')} (English / ગુજરાતી)
            </label>
            <input
              type="text"
              placeholder="e.g. Sunday Kankaria Lake Morning Clean Drive"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
              {t('event_location_label')}
            </label>
            <input
              type="text"
              placeholder="e.g. Vastrapur Lake Amphitheater Gate 1"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                Date & Time
              </label>
              <input
                type="text"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                {t('event_target_label')}
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={targetVolunteers}
                onChange={(e) => setTargetVolunteers(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
              {t('event_items_label')}
            </label>
            <input
              type="text"
              value={requiredItems}
              onChange={(e) => setRequiredItems(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#059669',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
            }}
          >
            {submitting ? 'Creating Drive...' : 'Publish Cleanup Drive (+100 pts)'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default CreateEventModal;
