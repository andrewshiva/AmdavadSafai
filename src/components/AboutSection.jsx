import React, { useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { ArrowRight, MapPin, Play, Camera, Zap, Truck, CheckCircle2, ShieldCheck, Clock, PhoneCall } from 'lucide-react';

export const AboutSection = ({ onOpenReport, onOpenEvents, onToggleStats, onOpenVideo, currentUser }) => {
  const { lang } = useTranslation();
  const videoRef = useRef(null);

  const handleSeek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const content = {
    // Top Hero Introduction
    tag_intro: lang === 'gu' ? 'અમદાવાદ સફાઈ · પરિચય અને નાગરિક પહેલ' : lang === 'hi' ? 'अहमदाबाद सफाई · परिचय एवं नागरिक मंच' : 'CIVIC INTRODUCTION · AHMEDABAD SAFAI',
    hero_title: lang === 'gu' ? (
      <>
        કચરાની ફરિયાદ કરો.<br />
        <span className="variant-highlight-orange">AMC ઉકેલ</span> લાઇવ ટ્રેક કરો.
      </>
    ) : lang === 'hi' ? (
      <>
        कचरे की शिकायत करें.<br />
        <span className="variant-highlight-orange">AMC समाधान</span> लाइव ट्रैक करें.
      </>
    ) : (
      <>
        REPORT CIVIC WASTE.<br />
        TRACK <span className="variant-highlight-orange">LIVE AMC</span><br />
        <span className="variant-highlight-orange">RESOLUTION.</span>
      </>
    ),
    hero_subtitle: lang === 'gu'
      ? 'અમદાવાદનું સત્તાવાર નાગરિક સ્વચ્છતા નેટવર્ક. રસ્તા પરનો કચરો, ભરાયેલી કચરાપેટી અને ગટરની સમસ્યાઓ સીધા AMC સુધી ૬૦ સેકન્ડમાં પહોંચાડો.'
      : lang === 'hi'
      ? 'अहमदाबाद का आधिकारिक नागरिक स्वच्छता नेटवर्क। सड़क का कचरा, भरे हुए डस्टबिन और नाली की समस्याएं 60 सेकंड में सीधे AMC तक पहुंचाएं।'
      : "Ahmedabad's dedicated citizen sanitation platform. Report roadside garbage dumps, overflowing bins, and drainage issues directly to AMC in under 60 seconds with real-time GPS tracking.",

    btn_report_now: lang === 'gu' ? '+ ફરિયાદ નોંધાવો' : lang === 'hi' ? '+ शिकायत दर्ज करें' : '+ REPORT AN ISSUE',
    btn_watch_video: lang === 'gu' ? 'વિડિઓ જુઓ' : lang === 'hi' ? 'वीडियो देखें' : 'WATCH 2-MIN VIDEO',
    btn_view_impact: lang === 'gu' ? 'ઇમ્પેક્ટ રિપોર્ટ' : lang === 'hi' ? 'इम्पैक्ट रिपोर्ट' : 'VIEW IMPACT REPORT',

    // Quick Facts
    fact_sla_title: lang === 'gu' ? '૨૪-કલાક SLA' : lang === 'hi' ? '24-घंटे SLA' : '24-HOUR SLA',
    fact_sla_desc: lang === 'gu' ? 'સ્વચ્છતા મિશન સમયમર્યાદા' : lang === 'hi' ? 'स्वच्छता मिशन समय सीमा' : 'SWACHHATA RESOLUTION TARGET',
    fact_amc_title: lang === 'gu' ? 'AMC ૧૫૫૩૦૩ લિંક્ડ' : lang === 'hi' ? 'AMC 155303 से जुड़ा' : 'AMC 155303 LINKED',
    fact_amc_desc: lang === 'gu' ? 'સેન્ટ્રલ કંટ્રોલ રૂમ કનેક્ટ' : lang === 'hi' ? 'कंट्रोल रूम से सीधा समन्वय' : 'CENTRAL CONTROL ROOM SYNC',
    fact_wards_title: lang === 'gu' ? '૪૮ વોર્ડ કવરેજ' : lang === 'hi' ? '48 वार्ड कवरेज' : '48 WARDS COVERED',
    fact_wards_desc: lang === 'gu' ? 'અમદાવાદના તમામ વોર્ડમાં સક્રિય' : lang === 'hi' ? 'अहमदाबाद के सभी वार्डों में सक्रिय' : 'MONITORING ACROSS ALL 48 WARDS',

    // Introduction Video Showcase
    video_tag: lang === 'gu' ? 'પ્લેટફોર્મ પરિચય વિડિઓ' : lang === 'hi' ? 'प्लेटफ़ॉर्म परिचय वीडियो' : 'PLATFORM INTRODUCTION VIDEO',
    video_title: lang === 'gu' ? 'અમદાવાદ સફાઈ કેવી રીતે કાર્ય કરે છે તે જુઓ' : lang === 'hi' ? 'देखें अहमदाबाद सफाई कैसे काम करता है' : 'WATCH HOW AMDAVAD SAFAI WORKS',
    video_subtitle: lang === 'gu'
      ? 'રીઅલ-ટાઇમ ફરિયાદ મેપિંગ, ઓટોમેટેડ એએમસી ડિસ્પેચ અને નાગરિક કર્મ પોઈન્ટ્સની ૨ મિનિટની વિડિઓ ઝાંખી.'
      : lang === 'hi'
      ? 'रीयल-टाइम शिकायत मैपिंग, स्वचालित एएमसी प्रेषण और नागरिक कर्म रिवार्ड का 2 मिनट का वीडियो अवलोकन।'
      : 'A 2-minute dynamic walkthrough of real-time complaint mapping, automated AMC departmental dispatch, and verified citizen karma rewards.',
    theater_mode: lang === 'gu' ? 'મોટા પડદે જુઓ ↗' : lang === 'hi' ? 'थिएटर मोड ↗' : 'THEATER MODE ↗',

    // Video Chapters
    chap1: lang === 'gu' ? 'ફોટો અને GPS ટેગ' : lang === 'hi' ? 'फोटो और GPS टैग' : 'Photo & GPS Geotag',
    chap2: lang === 'gu' ? 'AMC વિભાગીય ડિસ્પેચ' : lang === 'hi' ? 'AMC विभागीय प्रेषण' : 'AMC Dept Dispatch',
    chap3: lang === 'gu' ? 'લાઇવ વાહન ટ્રેકિંગ' : lang === 'hi' ? 'लाइव वाहन ट्रैकिंग' : 'Live SLA Tracking',
    chap4: lang === 'gu' ? 'ખાતરી અને કર્મ પોઈન્ટ્સ' : lang === 'hi' ? 'सत्यापन और कर्म' : 'Verification & Karma',

    // 4-Step Workflow
    how_tag: lang === 'gu' ? 'કાર્યપદ્ધતિ' : lang === 'hi' ? 'कार्यप्रणाली' : 'SYSTEM PROCESS',
    how_title: lang === 'gu' ? '૪ સરળ પગલાંમાં સમસ્યાનો નિકાલ' : lang === 'hi' ? '4 सरल चरणों में समस्या का समाधान' : 'HOW IT WORKS: 4-STEP RESOLUTION',
    step1_title: lang === 'gu' ? '૦૧. ફોટો પાડો અને ફરિયાદ કરો' : lang === 'hi' ? '01. फोटो खींचें और शिकायत करें' : '01. CAPTURE & REPORT',
    step1_desc: lang === 'gu' ? 'એપ વડે ફોટો પાડો. GPS આપોઆપ ચોક્કસ વોર્ડ અને અક્ષાંશ-રેખાંશ શોધી લેશે.' : lang === 'hi' ? 'ऐप से फोटो खींचें। GPS अपने आप सटीक वार्ड और स्थान पहचान लेगा।' : 'Snap a quick photo using our web app. GPS auto-detects ward boundaries and coordinates in seconds.',
    step2_title: lang === 'gu' ? '૦૨. AI વર્ગીકરણ અને AMC ડિસ્પેચ' : lang === 'hi' ? '02. AI वर्गीकरण और AMC प्रेषण' : '02. AI CATEGORIZATION & DISPATCH',
    step2_desc: lang === 'gu' ? 'સિસ્ટમ આપોઆપ યોગ્ય AMC વિભાગ (SWM, ડ્રેનેજ, ઢોર નિયંત્રણ, લાઇટિંગ) ને ફરિયાદ મોકલે છે.' : lang === 'hi' ? 'सिस्टम स्वचालित रूप से सही AMC विभाग (SWM, सीवेज, पशु नियंत्रण) को भेजता है।' : 'System auto-routes tickets to relevant AMC departments (Solid Waste, Drainage, CNCD, Electrical).',
    step3_title: lang === 'gu' ? '૦૩. રીઅલ-ટાઇમ ટ્રેકિંગ' : lang === 'hi' ? '03. रीयल-टाइम ट्रैकिंग' : '03. TRACK IN REAL-TIME',
    step3_desc: lang === 'gu' ? 'વોર્ડ ઇન્સ્પેક્ટર અને વાહનની સ્થિતિ જુઓ. કામ શરૂ થાય ત્યારે SMS/સૂચના મેળવો.' : lang === 'hi' ? 'वार्ड निरीक्षक और कचरा वाहन की स्थिति देखें। सफाई शुरू होने पर सूचना पाएं।' : 'Track sanitation vehicle status and ward supervisor action live with transparent Swachhata SLA timers.',
    step4_title: lang === 'gu' ? '૦૪. નાગરિક ખાતરી અને કર્મ' : lang === 'hi' ? '04. नागरिक सत्यापन और कर्म' : '04. RESOLUTION & KARMA',
    step4_desc: lang === 'gu' ? 'સફાઈ પૂર્ણ થયાનો પુરાવો ચકાસો, રેટિંગ આપો અને +૫૦ સફાઈ કર્મ પોઈન્ટ્સ મેળવો.' : lang === 'hi' ? 'सफाई का फोटो प्रमाण देखें, रेटिंग दें और +50 सफाई कर्म पॉइंट्स प्राप्त करें।' : 'Review the after-photo uploaded by the municipal team, confirm completion, and earn +50 Karma Points.',

    // Stats Metrics
    stats_reports: lang === 'gu' ? 'કુલ ફરિયાદો' : lang === 'hi' ? 'कुल शिकायतें' : 'REPORTS FILED',
    stats_reports_sub: lang === 'gu' ? 'નોંધાયેલી સમસ્યાઓ' : lang === 'hi' ? 'दर्ज की गई समस्याएं' : 'RECORDED ISSUES',
    stats_success: lang === 'gu' ? 'સફળતા દર' : lang === 'hi' ? 'सफलता दर' : 'SUCCESS RATE',
    stats_success_sub: lang === 'gu' ? '૧૧,૨૦૪ ઉકેલાયેલ કેસો' : lang === 'hi' ? '11,204 सुलझाए गए मामले' : '11,204 RESOLVED CASES',
    stats_citizens: lang === 'gu' ? 'સક્રિય નાગરિકો' : lang === 'hi' ? 'सक्रिय नागरिक' : 'ACTIVE CITIZENS',
    stats_citizens_sub: lang === 'gu' ? 'સ્વચ્છતા મંચ પર' : lang === 'hi' ? 'स्वच्छता नेटवर्क से जुड़े' : 'SWACHHATA ADVOCATES',
    stats_coverage: lang === 'gu' ? 'વોર્ડ કવરેજ' : lang === 'hi' ? 'वार्ड कवरेज' : 'WARD COVERAGE',
    stats_coverage_sub: lang === 'gu' ? '૧૦૦% અમદાવાદ કવર' : lang === 'hi' ? '100% अहमदाबाद शामिल' : 'ALL 48 WARDS ACTIVE',

    // About Us & Governance
    about_tag: lang === 'gu' ? 'અમારા વિશે અને શાસન' : lang === 'hi' ? 'हमारे बारे में और सुशासन' : 'ABOUT US & GOVERNANCE',
    about_title: lang === 'gu' ? 'અમારો ઉદ્દેશ્ય, દ્રષ્ટિ અને જાહેર પ્રતિબદ્ધતા' : lang === 'hi' ? 'हमारा मिशन, विज़न और सार्वजनिक प्रतिबद्धता' : 'OUR MISSION, VISION & CIVIC COMMITMENT',
    about_p1: lang === 'gu'
      ? 'અમદાવાદ સફાઈ એ નાગરિકો અને અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન (AMC) વચ્ચે પારદર્શિતા વધારતું ઓપન-સોર્સ નાગરિક મંચ છે. અમારું લક્ષ્ય અમદાવાદને દેશનું સૌથી સ્વચ્છ અને સૌથી ઝડપી ઉકેલ આપતું શહેર બનાવવાનું છે.'
      : lang === 'hi'
      ? 'अहमदाबाद सफाई नागरिकों और अहमदाबाद नगर निगम (AMC) के बीच पारदर्शिता बढ़ाने वाला एक ओपन-सोर्स नागरिक मंच है। हमारा लक्ष्य अहमदाबाद को भारत का सबसे स्वच्छ शहर बनाना है।'
      : 'Ahmedabad Safai is an open civic technology platform built to create direct accountability between citizens and the Ahmedabad Municipal Corporation (AMC). Our goal is to make Ahmedabad the cleanest, most responsive smart city in India.',
    about_p2: lang === 'gu'
      ? 'AMC કંટ્રોલ રૂમ (૧૫૫૩૦૩) અને સ્વચ્છ ભારત મિશન સાથે સંકલિત થઈને, અમે દરેક વોર્ડમાં કચરાના હોટસ્પોટ્સ દૂર કરીએ છીએ અને ચૂંટાયેલા કોર્પોરેટરોની કામગીરી જાહેર રાખીએ છીએ.'
      : lang === 'hi'
      ? 'AMC कंट्रोल रूम (155303) और स्वच्छ भारत मिशन के साथ एकीकृत होकर, हम प्रत्येक वार्ड में कचरे के हॉटस्पॉट दूर करते हैं और वार्ड पार्षदों का प्रदर्शन सार्वजनिक रखते हैं।'
      : 'Integrated directly with the AMC Central Control & Redressal System (155303) and Swachh Bharat guidelines, we maintain full public visibility on ward-level resolution times, corporator performance, and community cleanliness drives.',

    // Governance Badges
    gov_sla_title: lang === 'gu' ? 'નાગરિક અધિકારપત્ર (Citizen Charter)' : lang === 'hi' ? 'नागरिक अधिकार पत्र' : 'CITIZEN CHARTER SLA',
    gov_sla_desc: lang === 'gu' ? 'કચરો: ૧૨ કલાક · મૃત પશુ: ૨૪ કલાક · ગટર: ૪૮ કલાક' : lang === 'hi' ? 'कचरा: 12 घंटे · मृत पशु: 24 घंटे · नाली: 48 घंटे' : 'Garbage: 12h · Dead Animal: 24h · Drainage: 48h resolution SLA',
    gov_ccrs_title: lang === 'gu' ? 'ઓટોમેટેડ AMC ટિકિટિંગ' : lang === 'hi' ? 'स्वचालित AMC टिकटिंग' : 'AUTOMATED AMC TICKETING',
    gov_ccrs_desc: lang === 'gu' ? 'દરેક ફરિયાદને અધિકૃત AMC ફરિયાદ નંબર ફાળવાય છે.' : lang === 'hi' ? 'प्रत्येक शिकायत को आधिकारिक AMC शिकायत संख्या दी जाती है।' : 'Every complaint auto-generates an AMC CCRS reference number.',

    // Leadership Team
    team_tag: lang === 'gu' ? 'સંચાલન મંડળ' : lang === 'hi' ? 'प्रबंधन टीम' : 'LEADERSHIP TEAM',
    team_title: lang === 'gu' ? 'આપણા શહેરના સફાઈ સંયોજકો' : lang === 'hi' ? 'शहर के स्वच्छता समन्वयक' : 'THE TEAM BEHIND AMDAVAD SAFAI',
    role_director: lang === 'gu' ? 'પ્રોજેક્ટ ડિરેક્ટર' : lang === 'hi' ? 'परियोजना निदेशक' : 'PROJECT DIRECTOR',
    role_health: lang === 'gu' ? 'મુખ્ય આરોગ્ય અધિકારી' : lang === 'hi' ? 'मुख्य स्वास्थ्य अधिकारी' : 'CHIEF HEALTH OFFICER',
    role_tech: lang === 'gu' ? 'ટેકનોલોજી લીડ' : lang === 'hi' ? 'तकनीकी प्रमुख' : 'CIVIC TECH LEAD',
    role_outreach: lang === 'gu' ? 'સમુદાય સંયોજક' : lang === 'hi' ? 'आउटरीच प्रमुख' : 'COMMUNITY OUTREACH',

    // CTA
    cta_tag: lang === 'gu' ? 'સાથે મળીએ' : lang === 'hi' ? 'शामिल हों' : 'JOIN THE MOVEMENT',
    cta_title: lang === 'gu' ? 'અમદાવાદને સ્વચ્છ રાખવા તૈયાર છો?' : lang === 'hi' ? 'अहमदाबाद को स्वच्छ बनाने के लिए तैयार हैं?' : 'READY TO MAKE A DIFFERENCE?',
    cta_report: lang === 'gu' ? 'સમસ્યાની ફરિયાદ કરો' : lang === 'hi' ? 'समस्या दर्ज करें' : 'REPORT AN ISSUE NOW',
    cta_drives: lang === 'gu' ? 'રવિવાર સફાઈ અભિયાન' : lang === 'hi' ? 'रविवार सफाई अभियान' : 'SUNDAY CLEANUP DRIVES'
  };

  return (
    <div className="variant-about-container">
      {/* =========================================================================
          SECTION 1: PLATFORM INTRODUCTION HERO (ABOVE THE FOLD)
          ========================================================================= */}
      <section className="variant-hero-grid">
        {/* Left Hero Card: Introduction & Direct Actions */}
        <div className="variant-slab-card variant-hero-left">
          <div className="variant-tag">
            <span>{content.tag_intro}</span>
          </div>

          <h1 className="variant-hero-title">
            {content.hero_title}
          </h1>

          <p className="variant-hero-subtitle">
            {content.hero_subtitle}
          </p>

          <div className="variant-hero-actions">
            <button
              type="button"
              className="variant-btn-primary"
              onClick={onOpenReport}
            >
              <span>{content.btn_report_now}</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="variant-btn-secondary variant-watch-video-hero-btn"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  videoRef.current.play().catch(() => {});
                } else if (onOpenVideo) {
                  onOpenVideo();
                }
              }}
            >
              <Play size={14} className="play-icon-orange" fill="#FF6B35" />
              <span>{content.btn_watch_video}</span>
            </button>
            {currentUser && (
              <button
                type="button"
                className="variant-btn-secondary"
                onClick={onToggleStats}
              >
                <span>{content.btn_view_impact}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Hero Column: Instant Fact Slabs */}
        <div className="variant-hero-right-column">
          {/* Quick Fact 1: SLA Target */}
          <div className="variant-slab-card variant-mission-card">
            <div className="variant-tag">
              <Clock size={12} style={{ marginRight: '4px' }} />
              <span>{content.fact_sla_title}</span>
            </div>
            <h2 className="variant-right-heading">
              {content.fact_sla_desc}
            </h2>
            <p className="variant-right-desc">
              {lang === 'gu'
                ? 'દરેક કચરાની ફરિયાદ માટે સમયબદ્ધ ૧૨ થી ૪૮ કલાકની સમયમર્યાદા નિયત કરેલ છે.'
                : lang === 'hi'
                ? 'प्रत्येक कचरे की शिकायत के लिए समयबद्ध 12 से 48 घंटे की समय सीमा तय है।'
                : 'Automated escalation clock monitors civic tickets directly against AMC Swachhata standards.'}
            </p>
          </div>

          {/* 2-Column Mini Metrics */}
          <div className="variant-mission-metrics-row">
            <div className="variant-slab-card variant-mini-metric-card">
              <span className="variant-stat-label">
                <ShieldCheck size={14} style={{ color: '#10B981', display: 'inline', marginRight: '4px' }} />
                AMC 155303
              </span>
              <div className="variant-mini-metric-val">100%</div>
              <span className="variant-stat-sub">{content.fact_amc_desc}</span>
            </div>

            <div className="variant-slab-card variant-mini-metric-card">
              <span className="variant-stat-label">
                <MapPin size={14} style={{ color: '#6366F1', display: 'inline', marginRight: '4px' }} />
                {content.fact_wards_title}
              </span>
              <div className="variant-mini-metric-val">48/48</div>
              <span className="variant-stat-sub">{content.fact_wards_desc}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INTERACTIVE VIDEO DEMO & CHAPTERS (THE INTRODUCTION)
          ========================================================================= */}
      <section className="variant-slab-card variant-embedded-video-card" id="intro-video-section">
        <div className="embedded-video-header">
          <div>
            <div className="variant-tag">
              <span>{content.video_tag}</span>
            </div>
            <h2 className="embedded-video-title">
              {content.video_title}
            </h2>
            <p className="embedded-video-subtitle">
              {content.video_subtitle}
            </p>
          </div>

          <button
            type="button"
            className="variant-btn-secondary embedded-expand-btn"
            onClick={onOpenVideo}
          >
            <Play size={13} fill="#FF6B35" color="#FF6B35" />
            <span>{content.theater_mode}</span>
          </button>
        </div>

        {/* Interactive Video Chapter Markers */}
        <div className="embedded-video-chapters" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '4px 0 10px 0' }}>
          <button
            type="button"
            className="chapter-pill"
            onClick={() => handleSeek(0)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Camera size={12} color="#FF6B35" />
            <span>0:00 · {content.chap1}</span>
          </button>

          <button
            type="button"
            className="chapter-pill"
            onClick={() => handleSeek(30)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Zap size={12} color="#3B82F6" />
            <span>0:30 · {content.chap2}</span>
          </button>

          <button
            type="button"
            className="chapter-pill"
            onClick={() => handleSeek(55)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Truck size={12} color="#10B981" />
            <span>0:55 · {content.chap3}</span>
          </button>

          <button
            type="button"
            className="chapter-pill"
            onClick={() => handleSeek(80)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            <CheckCircle2 size={12} color="#8B5CF6" />
            <span>1:20 · {content.chap4}</span>
          </button>
        </div>

        {/* Video Player */}
        <div className="embedded-video-wrapper">
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            poster="/video_poster.jpg"
            className="embedded-video-element"
          >
            <source src="/intro_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS — 4-STEP RESOLUTION PROCESS
          ========================================================================= */}
      <section className="variant-how-section">
        <div className="variant-tag" style={{ textAlign: 'left', marginBottom: '8px' }}>
          <span>{content.how_tag}</span>
        </div>
        <h2 className="variant-section-title" style={{ textAlign: 'left', marginBottom: '24px' }}>
          {content.how_title}
        </h2>

        <div className="variant-how-list">
          {/* Step 1 */}
          <div className="variant-slab-card variant-how-card">
            <div className="variant-step-num">01</div>
            <div className="variant-step-body">
              <h3>{content.step1_title}</h3>
              <p>{content.step1_desc}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="variant-slab-card variant-how-card">
            <div className="variant-step-num">02</div>
            <div className="variant-step-body">
              <h3>{content.step2_title}</h3>
              <p>{content.step2_desc}</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="variant-slab-card variant-how-card">
            <div className="variant-step-num">03</div>
            <div className="variant-step-body">
              <h3>{content.step3_title}</h3>
              <p>{content.step3_desc}</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="variant-slab-card variant-how-card">
            <div className="variant-step-num">04</div>
            <div className="variant-step-body">
              <h3>{content.step4_title}</h3>
              <p>{content.step4_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: REAL-TIME CIVIC IMPACT STATS
          ========================================================================= */}
      <section className="variant-stats-section">
        <div className="variant-stats-grid">
          {/* Stat 1 */}
          <div className="variant-slab-card variant-stat-card">
            <span className="variant-stat-label">{content.stats_reports}</span>
            <div className="variant-stat-number">12,480</div>
            <span className="variant-stat-sub">{content.stats_reports_sub}</span>
          </div>

          {/* Stat 2 */}
          <div className="variant-slab-card variant-stat-card">
            <span className="variant-stat-label">{content.stats_success}</span>
            <div className="variant-stat-number">94.2%</div>
            <span className="variant-stat-sub">{content.stats_success_sub}</span>
          </div>

          {/* Stat 3 */}
          <div className="variant-slab-card variant-stat-card">
            <span className="variant-stat-label">{content.stats_citizens}</span>
            <div className="variant-stat-number">45k+</div>
            <span className="variant-stat-sub">{content.stats_citizens_sub}</span>
          </div>

          {/* Stat 4 */}
          <div className="variant-slab-card variant-stat-card">
            <span className="variant-stat-label">{content.stats_coverage}</span>
            <div className="variant-stat-number">48/48</div>
            <span className="variant-stat-sub">{content.stats_coverage_sub}</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ABOUT US, MUNICIPAL PARTNERSHIP & GOVERNANCE
          ========================================================================= */}
      <section className="variant-slab-card" style={{ padding: '36px 32px', background: '#FFFFFF', borderRadius: '28px', border: '1px solid #EBEFF5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="variant-tag" style={{ width: 'fit-content' }}>
          <span>{content.about_tag}</span>
        </div>

        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
          {content.about_title}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#475569' }}>
            {content.about_p1}
          </p>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#475569' }}>
            {content.about_p2}
          </p>
        </div>

        {/* Governance Commitment Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
          <div style={{ padding: '16px 20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
              <Clock size={16} color="#FF6B35" />
              <span>{content.gov_sla_title}</span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              {content.gov_sla_desc}
            </p>
          </div>

          <div style={{ padding: '16px 20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
              <PhoneCall size={16} color="#10B981" />
              <span>{content.gov_ccrs_title}</span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              {content.gov_ccrs_desc}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: LEADERSHIP & WARD SANITATION GOVERNANCE TEAM
          ========================================================================= */}
      <section className="variant-team-section">
        <div className="variant-tag" style={{ textAlign: 'left', marginBottom: '8px' }}>
          <span>{content.team_tag}</span>
        </div>
        <h2 className="variant-section-title" style={{ textAlign: 'left', marginBottom: '24px' }}>
          {content.team_title}
        </h2>

        <div className="variant-team-grid">
          {/* Team Member 1 */}
          <div className="variant-slab-card variant-team-card">
            <div className="variant-team-avatar">
              <span>DR</span>
            </div>
            <h4 className="variant-member-name">DEEPAK RAJPOOT</h4>
            <span className="variant-member-role">{content.role_director}</span>
          </div>

          {/* Team Member 2 */}
          <div className="variant-slab-card variant-team-card">
            <div className="variant-team-avatar">
              <span>AP</span>
            </div>
            <h4 className="variant-member-name">ANANYA PATEL</h4>
            <span className="variant-member-role">{content.role_health}</span>
          </div>

          {/* Team Member 3 */}
          <div className="variant-slab-card variant-team-card">
            <div className="variant-team-avatar">
              <span>RK</span>
            </div>
            <h4 className="variant-member-name">RAJESH KUMAR</h4>
            <span className="variant-member-role">{content.role_tech}</span>
          </div>

          {/* Team Member 4 */}
          <div className="variant-slab-card variant-team-card">
            <div className="variant-team-avatar">
              <span>SM</span>
            </div>
            <h4 className="variant-member-name">SONAL MEHTA</h4>
            <span className="variant-member-role">{content.role_outreach}</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: CLOSING CALL TO ACTION (CTA)
          ========================================================================= */}
      <section className="variant-cta-section">
        <div className="variant-slab-card variant-cta-card">
          <div className="variant-tag">
            <span>{content.cta_tag}</span>
          </div>

          <h2 className="variant-cta-title">{content.cta_title}</h2>

          <div className="variant-cta-actions">
            <button
              type="button"
              className="variant-btn-primary"
              onClick={onOpenReport}
            >
              {content.cta_report}
            </button>
            <button
              type="button"
              className="variant-btn-secondary"
              onClick={onOpenEvents}
            >
              {content.cta_drives}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;
