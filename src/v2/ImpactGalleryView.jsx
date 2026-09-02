import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { ArrowRight, MapPin, Calendar } from 'lucide-react';

export const ImpactGalleryView = ({ onOpenEvents }) => {
  const { lang } = useTranslation();

  const galleryItems = [
    {
      id: 1,
      type: 'photo',
      title: lang === 'gu'
        ? 'વસ્ત્રાપુર તળાવ સફાઈ અભિયાન (પહેલાં)'
        : lang === 'hi'
        ? 'वस्त्रापुर झील सफाई अभियान (पहले)'
        : 'Vastrapur Lakefront Cleanliness Drive',
      badge: lang === 'gu' ? 'પહેલાં' : lang === 'hi' ? 'पहले' : 'BEFORE',
      badgeType: 'before',
      image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
      ward: lang === 'gu' ? 'વોર્ડ ૧૪, પશ્ચિમ ઝોન' : 'Ward 14, West Zone',
      date: 'Oct 14, 2024'
    },
    {
      id: 2,
      type: 'stat',
      tag: lang === 'gu' ? 'આંકડાકીય અપડેટ' : lang === 'hi' ? 'आंकड़े अपडेट' : 'STATS UPDATE',
      number: '8.4 TONS',
      description: lang === 'gu'
        ? 'સાબરમતી નદીના કિનારેથી નાગરિકોના રિપોર્ટિંગ દ્વારા આ મહિને એકત્રિત કચરો.'
        : lang === 'hi'
        ? 'साबरमती तट से नागरिकों की रिपोर्टिंग द्वारा इस माह एकत्र कचरा।'
        : 'WASTE DIVERTED FROM SABARMATI BANKS THIS MONTH ALONE THROUGH COMMUNITY REPORTING.',
      accent: 'orange'
    },
    {
      id: 3,
      type: 'photo',
      title: lang === 'gu'
        ? 'લો ગાર્ડન સામુદાયિક સફાઈ (સાફ થયેલ)'
        : lang === 'hi'
        ? 'लॉ गार्डन सामुदायिक सफाई (हल हुआ)'
        : 'Law Garden Community Restoration',
      badge: lang === 'gu' ? 'સાફ થયેલ' : lang === 'hi' ? 'समाधानित' : 'RESOLVED',
      badgeType: 'resolved',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      ward: lang === 'gu' ? 'વોર્ડ ૦૮, મધ્ય ઝોન' : 'Ward 08, Central Zone',
      date: 'Oct 11, 2024'
    },
    {
      id: 4,
      type: 'cta',
      title: lang === 'gu'
        ? 'આગામી રવિવાર સફાઈમાં જોડાઓ'
        : lang === 'hi'
        ? 'आगामी रविवार सफाई में जुड़ें'
        : 'JOIN UPCOMING SUNDAY CLEANUP',
      subtitle: lang === 'gu'
        ? 'આગામી નાગરિક સફાઈ અભિયાનમાં ભાગ લો અને +૫૦ કર્મા પોઈન્ટ મેળવો.'
        : lang === 'hi'
        ? 'अगले नागरिक स्वच्छता अभियान में भाग लें और +50 कर्म अंक अर्जित करें।'
        : 'Be part of the next high-impact citizen sanitation drive and earn +50 Karma points.',
      buttonText: lang === 'gu' ? 'અભિયાન જુઓ' : lang === 'hi' ? 'अभियान देखें' : 'EXPLORE DRIVES',
      action: onOpenEvents
    },
    {
      id: 5,
      type: 'photo',
      title: lang === 'gu'
        ? 'સાબરમતી રિવરફ્રન્ટ વોકવે રૂપાંતરણ'
        : lang === 'hi'
        ? 'साबरमती रिवरफ्रंट वॉकवे रूपांतरण'
        : 'Sabarmati Riverfront Walkway Transformation',
      badge: lang === 'gu' ? 'સાફ થયેલ' : lang === 'hi' ? 'समाधानित' : 'RESOLVED',
      badgeType: 'resolved',
      image: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&auto=format&fit=crop&q=80',
      ward: lang === 'gu' ? 'વોર્ડ ૧૨, રિવરફ્રન્ટ પૂર્વ' : 'Ward 12, Riverfront East',
      date: 'Oct 04, 2024'
    },
    {
      id: 6,
      type: 'stat',
      tag: lang === 'gu' ? 'AMC કાર્યક્ષમતા' : lang === 'hi' ? 'AMC कार्यकुशलता' : 'AMC EFFICIENCY',
      number: '92.4%',
      description: lang === 'gu'
        ? 'તમામ ૨૭ વોર્ડમાં ૪૮ કલાકની અંદર ઉકેલાયેલ નાગરિક ફરિયાદોની ટકાવારી.'
        : lang === 'hi'
        ? 'सभी 27 वार्डों में 48 घंटे के भीतर हल की गई नागरिक शिकायतों का प्रतिशत।'
        : 'OF OVERDUE CITIZEN COMPLAINTS RESOLVED WITHIN 48 HOURS ACROSS ALL 27 WARDS.',
      accent: 'dark'
    }
  ];

  return (
    <div className="variant-impact-container">
      {/* Hero Header Row */}
      <div className="variant-impact-hero-grid">
        <div className="variant-impact-title-wrap">
          <div className="variant-tag">
            <span>{lang === 'gu' ? 'દૃશ્ય પુરાવા' : lang === 'hi' ? 'प्रत्यक्ष साक्ष्य' : 'VISUAL EVIDENCE'}</span>
          </div>

          <h1 className="variant-impact-main-title">
            {lang === 'gu' ? (
              <>સામુદાયિક<br /><span className="variant-highlight-orange">પ્રભાવ</span><br />ગેલેરી</>
            ) : lang === 'hi' ? (
              <>सामुदायिक<br /><span className="variant-highlight-orange">प्रभाव</span><br />गैलरी</>
            ) : (
              <>COMMUNITY<br /><span className="variant-highlight-orange">IMPACT</span><br />GALLERY</>
            )}
          </h1>
        </div>

        {/* Right Metric Card */}
        <div className="variant-slab-card variant-impact-metric-card">
          <div className="variant-impact-metric-num">1.2k+</div>
          <span className="variant-impact-metric-sub">
            {lang === 'gu' ? 'સાપ્તાહિક નિરાકરણ' : lang === 'hi' ? 'साप्ताहिक समाधान' : 'WEEKLY RESOLUTIONS'}
          </span>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="variant-impact-grid">
        {galleryItems.map((item) => {
          if (item.type === 'stat') {
            return (
              <div key={item.id} className="variant-slab-card variant-impact-stat-card">
                <span className="variant-tag">{item.tag}</span>
                <div className="impact-stat-number">{item.number}</div>
                <p className="impact-stat-desc">{item.description}</p>
              </div>
            );
          }

          if (item.type === 'cta') {
            return (
              <div key={item.id} className="variant-slab-card variant-impact-cta-card">
                <div className="variant-tag text-white">
                  {lang === 'gu' ? 'નાગરિક સક્રિયતા' : lang === 'hi' ? 'नागरिक सहभागिता' : 'COMMUNITY ACTION'}
                </div>
                <h3 className="impact-cta-title">{item.title}</h3>
                <p className="impact-cta-sub">{item.subtitle}</p>
                <button
                  type="button"
                  className="variant-btn-secondary"
                  style={{ background: '#FFFFFF', color: '#FF6B35', fontWeight: '900' }}
                  onClick={item.action}
                >
                  <span>{item.buttonText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          }

          return (
            <div key={item.id} className="variant-slab-card variant-impact-photo-card">
              <div className="impact-photo-wrap">
                <img src={item.image} alt={item.title} className="impact-img" />
                <span className={`impact-badge ${item.badgeType}`}>
                  {item.badge}
                </span>
              </div>
              <div className="impact-photo-body">
                <h4 className="impact-photo-title">{item.title}</h4>
                <div className="impact-photo-meta">
                  <span className="meta-ward">
                    <MapPin size={12} />
                    {item.ward}
                  </span>
                  <span className="meta-date">
                    <Calendar size={12} />
                    {item.date}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImpactGalleryView;
