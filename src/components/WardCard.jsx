import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import ReportItem from './ReportItem';
import { ChevronRight, ChevronDown, User, FileText } from 'lucide-react';

export const WardCard = ({ ward, reports, onReportSelect }) => {
  const { t, lang } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const unresolvedCount = reports.filter((r) => r.status === 'unresolved').length;
  const mlaName = lang === 'gu' ? ward.mla_gu : ward.mla_en;

  return (
    <div className={`ward-card-container ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="ward-card-header"
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <div className="ward-header-left">
          <div className="ward-title-group">
            <span className="ward-name">📍 {lang === 'en' ? ward.name_en : ward.name_gu}</span>
            <span className="ward-zone">({lang === 'en' ? ward.zone_en : ward.zone_gu})</span>
          </div>
          <div className="ward-corporator-info" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span><User size={11} style={{ display: 'inline', marginRight: '2px' }} />{t('corporator')}: {lang === 'en' ? ward.corporator_en : ward.corporator_gu}</span>
            {mlaName && <span>· MLA: {mlaName}</span>}
          </div>
        </div>

        <div className="ward-header-right">
          <div className="ward-stats-pills">
            <span className="pill pill-total">
              {reports.length} {t('reports_count')}
            </span>
            {unresolvedCount > 0 && (
              <span className="pill pill-unresolved">
                {unresolvedCount} {t('unresolved_count')}
              </span>
            )}
          </div>
          <button className="expand-toggle-icon">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </button>

      {isExpanded && (
        <div className="ward-card-body">
          {reports.length > 0 ? (
            <div className="reports-list">
              {reports.map((report) => (
                <ReportItem key={report.id} report={report} onClick={onReportSelect} />
              ))}
            </div>
          ) : (
            <div className="no-reports-placeholder">
              <FileText size={24} />
              <p>{t('no_reports')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default WardCard;
