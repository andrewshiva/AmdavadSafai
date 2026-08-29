import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Building2, ShieldCheck, AlertTriangle, UserCheck, FileText, Download, Users, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export const RWADashboardModal = ({ isOpen, onClose, reports = [], wards = [] }) => {
  const { t, lang } = useTranslation();
  // Default to pioneer pilot ward 'ward_10' (Vastrapur / Bodakdev) or first ward
  const [selectedWardId, setSelectedWardId] = useState('ward_10');

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentWard = wards.find((w) => w.id === selectedWardId) || wards[0] || {};
  const wardReports = reports.filter((r) => r.ward_id === selectedWardId);
  const unresolvedCount = wardReports.filter((r) => r.status === 'unresolved').length;
  const resolvedCount = wardReports.filter((r) => r.status === 'resolved').length;
  const resolutionRate = wardReports.length > 0
    ? Math.round((resolvedCount / wardReports.length) * 100)
    : 85;

  const wardName = lang === 'gu'
    ? currentWard.name_gu
    : lang === 'hi'
    ? currentWard.name_hi || currentWard.name_en
    : currentWard.name_en;

  const zoneName = lang === 'gu'
    ? currentWard.zone_gu
    : lang === 'hi'
    ? currentWard.zone_hi || currentWard.zone_en
    : currentWard.zone_en;

  const corporatorName = lang === 'gu'
    ? currentWard.corporator_gu
    : lang === 'hi'
    ? currentWard.corporator_hi || currentWard.corporator_en
    : currentWard.corporator_en;

  const mlaName = lang === 'gu'
    ? currentWard.mla_gu
    : lang === 'hi'
    ? currentWard.mla_hi || currentWard.mla_en
    : currentWard.mla_en;

  const handlePrintDossier = () => {
    window.print();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content rwa-dashboard-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="rwa-header-title">
            <div className="rwa-header-icon">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="modal-title">{t('rwa_hub_title') || 'RWA & Ward Civic Dashboard'}</h2>
              <p className="rwa-header-subtitle">
                {t('rwa_hub_subtitle') || 'Resident Welfare Association & Journalist Accountability Hub'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label={t('close')}>
            <X size={20} />
          </button>
        </div>

        {/* Ward Selector Dropdown */}
        <div className="rwa-ward-select-wrap">
          <label className="rwa-select-label">
            📍 {t('select_ward_rwa') || 'Select Ward for RWA Scorecard:'}
          </label>
          <select
            className="rwa-ward-select"
            value={selectedWardId}
            onChange={(e) => setSelectedWardId(e.target.value)}
          >
            {wards.map((w) => {
              const name = lang === 'gu' ? w.name_gu : lang === 'hi' ? w.name_hi || w.name_en : w.name_en;
              const isPilot = w.id === 'ward_10' || w.id === 'ward_11' || w.id === 'ward_12';
              return (
                <option key={w.id} value={w.id}>
                  {name} {isPilot ? '⭐ (Active RWA Pilot)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Modal Body */}
        <div className="modal-body rwa-modal-body">
          {/* Pilot Badge */}
          <div className="rwa-pilot-banner">
            <ShieldCheck size={18} className="rwa-pilot-badge-icon" />
            <div>
              <strong>{wardName} {t('rwa_pilot_title') || 'Community Cleanliness Initiative'}</strong>
              <p>{t('rwa_pilot_desc') || 'Partnered with local resident associations to track every garbage hotspot to resolution.'}</p>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="rwa-metrics-grid">
            <div className="rwa-metric-card">
              <span className="rwa-metric-num">{resolutionRate}%</span>
              <span className="rwa-metric-label">{t('rwa_resolution_rate') || 'Resolution Rate'}</span>
              <span className="rwa-metric-sub">{resolvedCount} {t('of_total_fixed') || 'spots cleared'}</span>
            </div>

            <div className="rwa-metric-card">
              <span className="rwa-metric-num text-danger">{unresolvedCount}</span>
              <span className="rwa-metric-label">{t('rwa_unresolved_active') || 'Active Hotspots'}</span>
              <span className="rwa-metric-sub">{t('pending_amc_action') || 'Pending AMC action'}</span>
            </div>

            <div className="rwa-metric-card">
              <span className="rwa-metric-num text-warning">~2.4d</span>
              <span className="rwa-metric-label">{t('rwa_oldest_dump') || 'Max Dump Age'}</span>
              <span className="rwa-metric-sub">{t('longest_pending') || 'Longest unattended'}</span>
            </div>
          </div>

          {/* Elected Representatives Card */}
          <div className="rwa-rep-section">
            <h4 className="rwa-section-heading">
              <UserCheck size={16} />
              <span>{t('elected_reps_card') || 'Ward Governance & Accountability Hierarchy'}</span>
            </h4>

            <div className="rwa-rep-grid">
              <div className="rwa-rep-item">
                <span className="rwa-rep-role">{t('corporator') || 'Municipal Corporator'}</span>
                <span className="rwa-rep-name">{corporatorName || 'AMC Ward Office'}</span>
                <span className="rwa-rep-phone">📞 155303 (AMC Control Room)</span>
              </div>

              <div className="rwa-rep-item">
                <span className="rwa-rep-role">{t('mla_vidhansabha') || 'Ward MLA (Gujarat Vidhan Sabha)'}</span>
                <span className="rwa-rep-name">{mlaName || 'Constituency MLA'}</span>
                <span className="rwa-rep-phone">🏛️ {zoneName} Zone</span>
              </div>
            </div>
          </div>

          {/* Unresolved Hotspots in Ward */}
          <div className="rwa-hotspots-section">
            <h4 className="rwa-section-heading">
              <AlertTriangle size={16} className="text-danger" />
              <span>{t('active_hotspots_list') || 'Hotspots Requiring Immediate AMC SWM Action'} ({unresolvedCount})</span>
            </h4>

            {wardReports.filter((r) => r.status === 'unresolved').length === 0 ? (
              <div className="rwa-all-clean-notice">
                <CheckCircle2 size={24} style={{ color: '#10B981' }} />
                <span>{t('no_active_hotspots_ward') || 'No unresolved garbage spots currently in this ward!'}</span>
              </div>
            ) : (
              <div className="rwa-hotspots-list">
                {wardReports.filter((r) => r.status === 'unresolved').map((r) => {
                  const desc = lang === 'gu' ? r.description_gu : lang === 'hi' ? r.description_hi || r.description_en : r.description_en;
                  const ticket = r.amc_ticket_id || `AMC-CCRS-${r.id?.slice(-5) || '88412'}`;
                  return (
                    <div key={r.id} className="rwa-hotspot-row">
                      <div className="rwa-hotspot-main">
                        <span className={`badge badge-${r.severity}`}>
                          {t(`filter_${r.severity}`)}
                        </span>
                        <span className="rwa-hotspot-desc">{desc}</span>
                      </div>
                      <div className="rwa-hotspot-ticket">
                        <span>{ticket}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer rwa-modal-footer">
          <button
            type="button"
            className="rwa-export-btn"
            onClick={handlePrintDossier}
            title={t('export_rwa_dossier') || 'Print / Export Civic Dossier'}
          >
            <Download size={15} />
            <span>{t('print_dossier') || 'Print RWA Dossier'}</span>
          </button>

          <button className="modal-btn-primary" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RWADashboardModal;
