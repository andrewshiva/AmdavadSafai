import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { MapPin, Calendar, Clock, ShoppingBag, Plus, Users, Check } from 'lucide-react';
import defaultEventsData from '../data/events.json';
import { addKarmaPoints } from '../utils/gamification';

export const CleanupDrivesView = ({ onOpenCreateEvent, onRequireLogin, onNavigateToImpact }) => {
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
    fetchEvents();
  }, []);

  const handleJoin = async (eventId) => {
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

    // Update local volunteer count
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, volunteers_joined: ev.volunteers_joined + 1 } : ev))
    );

    // Award +50 Karma Points with deduplication
    addKarmaPoints('EVENT_JOINED', 50, {
      targetId: eventId,
      description: 'Joined Sunday Community Cleanup Drive'
    });
  };

  return (
    <div className="variant-drives-container">
      {/* HEADER WITH TITLE & ORGANIZE CTA */}
      <div className="variant-drives-header">
        <div>
          <span className="variant-tag">
            {lang === 'gu' ? 'નાગરિક સક્રિયતા' : lang === 'hi' ? 'नागरिक सहभागिता' : 'COMMUNITY ACTION'}
          </span>
          <h1 className="variant-drives-title">
            {lang === 'gu' ? 'સફાઈ અભિયાન' : lang === 'hi' ? 'सफाई अभियान' : 'CLEANUP DRIVES'}
          </h1>
          <p className="variant-drives-sub">
            {lang === 'gu'
              ? 'અમદાવાદ શહેરમાં આગામી રવિવારના સામુદાયિક સફાઈ અભિયાનો.'
              : lang === 'hi'
              ? 'अहमदाबाद शहर में आगामी रविवार के सामुदायिक सफाई अभियान।'
              : 'Upcoming Sunday community cleanups across the city of Ahmedabad.'}
          </p>
        </div>

        <button
          type="button"
          className="variant-organize-btn"
          onClick={onOpenCreateEvent}
        >
          <Plus size={16} />
          <span>
            {lang === 'gu' ? '+ નવું અભિયાન શરૂ કરો' : lang === 'hi' ? '+ नया अभियान आयोजित करें' : '+ ORGANIZE A CLEANUP'}
          </span>
        </button>
      </div>

      {/* DRIVES CARDS LIST */}
      <div className="variant-drives-list">
        {events.map((event) => {
          const isJoined = !!joinedMap[event.id];
          const progressPercent = Math.min(
            100,
            Math.round(((event.volunteers_joined || 0) / (event.target_volunteers || 30)) * 100)
          );

          const eventTitle = lang === 'gu' && event.title_gu
            ? event.title_gu
            : lang === 'hi' && event.title_hi
            ? event.title_hi
            : event.title_en || 'Sunday Cleanup Drive';

          const eventDesc = lang === 'gu' && event.description_gu
            ? event.description_gu
            : lang === 'hi' && event.description_hi
            ? event.description_hi
            : event.description_en || 'Join community volunteers to restore cleanliness.';

          return (
            <div key={event.id} className="variant-slab-card variant-drive-card">
              {/* Location Tag */}
              <div className="drive-location-tag">
                <MapPin size={13} className="drive-pin-icon" />
                <span>{event.location_name?.toUpperCase()}</span>
              </div>

              {/* Title */}
              <h2 className="drive-main-title">
                {eventTitle.toUpperCase()}
              </h2>

              {/* Date & Time */}
              <div className="drive-datetime-row">
                <span className="datetime-item">
                  <Calendar size={13} /> {event.date_time ? event.date_time.split('•')[0] : (lang === 'gu' ? 'આ રવિવાર' : 'This Sunday')}
                </span>
                <span className="datetime-sep">·</span>
                <span className="datetime-item">
                  <Clock size={13} /> {event.date_time && event.date_time.includes('•') ? event.date_time.split('•')[1] : '7:00 AM - 9:00 AM'}
                </span>
              </div>

              {/* Description */}
              <p className="drive-description">
                {eventDesc}
              </p>

              {/* Recessed Slab: Items to Bring */}
              <div className="drive-recessed-items-slab">
                <div className="items-icon-wrap">
                  <ShoppingBag size={14} />
                </div>
                <div className="items-text-wrap">
                  <span className="items-label">
                    {lang === 'gu' ? 'સાથે લાવવાની વસ્તુઓ' : lang === 'hi' ? 'साथ लाने वाली वस्तुएं' : 'ITEMS TO BRING'}
                  </span>
                  <span className="items-val">
                    {event.required_items || 'Cotton Gloves, Trash Grabbers, Water Bottle'}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Volunteers Progress & Join Button */}
              <div className="drive-card-footer">
                <div className="drive-volunteers-group">
                  <div className="volunteers-label-row">
                    <span className="vol-label">
                      <Users size={13} /> {lang === 'gu' ? 'સ્વયંસેવકો' : lang === 'hi' ? 'स्वयंसेवक' : 'VOLUNTEERS'}
                    </span>
                    <span className="vol-count">
                      {event.volunteers_joined}/{event.target_volunteers} {lang === 'gu' ? 'જોડાયા' : lang === 'hi' ? 'शामिल' : 'Joined'}
                    </span>
                  </div>
                  <div className="vol-progress-track">
                    <div
                      className="vol-progress-bar"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className={`variant-join-drive-btn ${isJoined ? 'joined' : ''}`}
                  onClick={() => handleJoin(event.id)}
                  disabled={isJoined}
                >
                  {isJoined ? (
                    <>
                      <Check size={14} />
                      <span>{lang === 'gu' ? 'જોડાઈ ગયા! 🎉' : lang === 'hi' ? 'शामिल हो गए! 🎉' : 'JOINED! 🎉'}</span>
                    </>
                  ) : (
                    <>
                      <span className="tent-icon">⛺</span>
                      <span>
                        {lang === 'gu'
                          ? 'અભિયાનમાં જોડાઓ (+૫૦ પોઈન્ટ)'
                          : lang === 'hi'
                          ? 'अभियान से जुड़ें (+50 अंक)'
                          : 'JOIN CLEANUP (RSVP) (+50 PTS)'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM IMPACT BANNER SLAB */}
      <div className="variant-slab-card variant-drives-impact-banner">
        <span className="impact-banner-tag">
          {lang === 'gu' ? 'અસર / ઇમ્પેક્ટ' : lang === 'hi' ? 'प्रभाव / इम्पैक्ट' : 'IMPACT'}
        </span>
        <h2 className="impact-banner-title">
          {lang === 'gu' ? 'અમદાવાદને સ્વચ્છ બનાવીએ છીએ' : lang === 'hi' ? 'अहमदाबाद को बना रहे हैं स्वच्छ' : 'MAKING AHMEDABAD CLEAN'}
        </h2>
        <p className="impact-banner-sub">
          {lang === 'gu'
            ? 'સ્વયંસેવકો દ્વારા ગયા મહિને ૨,૪૦૦ કિલોથી વધુ કચરો એકત્રિત કરવામાં આવ્યો.'
            : lang === 'hi'
            ? 'स्वयंसेवकों द्वारा पिछले माह 2,400 किग्रा से अधिक कचरा एकत्र किया गया।'
            : 'OVER 2,400 KGS OF WASTE COLLECTED BY VOLUNTEERS LAST MONTH.'}
        </p>
        <button
          type="button"
          className="variant-view-impact-btn"
          onClick={onNavigateToImpact}
        >
          {lang === 'gu' ? 'ઇમ્પેક્ટ રિપોર્ટ જુઓ' : lang === 'hi' ? 'इम्पैक्ट रिपोर्ट देखें' : 'VIEW IMPACT REPORTS'}
        </button>
      </div>
    </div>
  );
};

export default CleanupDrivesView;
