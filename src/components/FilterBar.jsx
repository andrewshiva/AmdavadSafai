import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Eye, AlertOctagon } from 'lucide-react';

export const FilterBar = ({ severity, setSeverity, status, setStatus }) => {
  const { t } = useTranslation();

  return (
    <div className="filter-bar">
      <div className="filter-item">
        <AlertOctagon size={16} className="filter-icon" />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t('filter_all_severity')}</option>
          <option value="minor">{t('filter_minor')}</option>
          <option value="moderate">{t('filter_moderate')}</option>
          <option value="severe">{t('filter_severe')}</option>
          <option value="critical">{t('filter_critical')}</option>
        </select>
      </div>

      <div className="filter-item">
        <Eye size={16} className="filter-icon" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t('filter_all_status')}</option>
          <option value="unresolved">{t('filter_unresolved')}</option>
          <option value="resolved">{t('filter_resolved')}</option>
        </select>
      </div>
    </div>
  );
};
export default FilterBar;
