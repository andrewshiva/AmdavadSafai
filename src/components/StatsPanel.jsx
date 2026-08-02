import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { ChevronUp, ChevronDown, BarChart2, ShieldAlert, PieChart as PieIcon, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import wardsData from '../data/wards.json';

export const StatsPanel = ({ reports }) => {
  const { t, lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [displayedTotal, setDisplayedTotal] = useState(0);
  const [displayedUnresolved, setDisplayedUnresolved] = useState(0);
  const [statsData, setStatsData] = useState(null);

  // Stats calculation from local reports array
  const totalCount = reports.length;
  const unresolvedCount = reports.filter((r) => r.status === 'unresolved').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const resolutionRate = totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStatsData(data);
      })
      .catch(() => {});
  }, [isOpen]);

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
  const zoneChartData = statsData?.zone_breakdown
    ? statsData.zone_breakdown.map((z) => ({
        zone: lang === 'gu' ? z.zone_gu || z.zone_en : z.zone_en,
        unresolved: z.unresolved_count,
        resolved: z.resolved_count
      }))
    : [
        { zone: 'West Zone', unresolved: 5, resolved: 12 },
        { zone: 'South West Zone', unresolved: 3, resolved: 8 },
        { zone: 'North West Zone', unresolved: 4, resolved: 10 },
        { zone: 'Central Zone', unresolved: 7, resolved: 6 },
        { zone: 'East Zone', unresolved: 6, resolved: 5 }
      ];

  const severityChartData = statsData?.severity_distribution
    ? statsData.severity_distribution.map((s) => ({
        name: t(`filter_${s.severity}`),
        value: s.count,
        color:
          s.severity === 'minor'
            ? '#16A34A'
            : s.severity === 'moderate'
            ? '#D97706'
            : s.severity === 'severe'
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

  return (
    <div className={`stats-panel-container ${isOpen ? 'open' : ''}`}>
      <button className="stats-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className="trigger-left">
          <BarChart2 size={18} style={{ marginRight: '6px' }} />
          <span>{t('stats')}</span>
        </div>
        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      <div className="stats-content">
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
                <th style={{ padding: '8px' }}>#</th>
                <th style={{ padding: '8px' }}>Ward</th>
                <th style={{ padding: '8px' }}>Zone</th>
                <th style={{ padding: '8px' }}>MLA</th>
                <th style={{ padding: '8px' }}>Total</th>
                <th style={{ padding: '8px' }}>Active</th>
                <th style={{ padding: '8px' }}>Res. %</th>
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
