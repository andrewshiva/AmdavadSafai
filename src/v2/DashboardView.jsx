import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { TrendingUp, CheckCircle2, Truck, Image, AlertTriangle, Clock } from 'lucide-react';
import MapView from '../components/MapView';
import wardsData from '../data/wards.json';
import { formatDateTime } from '../utils/dateTime';

export const DashboardView = ({ reports = [], onSelectReport, onOpenReport }) => {
  const { lang } = useTranslation();
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedWardId, setSelectedWardId] = useState('all');

  const filteredWards = React.useMemo(() => {
    if (selectedZone === 'ALL') return wardsData;
    return wardsData.filter((w) => w.zone_en === selectedZone);
  }, [selectedZone]);

  const displayedReports = React.useMemo(() => {
    let list = reports;
    if (selectedWardId !== 'all') {
      list = list.filter((r) => r.ward_id === selectedWardId);
    } else if (selectedZone !== 'ALL') {
      const zoneWardIds = new Set(filteredWards.map((w) => w.id));
      list = list.filter((r) => zoneWardIds.has(r.ward_id));
    }
    return list;
  }, [reports, selectedWardId, selectedZone, filteredWards]);

  const liveFeeds = useMemo(() => {
    const dynamicItems = (reports || [])
      .slice(0, 3)
      .map((r) => {
        const isResolved = r.status === 'resolved';
        const ward = wardsData.find((w) => w.id === r.ward_id);
        const wardName = ward
          ? (lang === 'gu' ? ward.name_gu : lang === 'hi' ? ward.name_hi || ward.name_en : ward.name_en)
          : (r.ward_id || 'Ahmedabad');
        const formattedTime = formatDateTime(r.created_at || r.reported_at, lang);
        return {
          id: r.id,
          report: r,
          type: isResolved ? 'resolved' : 'new_report',
          icon: isResolved ? CheckCircle2 : Image,
          iconColor: isResolved ? '#10B981' : '#FF6B35',
          iconBg: isResolved ? '#ECFDF5' : '#FFF3EE',
          title: isResolved
            ? (lang === 'gu' ? 'સમસ્યા ઉકેલાઈ ગઈ' : lang === 'hi' ? 'समस्या का समाधान हुआ' : 'ISSUE RESOLVED')
            : (lang === 'gu' ? `નવો અહેવાલ: ${(r.category || 'કચરો').replace('_', ' ')}` : `NEW REPORT: ${(r.category || 'GARBAGE').toUpperCase().replace('_', ' ')}`),
          subtitle: `${wardName} · ${formattedTime || 'Just now'}`,
          status: isResolved ? 'resolved' : 'pending'
        };
      });

    const defaultFeeds = [
      {
        id: 'mock_1',
        type: 'new_report',
        icon: Image,
        iconColor: '#FF6B35',
        iconBg: '#FFF3EE',
        title: lang === 'gu' ? 'નવો અહેવાલ: કચરાનો ઢગલો' : lang === 'hi' ? 'नई शिकायत: कचरे का ढेर' : 'NEW REPORT: GARBAGE PILE',
        subtitle: lang === 'gu' ? 'વોર્ડ ૧૨, ઉસ્માનપુરા · હમણાં જ' : 'Ward 12, Usmanpura · Just now',
        status: 'pending'
      },
      {
        id: 'mock_2',
        type: 'resolved',
        icon: CheckCircle2,
        iconColor: '#10B981',
        iconBg: '#ECFDF5',
        title: lang === 'gu' ? 'સમસ્યા ઉકેલાઈ ગઈ' : lang === 'hi' ? 'समस्या का समाधान हुआ' : 'ISSUE RESOLVED',
        subtitle: lang === 'gu' ? 'મણિનગર પૂર્વ · ૪ મિ. પહેલાં' : 'Maninagar East · 4m ago',
        status: 'resolved'
      },
      {
        id: 'mock_3',
        type: 'dispatch',
        icon: Truck,
        iconColor: '#3B82F6',
        iconBg: '#EFF6FF',
        title: lang === 'gu' ? 'સફાઈ વાહન રવાના' : lang === 'hi' ? 'सफाई वाहन रवाना' : 'VEHICLE DISPATCHED',
        subtitle: lang === 'gu' ? 'સેટેલાઇટ વિસ્તાર · ૧૨ મિ. પહેલાં' : 'Satellite Area · 12m ago',
        status: 'in_progress'
      },
      {
        id: 'mock_4',
        type: 'new_report',
        icon: AlertTriangle,
        iconColor: '#FF6B35',
        iconBg: '#FFF3EE',
        title: lang === 'gu' ? 'નવો અહેવાલ: ખુલ્લી ગટર' : lang === 'hi' ? 'नई शिकायत: खुला नाला' : 'NEW REPORT: OPEN DRAIN',
        subtitle: lang === 'gu' ? 'બોપલ વોર્ડ · ૧૮ મિ. પહેલાં' : 'Bopal Ward · 18m ago',
        status: 'pending'
      }
    ];

    return [...dynamicItems, ...defaultFeeds].slice(0, 5);
  }, [reports, lang]);

  return (
    <div className="variant-dashboard-container">
      {/* TOP 3 METRICS ROW */}
      <div className="variant-dashboard-metrics-grid">
        {/* Metric 1 */}
        <div className="variant-slab-card variant-dash-metric-slab">
          <span className="dash-metric-label">
            {lang === 'gu' ? 'આજની કુલ ફરિયાદો' : lang === 'hi' ? 'आज की कुल शिकायतें' : 'TOTAL REPORTS TODAY'}
          </span>
          <div className="dash-metric-val">{1200 + displayedReports.length}</div>
          <div className="dash-metric-badge text-emerald">
            <TrendingUp size={13} />
            <span>{lang === 'gu' ? '+૧૨% ગઈકાલની સરખામણીમાં' : '+12% VS YESTERDAY'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="variant-slab-card variant-dash-metric-slab">
          <span className="dash-metric-label">
            {lang === 'gu' ? 'સરેરાશ ઉકેલ સમય' : lang === 'hi' ? 'औसत प्रतिक्रिया समय' : 'AVG. RESPONSE TIME'}
          </span>
          <div className="dash-metric-val">
            42<span className="unit">{lang === 'gu' ? 'મિ.' : 'm'}</span>
          </div>
          <span className="dash-metric-sub">
            {lang === 'gu' ? 'સિસ્ટમ કાર્યક્ષમતા: ઉચ્ચ' : lang === 'hi' ? 'सिस्टम दक्षता: उच्च' : 'SYSTEM EFFICIENCY: HIGH'}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="variant-slab-card variant-dash-metric-slab">
          <span className="dash-metric-label">
            {lang === 'gu' ? 'સક્રિય સફાઈ કર્મચારીઓ' : lang === 'hi' ? 'सक्रिय स्वच्छता कर्मचारी' : 'ACTIVE PERSONNEL'}
          </span>
          <div className="dash-metric-val">842</div>
          <span className="dash-metric-sub">
            {lang === 'gu' ? '૪૮ વોર્ડમાં કાર્યરત' : lang === 'hi' ? '48 वार्डों में तैनात' : 'ACROSS 48 WARDS'}
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="variant-dash-main-grid">
        {/* LEFT COLUMN: INTERACTIVE WARD MAP */}
        <div className="variant-slab-card variant-map-card">
          <div className="variant-map-card-header">
            <div>
              <h2 className="variant-map-card-title">
                {lang === 'gu' ? 'ઇન્ટરેક્ટિવ વોર્ડ નકશો' : lang === 'hi' ? 'इंटरैक्टिव वार्ड मानचित्र' : 'INTERACTIVE WARD MAP'}
              </h2>
              <span className="variant-map-card-sub">
                {lang === 'gu' ? 'ફરિયાદોનો રીઅલ-ટાઇમ હીટમેપ' : lang === 'hi' ? 'शिकायतों का रियल-टाइम हीटमैप' : 'REAL-TIME HEAT MAP OF REPORTS'}
              </span>
            </div>

            <div className="variant-map-filter-pills">
              <select
                className="variant-zone-pill-select"
                value={selectedZone}
                onChange={(e) => {
                  setSelectedZone(e.target.value);
                  setSelectedWardId('all');
                }}
              >
                <option value="ALL">{lang === 'gu' ? 'બધા ઝોન' : lang === 'hi' ? 'सभी जोन' : 'ALL ZONES'}</option>
                <option value="West Zone">{lang === 'gu' ? 'પશ્ચિમ ઝોન' : lang === 'hi' ? 'पश्चिम जोन' : 'WEST ZONE'}</option>
                <option value="North Zone">{lang === 'gu' ? 'ઉત્તર ઝોન' : lang === 'hi' ? 'उत्तर जोन' : 'NORTH ZONE'}</option>
                <option value="Central Zone">{lang === 'gu' ? 'મધ્ય ઝોન' : lang === 'hi' ? 'मध्य जोन' : 'CENTRAL ZONE'}</option>
                <option value="South Zone">{lang === 'gu' ? 'દક્ષિણ ઝોન' : lang === 'hi' ? 'दक्षिण जोन' : 'SOUTH ZONE'}</option>
              </select>

              <select
                className="variant-zone-pill-select"
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
              >
                <option value="all">{lang === 'gu' ? 'બધા વોર્ડ' : lang === 'hi' ? 'सभी वार्ड' : 'ALL WARDS'}</option>
                {filteredWards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {lang === 'gu' ? w.name_gu : w.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Map Area */}
          <div className="variant-map-wrapper">
            <MapView
              reports={displayedReports}
              wardId={selectedWardId === 'all' ? undefined : selectedWardId}
              onReportSelect={onSelectReport}
              onMapClick={onOpenReport}
            />

            {/* Intensity Scale Overlay */}
            <div className="variant-intensity-scale-pill">
              <span className="scale-label">
                {lang === 'gu' ? 'તીવ્રતા સ્કેલ' : lang === 'hi' ? 'तीव्रता पैमाना' : 'INTENSITY SCALE'}
              </span>
              <div className="scale-gradient-bar" />
              <div className="scale-text-row">
                <span>{lang === 'gu' ? 'સામાન્ય' : lang === 'hi' ? 'कम' : 'LOW'}</span>
                <span>{lang === 'gu' ? 'ગંભીર' : lang === 'hi' ? 'गंभीर' : 'CRITICAL'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE FEED & RESOLUTION METRIC */}
        <div className="variant-dash-side-column">
          {/* Live Feed Slab */}
          <div className="variant-slab-card variant-live-feed-card">
            <div className="live-feed-header">
              <span className="live-feed-title">
                {lang === 'gu' ? 'લાઇવ ફીડ' : lang === 'hi' ? 'लाइव फीड' : 'LIVE FEED'}
              </span>
              <span className="live-feed-badge">
                {lang === 'gu' ? 'રીઅલ-ટાઇમ' : lang === 'hi' ? 'रीयल-टाइम' : 'SCROLLING'}
              </span>
            </div>

            <div className="live-feed-list">
              {liveFeeds.map((feed) => {
                const IconComponent = feed.icon;
                return (
                  <div
                    key={feed.id}
                    className="live-feed-item"
                    onClick={() => feed.report && onSelectReport && onSelectReport(feed.report)}
                    style={feed.report ? { cursor: 'pointer' } : undefined}
                  >
                    <div
                      className="live-feed-icon-wrap"
                      style={{ background: feed.iconBg, color: feed.iconColor }}
                    >
                      <IconComponent size={14} />
                    </div>
                    <div className="live-feed-item-body">
                      <strong className="feed-item-title">{feed.title}</strong>
                      <span className="feed-item-sub">{feed.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolution Metric Slab */}
          <div className="variant-slab-card variant-resolution-metric-card">
            <span className="dash-metric-label">
              {lang === 'gu' ? 'ઉકેલ ગુણોત્તર' : lang === 'hi' ? 'समाधान अनुपात' : 'RESOLUTION METRIC'}
            </span>
            <div className="resolution-metric-val">
              89% <span className="unit">{lang === 'gu' ? 'પૂર્ણ' : lang === 'hi' ? 'निस्तारित' : 'COMPLETION'}</span>
            </div>
            <div className="variant-progress-track">
              <div className="variant-progress-bar" style={{ width: '89%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
