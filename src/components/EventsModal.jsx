import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { X, Calendar, MapPin, Users, Plus, CheckCircle2, Sparkles, Clock, Shield, Share2 } from 'lucide-react';
import defaultEventsData from '../data/events.json';
import { addKarmaPoints } from '../utils/gamification';

export const EventsModal = ({ isOpen, onClose, onOpenCreateEvent, onOpenShareCard, onFlyToEvent }) => {
  const { t, lang } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinedMap, setJoinedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('amdavad_safai_joined_events') || '{}');
    } catch {
      return {};
    }
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setEvents(data);
          return;
        }
      }
      setEvents(defaultEventsData);
    } catch {
      setEvents(defaultEventsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJoin = async (eventId, e) => {
    e.stopPropagation();
    if (joinedMap[eventId]) return;

    try {
      await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // offline optimistic update
    }

    const updatedJoined = { ...joinedMap, [eventId]: true };
    setJoinedMap(updatedJoined);
    localStorage.setItem('amdavad_safai_joined_events', JSON.stringify(updatedJoined));

    // Update local count
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, volunteers_joined: ev.volunteers_joined + 1 } : ev))
    );

    // Award Gamification Points
    addKarmaPoints('EVENT_JOINED', 50);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content events-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '88vh', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
            padding: '20px 24px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={22} style={{ color: '#6EE7B7' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                {t('cleanup_drives')}
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#A7F3D0', margin: '4px 0 0 0' }}>
              {t('cleanup_drives_subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onOpenCreateEvent}
              style={{
                background: '#F59E0B',
                color: '#1E293B',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <Plus size={15} />
              {t('organize_drive')}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Events List Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--color-bg-primary, #F8FAFC)' }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748B' }}>
              <p>No upcoming drives found. Be the first to organize one!</p>
            </div>
          ) : (
            events.map((evt) => {
              const isJoined = !!joinedMap[evt.id];
              const title = lang === 'gu' ? evt.title_gu : lang === 'hi' ? evt.title_hi || evt.title_en : evt.title_en;
              const desc = lang === 'gu' ? evt.description_gu : lang === 'hi' ? evt.description_hi || evt.description_en : evt.description_en;

              return (
                <div
                  key={evt.id}
                  style={{
                    background: 'var(--color-bg-elevated, #FFFFFF)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    padding: '16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                        📍 {evt.location_name}
                      </span>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '6px 0 2px 0', color: 'var(--color-text-primary, #0F172A)' }}>
                        {title}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {evt.date_time}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={15} /> {evt.volunteers_joined}/{evt.target_volunteers}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>{t('volunteers_joined_label')}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary, #475569)', margin: 0, lineHeight: 1.45 }}>
                    {desc}
                  </p>

                  <div style={{ fontSize: '11.5px', color: '#64748B', background: 'rgba(0,0,0,0.02)', padding: '6px 10px', borderRadius: '6px' }}>
                    🧰 <strong>{t('items_needed')}:</strong> {evt.required_items}
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {onFlyToEvent && (
                        <button
                          onClick={() => {
                            onClose();
                            onFlyToEvent(evt.lat, evt.lng, evt);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <MapPin size={13} /> View on Map
                        </button>
                      )}
                      {onOpenShareCard && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenShareCard({
                              type: 'event',
                              title: title,
                              location: evt.location_name,
                              date_time: evt.date_time,
                              volunteers: evt.volunteers_joined
                            });
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Share2 size={13} /> Share
                        </button>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleJoin(evt.id, e)}
                      style={{
                        background: isJoined ? '#10B981' : '#059669',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '7px 16px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: isJoined ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isJoined ? 'none' : '0 2px 8px rgba(5,150,105,0.25)'
                      }}
                    >
                      {isJoined ? (
                        <>
                          <CheckCircle2 size={15} /> {t('drive_joined')}
                        </>
                      ) : (
                        <>
                          <Users size={15} /> {t('join_drive')} (+50 pts)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default EventsModal;
