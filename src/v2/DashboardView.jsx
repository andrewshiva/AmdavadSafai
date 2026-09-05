import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { CheckCircle2, Image } from 'lucide-react';
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

  const totalCount = displayedReports.length;
  const resolvedCount = displayedReports.filter((r) => r.status === 'resolved').length;
  const openCount = totalCount - resolvedCount;
  const resolutionPct = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const zones = useMemo(() => [...new Set(wardsData.map((w) => w.zone_en))].sort(), []);
  const zoneLabel = (z) => (lang === 'gu' ? (wardsData.find((w) => w.zone_en === z)?.zone_gu || z) : z);

  const liveFeeds = useMemo(() => {
    const dynamicItems = (reports || [])
      .slice(0, 5)
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

    return dynamicItems;
  }, [reports, lang]);

  return (
    <div className="variant-dashboard-container">
      {/* TOP 3 METRICS ROW */}
      <div className="variant-dashboard-metrics-grid">
        {/* Metric 1 */}
        <div className="variant-slab-card variant-dash-metric-slab">
          <span className="dash-metric-label">
            {lang === 'gu' ? 'કુલ ફરિયાદો' : lang === 'hi' ? 'कुल शिकायतें' : 'TOTAL REPORTS'}
          </span>
          <div className="dash-metric-val">{totalCount}</div>
          <span className="dash-metric-sub">
            {lang === 'gu' ? `${wardsData.length} વોર્ડ ટ્રેક કરેલા` : lang === 'hi' ? `${wardsData.length} वार्ड ट्रैक किए गए` : `${wardsData.length} WARDS TRACKED`}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="variant-slab-card variant-dash-metric-slab">
          <span className="dash-metric-label">
            {lang === 'gu' ? 'નિરાકરણ દર' : lang === 'hi' ? 'समाधान दर' : 'RESOLUTION RATE'}
          </span>
          <div className="dash-metric-val">
            {resolutionPct}<span className="unit">%</span>
          </div>
          <span className="dash-metric-sub">
            {resolvedCount} / {totalCount} {lang === 'gu' ? 'ઉકેલાયેલ' : lang === 'hi' ? 'समाधानित' : 'RESOLVED'}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="variant-slab-card variant-dash-metric-slab">
          <span className="dash-metric-label">
            {lang === 'gu' ? 'ખુલ્લી ફરિયાદો' : lang === 'hi' ? 'खुली शिकायतें' : 'OPEN ISSUES'}
          </span>
          <div className="dash-metric-val">{openCount}</div>
          <span className="dash-metric-sub">
            {lang === 'gu' ? 'કાર્યવાહી બાકી' : lang === 'hi' ? 'कार्रवाई बाकी' : 'NEED ACTION'}
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
                {zones.map((z) => (
                  <option key={z} value={z}>{zoneLabel(z)}</option>
                ))}
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
              {liveFeeds.length === 0 && (
                <div className="live-feed-item">
                  <div className="live-feed-item-body">
                    <span className="feed-item-sub">
                      {lang === 'gu' ? 'હજુ કોઈ ફરિયાદ નથી' : lang === 'hi' ? 'अभी कोई शिकायत नहीं' : 'No reports yet'}
                    </span>
                  </div>
                </div>
              )}
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
              {resolutionPct}% <span className="unit">{lang === 'gu' ? 'પૂર્ણ' : lang === 'hi' ? 'निस्तारित' : 'COMPLETION'}</span>
            </div>
            <div className="variant-progress-track">
              <div className="variant-progress-bar" style={{ width: `${resolutionPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
