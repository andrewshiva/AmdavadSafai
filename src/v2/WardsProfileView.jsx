import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Download, Phone, Mail, Image, MapPin, CheckCircle2, Clock, ThumbsUp, Shield, User } from 'lucide-react';
import wardsData from '../data/wards.json';
import pilotConfig from '../data/pilot.json';
import civicCenters from '../data/civic_centers.json';
import wardContacts from '../data/ward_contacts.json';
import { formatDateTime } from '../utils/dateTime';

const CIVIC_BY_CENTER = Object.fromEntries(
  (civicCenters?.centers || []).map((c) => [(c.center || '').trim().toLowerCase(), c])
);
const civicForWard = (wardId) => {
  const m = wardContacts?.mapping?.[wardId];
  if (!m) return null;
  const c = CIVIC_BY_CENTER[(m.center || '').trim().toLowerCase()];
  return c ? { ...c, match: m.match } : null;
};

const PILOT_WARD_IDS = new Set(pilotConfig?.pilot_ward_ids || []);
const DEFAULT_WARD_ID = (pilotConfig?.pilot_ward_ids || [])[0] || wardsData[1]?.id || 'ward_02';

export const WardsProfileView = ({ reports = [], onSelectReport, onOpenReport }) => {
  const { t, lang } = useTranslation();
  const [selectedWardId, setSelectedWardId] = useState(DEFAULT_WARD_ID); // Default: pilot ward

  const currentWard = useMemo(() => {
    return wardsData.find((w) => w.id === selectedWardId) || wardsData[0] || {
      id: 'ward_02',
      name_en: 'Navrangpura',
      name_gu: 'નવરંગપુરા',
      zone_en: 'West Zone',
      zone_gu: 'પશ્ચિમ ઝોન',
      corporator_en: 'Priya Shah',
      corporator_gu: 'પ્રિયા શાહ',
      mla_en: 'Amit Shah (MLA)',
      mla_gu: 'અમિત શાહ (એમએલએ)',
      mp_en: 'Kirit Solanki',
      mp_gu: 'કિરીટ સોલંકી'
    };
  }, [selectedWardId]);

  // Reports belonging to current ward (live only — no fabricated fallback)
  const wardReports = useMemo(() => {
    return reports.filter((r) => r.ward_id === selectedWardId);
  }, [reports, selectedWardId]);

  const activeIssuesCount = wardReports.filter((r) => r.status !== 'resolved').length;
  const resolvedIssuesCount = wardReports.filter((r) => r.status === 'resolved').length;
  const wardResolutionPct = wardReports.length > 0 ? Math.round((resolvedIssuesCount / wardReports.length) * 100) : 0;

  const corporatorInitials = useMemo(() => {
    const name = currentWard.corporator_en || 'Priya Shah';
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'PS';
  }, [currentWard]);

  const handleDownloadReport = () => {
    const csvContent = `data:text/csv;charset=utf-8,Ward ID,Ward Name,Zone,Corporator,MLA,MP,Active Issues,Resolved Issues\n${currentWard.id},"${currentWard.name_en}","${currentWard.zone_en}","${currentWard.corporator_en || ''}","${currentWard.mla_en || ''}","${currentWard.mp_en || ''}",${activeIssuesCount},${resolvedIssuesCount}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentWard.name_en}_Ward_Civic_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="variant-wards-container">
      {/* HEADER SECTION WITH WARD TITLE & EXPORT */}
      <div className="variant-ward-profile-header">
        <div className="variant-ward-title-wrap">
          <div className="ward-selector-row">
            <span className="variant-tag">
              {lang === 'gu' ? 'વોર્ડ પ્રોફાઇલ' : lang === 'hi' ? 'वार्ड प्रोफाइल' : 'WARD PROFILE'}
            </span>
            {PILOT_WARD_IDS.has(selectedWardId) && (
              <span className="variant-tag" title={lang === 'gu' ? 'પાયલટ વોર્ડ: ભાગીદારી પ્રક્રિયામાં' : lang === 'hi' ? 'पायलट वार्ड: भागीदारी प्रक्रिया में' : 'Pilot ward: partnership onboarding pending'}>
                {lang === 'gu' ? 'પાયલટ' : lang === 'hi' ? 'पायलट' : 'PILOT'}
              </span>
            )}
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="variant-ward-dropdown-select"
            >
              {wardsData.map((w) => (
                <option key={w.id} value={w.id}>
                  {lang === 'gu' ? `${w.name_gu} (${w.zone_gu})` : `${w.name_en} (${w.zone_en})`}
                </option>
              ))}
            </select>
          </div>

          <h1 className="variant-ward-main-title">
            {lang === 'gu'
              ? `${currentWard.name_gu} / ${currentWard.zone_gu}`
              : lang === 'hi'
              ? `${currentWard.name_en} / ${currentWard.zone_en}`
              : `${currentWard.name_en.toUpperCase()} / ${currentWard.zone_en.toUpperCase()}`}
          </h1>
          <p className="variant-ward-sub-title">
            {lang === 'gu'
              ? `${currentWard.name_gu} વોર્ડ · ${currentWard.zone_gu}`
              : lang === 'hi'
              ? `${currentWard.name_en} वार्ड · ${currentWard.zone_en}`
              : `${currentWard.name_en} Ward · ${currentWard.zone_en}`}
          </p>
        </div>

        <button
          type="button"
          className="variant-btn-secondary variant-download-report-btn"
          onClick={handleDownloadReport}
        >
          <Download size={14} />
          <span>{lang === 'gu' ? 'વોર્ડ રિપોર્ટ ડાઉનલોડ' : lang === 'hi' ? 'वार्ड रिपोर्ट डाउनलोड' : 'WARD REPORT'}</span>
        </button>
      </div>

      {/* TOP 3 STATS SLABS */}
      <div className="variant-ward-stats-grid">
        <div className="variant-slab-card variant-ward-stat-slab">
          <span className="ward-stat-label">
            {lang === 'gu' ? 'સક્રિય ફરિયાદો' : lang === 'hi' ? 'सक्रिय शिकायतें' : 'ACTIVE'}
          </span>
          <div className="ward-stat-val">{activeIssuesCount}</div>
          <span className="ward-stat-sub">
            {lang === 'gu' ? 'અનિરાકૃત સમસ્યાઓ' : lang === 'hi' ? 'लंबित मुद्दे' : 'OPEN ISSUES'}
          </span>
        </div>

        <div className="variant-slab-card variant-ward-stat-slab">
          <span className="ward-stat-label">
            {lang === 'gu' ? 'ઉકેલાયેલ' : lang === 'hi' ? 'हल की गई' : 'SOLVED'}
          </span>
          <div className="ward-stat-val">{resolvedIssuesCount}</div>
          <span className="ward-stat-sub">
            {lang === 'gu' ? 'કુલ ઉકેલાયેલ' : lang === 'hi' ? 'कुल समाधानित' : 'TOTAL RESOLVED'}
          </span>
        </div>

        <div className="variant-slab-card variant-ward-stat-slab">
          <span className="ward-stat-label">
            {lang === 'gu' ? 'કુલ' : lang === 'hi' ? 'कुल' : 'TOTAL'}
          </span>
          <div className="ward-stat-val">{wardReports.length}</div>
          <span className="ward-stat-sub">
            {lang === 'gu' ? 'નોંધાયેલી ફરિયાદો' : lang === 'hi' ? 'दर्ज शिकायतें' : 'RECORDED REPORTS'}
          </span>
        </div>
      </div>

      {/* MAIN TWO COLUMN PROFILE GRID */}
      <div className="variant-ward-content-grid">
        {/* LEFT COLUMN: ELECTED REPRESENTATIVE & SANITARY INSPECTOR CARD */}
        <div className="variant-ward-officer-column">
          <div className="variant-slab-card variant-officer-card">
            <div className="officer-avatar-box">
              <span>{corporatorInitials}</span>
            </div>

            <h3 className="officer-name">
              {lang === 'gu' ? (currentWard.corporator_gu || currentWard.corporator_en) : currentWard.corporator_en}
            </h3>
            <span className="officer-designation">
              {lang === 'gu' ? 'વોર્ડ કોર્પોરેટર / નગરસેવક' : lang === 'hi' ? 'वार्ड पार्षद' : 'WARD CORPORATOR'}
            </span>

            {/* MLA and MP Info */}
            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', fontSize: '11px', lineHeight: 1.5, color: '#475569', textAlign: 'left', width: '100%' }}>
              <div><strong>MLA:</strong> {lang === 'gu' ? (currentWard.mla_gu || currentWard.mla_en) : currentWard.mla_en} ({currentWard.mla_party || 'BJP'})</div>
              <div><strong>MP:</strong> {lang === 'gu' ? (currentWard.mp_gu || currentWard.mp_en) : currentWard.mp_en}</div>
            </div>

            {/* Contact Pills */}
            <div className="officer-contact-list" style={{ marginTop: '14px' }}>
              <a href="tel:155303" className="officer-contact-pill">
                <Phone size={13} />
                <span>AMC Helpline 155303</span>
              </a>

              <a href="mailto:swm@ahmedabadcity.gov.in" className="officer-contact-pill">
                <Mail size={13} />
                <span>swm@ahmedabadcity.gov.in</span>
              </a>
            </div>

            {(() => {
              const civic = civicForWard(selectedWardId);
              if (!civic) return null;
              return (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '11px', lineHeight: 1.5, color: '#475569', textAlign: 'left', width: '100%' }}>
                  <div style={{ fontWeight: 800, color: '#92400E', letterSpacing: '0.06em', fontSize: '10px' }}>
                    {lang === 'gu' ? 'વોર્ડ સિવિક સેન્ટર' : lang === 'hi' ? 'वार्ड सिविक सेंटर' : 'WARD CIVIC CENTER'}
                  </div>
                  <div><strong>{civic.center}</strong> · {civic.address}</div>
                  <div>{civic.contact_person} · <a href={`tel:${(civic.contact_no || '').replace(/\s/g, '')}`}>{civic.contact_no}</a> · {civic.timings}</div>
                </div>
              );
            })()}

            <button
              type="button"
              className="variant-btn-primary full-width"
              onClick={() => window.open('tel:155303')}
            >
              {lang === 'gu' ? 'AMC હેલ્પલાઇન કોલ કરો' : lang === 'hi' ? 'AMC हेल्पलाइन कॉल करें' : 'CALL AMC HELPLINE'}
            </button>
          </div>

          {/* Performance Slab */}
          <div className="variant-slab-card variant-officer-perf-slab">
            <div className="perf-header-row">
              <span className="perf-label">
                {lang === 'gu' ? 'કામગીરી રેટિંગ' : lang === 'hi' ? 'प्रदर्शन रेटिंग' : 'PERFORMANCE'}
              </span>
            </div>
            <div className="perf-val-row">
              <span className="perf-name">
                {lang === 'gu' ? 'નિરાકરણ દર' : lang === 'hi' ? 'समाधान दर' : 'RESOLUTION RATE'}
              </span>
              <span className="perf-score">{wardReports.length > 0 ? `${wardResolutionPct}%` : '—'}</span>
            </div>
            <div className="variant-progress-track">
              <div className="variant-progress-bar" style={{ width: `${wardResolutionPct}%` }} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT ISSUE TIMELINE */}
        <div className="variant-slab-card variant-timeline-card">
          <div className="timeline-header-row">
            <span className="timeline-title">
              {lang === 'gu' ? 'વોર્ડ ફરિયાદોની સમયરેખા' : lang === 'hi' ? 'वार्ड शिकायतों की समयरेखा' : 'RECENT ISSUE TIMELINE'}
            </span>
            <button
              type="button"
              className="timeline-view-all"
              onClick={onOpenReport}
            >
              {lang === 'gu' ? '+ નવી ફરિયાદ' : lang === 'hi' ? '+ नई शिकायत' : '+ NEW REPORT'}
            </button>
          </div>

          <div className="timeline-items-list">
            {wardReports.length === 0 && (
              <div className="timeline-item-row">
                <div className="timeline-item-body">
                  <p className="timeline-item-loc">
                    {lang === 'gu' ? 'આ વોર્ડમાં હજુ કોઈ ફરિયાદ નથી' : lang === 'hi' ? 'इस वार्ड में अभी कोई शिकायत नहीं' : 'No reports in this ward yet'}
                  </p>
                </div>
              </div>
            )}
            {wardReports.map((issue) => {
              const title = lang === 'gu' && issue.description_gu
                ? issue.description_gu
                : lang === 'hi' && issue.description_hi
                ? issue.description_hi
                : issue.description_en || 'CIVIC ISSUE';

              const isResolved = issue.status === 'resolved';

              return (
                <div
                  key={issue.id}
                  className="timeline-item-row"
                  onClick={() => onSelectReport && onSelectReport(issue)}
                >
                  <div className="timeline-thumb-box">
                    {issue.image_url ? (
                      <img src={issue.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <Image size={20} />
                    )}
                  </div>

                  <div className="timeline-item-body">
                    <h4 className="timeline-item-title">{title}</h4>
                    <p className="timeline-item-loc">{issue.location || `${currentWard.name_en} Ward area`}</p>
                    <div className="timeline-item-meta">
                      <span className="meta-time" title={formatDateTime(issue.created_at || issue.reported_at, lang)} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} style={{ color: '#FF6B35' }} />
                        <span>{formatDateTime(issue.created_at || issue.reported_at, lang) || 'Recent'}</span>
                      </span>
                      <span className="meta-ticket" style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginLeft: '4px' }}>
                        {issue.amc_ticket_id || 'AS-311'}
                      </span>
                      {issue.upvotes > 0 && (
                        <span className="meta-upvotes">
                          <ThumbsUp size={11} /> {issue.upvotes} {lang === 'gu' ? 'સમર્થન' : 'UPVOTES'}
                        </span>
                      )}
                      {isResolved && (
                        <span className="meta-verified text-emerald">
                          ✓ {lang === 'gu' ? 'ચકાસાયેલ' : 'VERIFIED'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`timeline-status-pill status-${issue.status || 'pending'}`}>
                    {issue.status === 'resolved'
                      ? (lang === 'gu' ? 'ઉકેલાયેલ' : lang === 'hi' ? 'समाधानित' : 'RESOLVED')
                      : issue.status === 'in_progress'
                      ? (lang === 'gu' ? 'સફાઈ ચાલુ' : lang === 'hi' ? 'सफाई जारी' : 'IN PROGRESS')
                      : (lang === 'gu' ? 'બાકી' : lang === 'hi' ? 'लंबित' : 'PENDING')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardsProfileView;
