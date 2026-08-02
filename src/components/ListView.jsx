import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import WardCard from './WardCard';
import wardsData from '../data/wards.json';

export const ListView = ({ reports, onReportSelect }) => {
  const { t } = useTranslation();

  // Group and sort wards by unresolved count (descending)
  const groupedWards = useMemo(() => {
    // 1. Group reports by ward_id
    const reportsByWard = reports.reduce((acc, report) => {
      acc[report.ward_id] = acc[report.ward_id] || [];
      acc[report.ward_id].push(report);
      return acc;
    }, {});

    // 2. Map all wards to their corresponding reports and calculate sorting weights
    return wardsData
      .map((ward) => {
        const wardReports = reportsByWard[ward.id] || [];
        const unresolvedCount = wardReports.filter((r) => r.status === 'unresolved').length;
        return {
          ward,
          reports: wardReports,
          unresolvedCount
        };
      })
      // 3. Keep wards that have reports matching the current active filter OR keep all if reports list is empty
      .filter((item) => item.reports.length > 0)
      // 4. Sort by unresolved complaints count (highest first), then total reports
      .sort((a, b) => b.unresolvedCount - a.unresolvedCount || b.reports.length - a.reports.length);
  }, [reports]);

  return (
    <div className="list-view-container">
      {groupedWards.length > 0 ? (
        <div className="wards-grid">
          {groupedWards.map(({ ward, reports: wardReports }) => (
            <WardCard key={ward.id} ward={ward} reports={wardReports} onReportSelect={onReportSelect} />
          ))}
        </div>
      ) : (
        <div className="list-empty-state">
          <p>{t('no_reports')}</p>
        </div>
      )}
    </div>
  );
};
export default ListView;
