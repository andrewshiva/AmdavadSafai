import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../utils/dateTime';

export const ReportItem = ({ report, onClick }) => {
  const { t, lang } = useTranslation();

  const getRelativeTime = (timestamp) => {
    const reportDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - reportDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours <= 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} ${t('minutes_ago')}`;
      }
      return `${diffHours} ${t('hours_ago')}`;
    }
    return `${diffDays} ${t('days_ago')}`;
  };

  const categoryKey = report.category ? `cat_${report.category}` : 'cat_mixed_waste';
  const fullDateTime = formatDateTime(report.reported_at, lang);

  return (
    <div
      className={`report-item-card status-${report.status}`}
      onClick={() => onClick && onClick(report)}
      style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
    >
      <div className="report-item-header">
        <p className="report-item-desc">
          {lang === 'en' ? report.description_en : report.description_gu}
        </p>
      </div>

      <div className="report-item-meta" style={{ flexWrap: 'wrap', gap: '6px' }}>
        <div className="meta-left" style={{ gap: '6px' }}>
          <span className={`badge badge-${report.severity}`}>
            {t(`filter_${report.severity}`)}
          </span>
          <span className={`badge status-${report.status}`}>
            {report.status === 'resolved' && (
              <span className="status-icon"><CheckCircle2 size={12} style={{ marginRight: '3px' }} /></span>
            )}
            {report.status !== 'resolved' && (
              <span className="status-icon"><AlertCircle size={12} style={{ marginRight: '3px' }} /></span>
            )}
            <span>{t(`${report.status}_badge`)}</span>
          </span>
          <span className="badge" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--glass-border)' }}>
            {t(categoryKey)}
          </span>
        </div>
        <div className="meta-right" title={`${t('reported_on') || 'Reported on'}: ${fullDateTime}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Clock size={12} style={{ marginRight: '4px' }} />
          <span>{fullDateTime || getRelativeTime(report.reported_at)}</span>
        </div>
      </div>
    </div>
  );
};
export default ReportItem;
