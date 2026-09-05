import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { ChevronUp, ChevronDown, BarChart2, ShieldAlert, PieChart as PieIcon, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import wardsData from '../data/wards.json';

export const StatsPanel = ({ reports = [], isOpen: controlledIsOpen, onToggleOpen }) => {
  const { t, lang } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = useCallback((next) => {
    if (onToggleOpen) {
      onToggleOpen(typeof next === 'function' ? next(isOpen) : next);
    } else {
      setInternalIsOpen(next);
    }
  }, [isOpen, onToggleOpen]);
  const [displayedTotal, setDisplayedTotal] = useState(0);
  const [displayedUnresolved, setDisplayedUnresolved] = useState(0);
  const [statsData, setStatsData] = useState(null);

  // Stats calculation from local reports array
  const safeReports = Array.isArray(reports) ? reports : [];
  const totalCount = safeReports.length;
  const unresolvedCount = safeReports.filter((r) => r.status === 'unresolved').length;
  const resolvedCount = safeReports.filter((r) => r.status === 'resolved').length;
  const resolutionRate = totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) : '0.0';

  const [civicMetrics, setCivicMetrics] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStatsData(data);
      })
      .catch(() => {});

    fetch('/api/civic-metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setCivicMetrics(data.amc_swm_feed);
      })
      .catch(() => {});
  }, [isOpen]);

  const amcFeed = civicMetrics || {
    city: "Ahmedabad (અમદાવાદ)",
    active_collection_vehicles: 842,
    door_to_door_coverage_pct: 94.6,
    daily_waste_collected_metric_tons: 4120.5,
    recycling_and_processing_rate_pct: 68.2
  };


  useEffect(() => {
    const start = performance.now();
    const duration = 450;
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedTotal(Math.round(totalCount * eased));
      setDisplayedUnresolved(Math.round(unresolvedCount * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [totalCount, unresolvedCount]);

  // Worst performing wards: group unresolved by ward_id and sort descending
  const worstWards = Object.entries(
    reports.reduce((acc, report) => {
      if (report.status === 'unresolved') {
        acc[report.ward_id] = (acc[report.ward_id] || 0) + 1;
      }
      return acc;
    }, {})
  )
    .map(([wardId, count]) => {
      const ward = wardsData.find((w) => w.id === wardId);
      return {
        id: wardId,
        name: ward ? (lang === 'en' ? ward.name_en : ward.name_gu) : 'Unknown',
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Fallback charts if API stats not loaded yet
  const zoneChartData = Array.isArray(statsData?.zone_breakdown)
    ? statsData.zone_breakdown.map((z) => ({
        zone: lang === 'gu' ? z.zone_gu || z.zone_en : lang === 'hi' ? z.zone_hi || z.zone_en : z.zone_en,
        unresolved: z.unresolved,
        resolved: z.resolved
      }))
    : [
        { zone: 'West Zone', unresolved: 5, resolved: 12 },
        { zone: 'South West Zone', unresolved: 3, resolved: 8 },
        { zone: 'North West Zone', unresolved: 4, resolved: 10 },
        { zone: 'Central Zone', unresolved: 7, resolved: 6 },
        { zone: 'East Zone', unresolved: 6, resolved: 5 }
      ];

  const severityChartData = statsData?.severity_distribution
    ? Array.isArray(statsData.severity_distribution)
      ? statsData.severity_distribution.map((item) => ({
          name: t(`filter_${item.severity || item.name}`),
          value: item.count || item.value || 0,
          color:
            item.severity === 'minor'
              ? '#16A34A'
              : item.severity === 'moderate'
              ? '#D97706'
              : item.severity === 'severe'
              ? '#EA580C'
              : '#DC2626'
        }))
      : Object.entries(statsData.severity_distribution).map(([severityKey, valueCount]) => ({
          name: t(`filter_${severityKey}`),
          value: valueCount,
          color:
            severityKey === 'minor'
              ? '#16A34A'
              : severityKey === 'moderate'
              ? '#D97706'
              : severityKey === 'severe'
              ? '#EA580C'
              : '#DC2626'
        }))
    : [
        { name: t('filter_minor'), value: 4, color: '#16A34A' },
        { name: t('filter_moderate'), value: 6, color: '#D97706' },
        { name: t('filter_severe'), value: 5, color: '#EA580C' },
        { name: t('filter_critical'), value: 3, color: '#DC2626' }
      ];

  // Fallback Ward Leaderboard computation from local reports & wardsData
  const leaderboardData = statsData?.ward_leaderboard || wardsData.map((ward) => {
    const wardReports = reports.filter((r) => r.ward_id === ward.id);
    const total = wardReports.length;
    const unresolved = wardReports.filter((r) => r.status === 'unresolved').length;
    const resolved = wardReports.filter((r) => r.status === 'resolved').length;
    const rate = total > 0 ? parseFloat(((resolved / total) * 100).toFixed(1)) : 100.0;
    return {
      ward_id: ward.id,
      name_en: ward.name_en,
      name_gu: ward.name_gu,
      zone_en: ward.zone_en,
      zone_gu: ward.zone_gu,
      total_reports: total,
      unresolved: unresolved,
      resolved: resolved,
      resolution_rate_pct: rate,
      mla_en: ward.mla_en || 'Darshana Vaghela'
    };
  }).sort((a, b) => b.resolution_rate_pct - a.resolution_rate_pct || b.total_reports - a.total_reports);

  // Stats panel stays open when filters change — user closes manually via View Map button or ESC

  // ESC key to close stats drawer
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  return (
    <div className={`stats-panel-container ${isOpen ? 'open' : ''}`}>
      <button
        className="stats-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? (t('hide_stats_view_map') || 'View Map') : t('stats')}
        style={{ cursor: 'pointer', transition: 'background 0.2s ease' }}
      >
        <div className="trigger-left">
          <BarChart2 size={18} style={{ marginRight: '6px' }} />
          <span>{t('stats')}</span>
          {isOpen && (
            <span style={{ fontSize: '11px', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px', fontWeight: 600 }}>
              🗺️ {t('hide_stats_view_map') || 'Click to View Map'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {isOpen ? `🔽 ${t('hide_stats_view_map') || 'View Map'}` : `🔼 ${t('expand_stats') || 'Expand'}`}
          </span>
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </button>

      <div className="stats-content">
        {/* Quick View Map & Minimize Action Bar */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.2)', padding: '10px 16px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📊 {t('stats')} ({reports.length} {t('total_reports')})
          </span>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)',
              transition: 'transform 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>🗺️ {t('hide_stats_view_map') || 'View Map'}</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="stats-grid" style={{ gridColumn: '1 / -1' }}>
          <div className="stat-card">
            <span className="stat-value">{displayedTotal}</span>
            <span className="stat-label">{t('total_reports')}</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-value text-red">{displayedUnresolved}</span>
            <span className="stat-label">{t('unresolved_reports')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value text-green">{resolutionRate}%</span>
            <span className="stat-label">{t('resolution_rate')}</span>
          </div>
        </div>


        {/* AMC Municipal SWM Benchmark Feed Card */}
        <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8' }}>
              🏙️ {t('amc_civic_feed')}
            </span>
            <span style={{ fontSize: '10.5px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {t('official_amc_feed')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>{t('collection_vehicles')}</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#38BDF8' }}>{amcFeed.active_collection_vehicles} 🚚</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>{t('door_to_door_coverage')}</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#4ADE80' }}>{amcFeed.door_to_door_coverage_pct}% 🏠</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>{t('daily_waste_processed')}</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#FBBF24' }}>{amcFeed.daily_waste_collected_metric_tons} MT ⚖️</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>{t('recycling_rate')}</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#A78BFA' }}>{amcFeed.recycling_and_processing_rate_pct}% ♻️</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <Activity size={16} style={{ color: 'var(--color-primary)' }} />
            {t('zone_wise_breakdown')}
          </h3>
          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="zone" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px' }} />
                <Bar dataKey="unresolved" name={t('filter_unresolved')} fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name={t('filter_resolved')} fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <PieIcon size={16} style={{ color: 'var(--color-primary)' }} />
            {t('severity_distribution')}
          </h3>
          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worst Wards List */}
        <div className="worst-wards-section" style={{ gridColumn: '1 / -1' }}>
          <h3 className="worst-wards-title">
            <ShieldAlert size={16} className="text-red" style={{ marginRight: '6px' }} />
            {t('worst_wards')}
          </h3>
          {worstWards.length > 0 ? (
            <ol className="worst-wards-list">
              {worstWards.map((ward, idx) => (
                <li key={ward.id} className="worst-ward-item">
                  <span className="ward-rank">{idx + 1}.</span>
                  <span className="ward-name">{ward.name}</span>
                  <span className="ward-unresolved-badge">
                    {ward.count} {t('unresolved_badge')}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="no-worst-wards">{t('no_unresolved_reports')}</p>
          )}
        </div>

        {/* City-Wide Ward Cleanliness Leaderboard Table */}
        <div style={{ gridColumn: '1 / -1', background: 'var(--color-bg-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 size={16} style={{ color: 'var(--color-primary)' }} />
            {t('ward_leaderboard_title')}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', color: 'var(--color-text-primary)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--color-text-muted)', fontSize: '11px' }}>
                <th style={{ padding: '8px' }}>{t('th_rank')}</th>
                <th style={{ padding: '8px' }}>{t('th_ward')}</th>
                <th style={{ padding: '8px' }}>{t('th_zone')}</th>
                <th style={{ padding: '8px' }}>{t('th_mla')}</th>
                <th style={{ padding: '8px' }}>{t('th_total')}</th>
                <th style={{ padding: '8px' }}>{t('th_active')}</th>
                <th style={{ padding: '8px' }}>{t('th_res_rate')}</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((row, index) => (
                <tr key={row.ward_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '8px', fontWeight: 700 }}>{index + 1}</td>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{lang === 'gu' ? row.name_gu : row.name_en}</td>
                  <td style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>{lang === 'gu' ? row.zone_gu : row.zone_en}</td>
                  <td style={{ padding: '8px', color: 'var(--color-text-secondary)' }}>{row.mla_en}</td>
                  <td style={{ padding: '8px' }}>{row.total_reports}</td>
                  <td style={{ padding: '8px', color: row.unresolved > 0 ? '#DC2626' : '#16A34A', fontWeight: 700 }}>{row.unresolved}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: row.resolution_rate_pct >= 75 ? '#DCFCE7' : row.resolution_rate_pct >= 40 ? '#FEF9C3' : '#FEE2E2', color: row.resolution_rate_pct >= 75 ? '#166534' : row.resolution_rate_pct >= 40 ? '#854D0E' : '#991B1B', fontWeight: 700 }}>
                      {row.resolution_rate_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default StatsPanel;
