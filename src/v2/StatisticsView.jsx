import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import wardsData from '../data/wards.json';

const SEVERITY_META = [
  { key: 'critical', color: '#EF4444' },
  { key: 'minor', color: '#22C55E' },
  { key: 'moderate', color: '#F97316' },
  { key: 'severe', color: '#FB923C' }
];

const FALLBACK_FEED = {
  active_collection_vehicles: 842,
  door_to_door_coverage_pct: 94.6,
  daily_waste_collected_metric_tons: 4120.5,
  recycling_and_processing_rate_pct: 68.2,
  source: 'static_benchmark'
};

function resPillStyle(pct) {
  if (pct >= 90) return { background: '#DEF7EC', color: '#057A55' };
  if (pct >= 70) return { background: '#FEF3C7', color: '#92400E' };
  return { background: '#FDE8E8', color: '#C81E1E' };
}

export const StatisticsView = ({ reports = [] }) => {
  const { t, lang } = useTranslation();
  const [apiStats, setApiStats] = useState(null);
  const [swmFeed, setSwmFeed] = useState(null);
  const [escalatedIds, setEscalatedIds] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!cancelled && data) setApiStats(data); })
      .catch(() => {});
    fetch('/api/civic-metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!cancelled && data?.amc_swm_feed) setSwmFeed(data.amc_swm_feed); })
      .catch(() => {});
    fetch('/api/escalations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.escalated_wards)) {
          setEscalatedIds(new Set(data.escalated_wards.map((w) => w.ward_id)));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const safeReports = useMemo(() => (Array.isArray(reports) ? reports : []), [reports]);

  // Live totals: API first, local reports as offline fallback
  const totalReports = apiStats?.total_reports ?? safeReports.length;
  const unresolvedReports = apiStats?.unresolved_reports ?? safeReports.filter((r) => r.status === 'unresolved').length;
  const resolvedReports = totalReports - unresolvedReports;
  const resolutionRate = apiStats?.resolution_rate
    ?? (totalReports > 0 ? parseFloat(((resolvedReports / totalReports) * 100).toFixed(1)) : 0);

  const feed = swmFeed || FALLBACK_FEED;
  const feedIsBenchmark = (feed.source || 'static_benchmark') === 'static_benchmark';

  const zoneChartData = useMemo(() => {
    if (Array.isArray(apiStats?.zone_breakdown)) {
      return apiStats.zone_breakdown.map((z) => ({
        zone: lang === 'gu' ? (z.zone_gu || z.zone_en) : z.zone_en,
        unresolved: z.unresolved
      }));
    }
    const map = new Map();
    for (const w of wardsData) {
      map.set(w.zone_en, {
        zone: lang === 'gu' ? (w.zone_gu || w.zone_en) : w.zone_en,
        unresolved: 0
      });
    }
    for (const r of safeReports) {
      if (r.status !== 'unresolved') continue;
      const ward = wardsData.find((w) => w.id === r.ward_id);
      const key = ward ? ward.zone_en : null;
      if (key && map.has(key)) map.get(key).unresolved += 1;
    }
    return [...map.values()];
  }, [apiStats, safeReports, lang]);

  const severityChartData = useMemo(() => {
    const dist = apiStats?.severity_distribution;
    const counts = dist && !Array.isArray(dist)
      ? dist
      : { minor: 0, moderate: 0, severe: 0, critical: 0 };
    if (Array.isArray(dist)) {
      for (const item of dist) {
        const k = item.severity || item.name;
        if (k && counts[k] !== undefined) counts[k] = item.count ?? item.value ?? 0;
      }
    } else if (!dist) {
      for (const r of safeReports) {
        if (counts[r.severity] !== undefined) counts[r.severity] += 1;
      }
    }
    return SEVERITY_META
      .map((s) => ({ name: t(`filter_${s.key}`) || s.key, value: counts[s.key] || 0, color: s.color }))
      .filter((d) => d.value > 0);
  }, [apiStats, safeReports, t]);

  const leaderboard = useMemo(() => {
    const rows = Array.isArray(apiStats?.ward_leaderboard) && apiStats.ward_leaderboard.length > 0
      ? apiStats.ward_leaderboard
      : wardsData.map((ward) => {
          const list = safeReports.filter((r) => r.ward_id === ward.id);
          const total = list.length;
          const unresolved = list.filter((r) => r.status === 'unresolved').length;
          const resolved = list.filter((r) => r.status === 'resolved').length;
          return {
            ward_id: ward.id,
            name_en: ward.name_en,
            name_gu: ward.name_gu,
            zone_en: ward.zone_en,
            zone_gu: ward.zone_gu,
            total_reports: total,
            unresolved,
            resolved,
            resolution_rate_pct: total > 0 ? parseFloat(((resolved / total) * 100).toFixed(1)) : 100.0,
            mla_en: ward.mla_en || ''
          };
        }).sort((a, b) => b.resolution_rate_pct - a.resolution_rate_pct || b.total_reports - a.total_reports);
    return rows.slice(0, 5);
  }, [apiStats, safeReports]);

  const worstWards = useMemo(() => {
    if (Array.isArray(apiStats?.worst_wards) && apiStats.worst_wards.length > 0) {
      return apiStats.worst_wards.slice(0, 5);
    }
    const counts = {};
    for (const r of safeReports) {
      if (r.status === 'unresolved') counts[r.ward_id] = (counts[r.ward_id] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([wardId, count]) => {
        const ward = wardsData.find((w) => w.id === wardId);
        return { ward_id: wardId, name: ward ? ward.name_en : wardId, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [apiStats, safeReports]);

  const handleAlert = async () => {
    const lines = worstWards.map((w, i) => `${i + 1}. ${w.name} (${w.count} unresolved)`);
    const text = `AmdavadSafai — worst performing wards:\n${lines.join('\n') || 'No unresolved wards.'}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const L = {
    overview: lang === 'gu' ? 'ઝાંખી' : lang === 'hi' ? 'अवलोकन' : 'OVERVIEW',
    title: lang === 'gu' ? 'લાઇવ આંકડા ડેશબોર્ડ' : lang === 'hi' ? 'लाइव सांख्यिकी डैशबोर्ड' : 'LIVE STATISTICS DASHBOARD',
    total: lang === 'gu' ? 'કુલ ફરિયાદો' : lang === 'hi' ? 'कुल शिकायतें' : 'TOTAL REPORTS',
    unresolved: lang === 'gu' ? 'અનિરાકૃત ફરિયાદો' : lang === 'hi' ? 'अनसुलझी शिकायतें' : 'UNRESOLVED REPORTS',
    rate: lang === 'gu' ? 'નિરાકરણ દર' : lang === 'hi' ? 'समाधान दर' : 'RESOLUTION RATE',
    swmTitle: lang === 'gu' ? 'AMC ઘન કચરા SWM ફીડ' : lang === 'hi' ? 'AMC ठोस अपशिष्ट SWM फीड' : 'AMC SOLID WASTE SWM FEED',
    badgeLive: lang === 'gu' ? 'સત્તાવાર AMC દૈનિક ફીડ' : lang === 'hi' ? 'आधिकारिक AMC दैनिक फीड' : 'OFFICIAL AMC DAILY FEED',
    badgeBench: lang === 'gu' ? 'AMC બેન્ચમાર્ક સ્નેપશોટ' : lang === 'hi' ? 'AMC बेंचमार्क स्नैपशॉट' : 'AMC BENCHMARK SNAPSHOT',
    benchNote: lang === 'gu' ? 'આયોજન અંદાજો — લાઇવ AMC ટેલિમેટ્રી નથી' : lang === 'hi' ? 'योजना अनुमान — लाइव AMC टेलीमेट्री नहीं' : 'Planning estimates — not live AMC telemetry',
    vehicles: lang === 'gu' ? 'સક્રિય સંગ્રહ વાહનો' : lang === 'hi' ? 'सक्रिय संग्रह वाहन' : 'ACTIVE COLLECTION VEHICLES',
    coverage: lang === 'gu' ? 'ઘરે-ઘરે કવરેજ' : lang === 'hi' ? 'घर-घर कवरेज' : 'DOOR-TO-DOOR COVERAGE',
    processed: lang === 'gu' ? 'દૈનિક કચરા પ્રક્રિયા' : lang === 'hi' ? 'दैनिक अपशिष्ट प्रसंस्करण' : 'DAILY WASTE PROCESSED',
    recycling: lang === 'gu' ? 'રિસાયક્લિંગ દર' : lang === 'hi' ? 'पुनर्चक्रण दर' : 'RECYCLING & PROCESSING RATE',
    zoneTitle: lang === 'gu' ? 'ઝોન મુજબ અનિરાકૃત ફરિયાદો' : lang === 'hi' ? 'जोन-वार अनसुलझी शिकायतें' : 'ZONE-WISE UNRESOLVED COMPLAINTS',
    sevTitle: lang === 'gu' ? 'ગંભીરતા વિતરણ' : lang === 'hi' ? 'गंभीरता वितरण' : 'SEVERITY DISTRIBUTION',
    boardTitle: lang === 'gu' ? 'વોર્ડ સ્વચ્છતા લીડરબોર્ડ' : lang === 'hi' ? 'वार्ड स्वच्छता लीडरबोर्ड' : 'WARD CLEANLINESS LEADERBOARD',
    thWard: lang === 'gu' ? 'વોર્ડ' : lang === 'hi' ? 'वार्ड' : 'WARD',
    thZone: lang === 'gu' ? 'ઝોન' : lang === 'hi' ? 'जोन' : 'ZONE',
    thMla: lang === 'gu' ? 'ધારાસભ્ય' : lang === 'hi' ? 'विधायक' : 'MLA NAME',
    thTotal: lang === 'gu' ? 'કુલ' : lang === 'hi' ? 'कुल' : 'TOTAL',
    thActive: lang === 'gu' ? 'સક્રિય' : lang === 'hi' ? 'सक्रिय' : 'ACTIVE',
    thRes: lang === 'gu' ? 'ઉકેલ %' : lang === 'hi' ? 'समाधान %' : 'RES. %',
    worstEyebrow: lang === 'gu' ? 'ગંભીર ધ્યાન' : lang === 'hi' ? 'गंभीर ध्यान' : 'CRITICAL FOCUS',
    worstTitle: lang === 'gu' ? 'સૌથી નબળા વોર્ડ' : lang === 'hi' ? 'सबसे खराब वार्ड' : 'WORST PERFORMING WARDS',
    unresolvedUnit: lang === 'gu' ? 'અનિરાકૃત' : lang === 'hi' ? 'अनसुलझी' : 'UNRESOLVED',
    alert: lang === 'gu' ? 'વોર્ડ સુપરવાઇઝરને ચેતવો' : lang === 'hi' ? 'वार्ड पर्यवेक्षकों को सचेत करें' : 'ALERT WARD SUPERVISORS',
    escalated: lang === 'gu' ? 'એસ્કેલેટેડ' : lang === 'hi' ? 'एस्केलेटेड' : 'ESCALATED',
    copied: lang === 'gu' ? 'નકલ થઈ!' : lang === 'hi' ? 'कॉपी हुआ!' : 'COPIED ✓',
    noData: lang === 'gu' ? 'હજુ કોઈ ડેટા નથી' : lang === 'hi' ? 'अभी कोई डेटा नहीं' : 'No data yet'
  };

  return (
    <div className="statspage-wrap">
      {/* Header */}
      <div className="statspage-eyebrow">{L.overview}</div>
      <h1 className="statspage-title">{L.title}</h1>

      {/* Top metric slabs */}
      <div className="statspage-metrics">
        <div className="statspage-slab">
          <span className="statspage-slab-label">{L.total}</span>
          <div className="statspage-slab-val">{totalReports}</div>
        </div>
        <div className="statspage-slab">
          <span className="statspage-slab-label">{L.unresolved}</span>
          <div className="statspage-slab-val statspage-accent">{unresolvedReports}</div>
        </div>
        <div className="statspage-slab">
          <span className="statspage-slab-label">{L.rate}</span>
          <div className="statspage-slab-val">{resolutionRate}%</div>
        </div>
      </div>

      {/* AMC SWM feed */}
      <div className="statspage-swm">
        <div className="statspage-swm-head">
          <span className="statspage-swm-title">🚛 {L.swmTitle}</span>
          <span className="statspage-swm-badge">{feedIsBenchmark ? L.badgeBench : L.badgeLive}</span>
        </div>
        <div className="statspage-swm-grid">
          <div className="statspage-swm-tile">
            <span className="statspage-swm-label">{L.vehicles}</span>
            <div className="statspage-swm-val">{feed.active_collection_vehicles} <span>🚛</span></div>
          </div>
          <div className="statspage-swm-tile">
            <span className="statspage-swm-label">{L.coverage}</span>
            <div className="statspage-swm-val">{feed.door_to_door_coverage_pct}% <span>🏠</span></div>
          </div>
          <div className="statspage-swm-tile">
            <span className="statspage-swm-label">{L.processed}</span>
            <div className="statspage-swm-val">{feed.daily_waste_collected_metric_tons} MT <span>⚖️</span></div>
          </div>
          <div className="statspage-swm-tile">
            <span className="statspage-swm-label">{L.recycling}</span>
            <div className="statspage-swm-val">{feed.recycling_and_processing_rate_pct}% <span>♻️</span></div>
          </div>
        </div>
        {feedIsBenchmark && <div className="statspage-swm-note">{L.benchNote}</div>}
      </div>

      {/* Charts */}
      <div className="statspage-charts">
        <div className="statspage-card statspage-bar-card">
          <h2 className="statspage-card-title"><span className="statspage-spark">✦</span> {L.zoneTitle}</h2>
          {zoneChartData.some((z) => z.unresolved > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={zoneChartData} margin={{ top: 8, right: 8, bottom: 8, left: -18 }}>
                <XAxis
                  dataKey="zone"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  tick={{ fontSize: 9, fill: '#6B7280', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="unresolved" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="statspage-empty">{L.noData}</div>
          )}
        </div>

        <div className="statspage-card statspage-donut-card">
          <h2 className="statspage-card-title"><span className="statspage-clock">◷</span> {L.sevTitle}</h2>
          {severityChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={severityChartData} dataKey="value" innerRadius="58%" outerRadius="88%" paddingAngle={3} strokeWidth={0}>
                    {severityChartData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="statspage-legend">
                {severityChartData.map((d) => (
                  <div key={d.name} className="statspage-legend-item">
                    <span className="statspage-dot" style={{ background: d.color }} />
                    <span>{d.name.toUpperCase()} · {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="statspage-empty">{L.noData}</div>
          )}
        </div>
      </div>

      {/* Leaderboard + worst wards */}
      <div className="statspage-boards">
        <div className="statspage-card statspage-board-card">
          <h2 className="statspage-card-title"><span className="statspage-medal">🏅</span> {L.boardTitle}</h2>
          <div className="statspage-table-scroll">
            <table className="statspage-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{L.thWard}</th>
                  <th>{L.thZone}</th>
                  <th>{L.thMla}</th>
                  <th>{L.thTotal}</th>
                  <th>{L.thActive}</th>
                  <th>{L.thRes}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((w, i) => (
                  <tr key={w.ward_id}>
                    <td>{i + 1}</td>
                    <td><strong>{lang === 'gu' ? (w.name_gu || w.name_en) : w.name_en}</strong></td>
                    <td>{lang === 'gu' ? (w.zone_gu || w.zone_en) : w.zone_en}</td>
                    <td>{w.mla_en || '—'}</td>
                    <td>{w.total_reports}</td>
                    <td className={w.unresolved > 0 ? 'statspage-active' : 'statspage-zero'}>{w.unresolved}</td>
                    <td>
                      <span className="statspage-pill" style={resPillStyle(w.resolution_rate_pct)}>
                        {w.resolution_rate_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="statspage-card statspage-worst-card">
          <div className="statspage-worst-eyebrow">{L.worstEyebrow}</div>
          <h2 className="statspage-worst-title">{L.worstTitle}</h2>
          <div className="statspage-worst-list">
            {worstWards.length > 0 ? worstWards.map((w, i) => (
              <div key={w.ward_id} className="statspage-worst-row">
                <span className="statspage-worst-dot" />
                <strong>{i + 1}. {w.name}</strong>
                {escalatedIds.has(w.ward_id) && <span className="statspage-esc-badge">⚠ {L.escalated}</span>}
                <span className="statspage-worst-count">{w.count} {L.unresolvedUnit}</span>
              </div>
            )) : (
              <div className="statspage-empty">{L.noData}</div>
            )}
          </div>
          <button type="button" className="statspage-alert-btn" onClick={handleAlert}>
            {copied ? L.copied : L.alert}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
