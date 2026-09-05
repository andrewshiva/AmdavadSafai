import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Image, MapPin, ChevronRight, FileText, Clock } from 'lucide-react';
import wardsData from '../data/wards.json';
import { formatDateTime } from '../utils/dateTime';

export const MyReportsView = ({ reports = [], onSelectReport, onOpenReport, onViewReceipt }) => {
  const { lang } = useTranslation();
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'pending', 'in_progress', 'resolved'

  // Combine prop reports with locally submitted reports
  const allReports = useMemo(() => {
    try {
      const local = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        const existingIds = new Set(reports.map((r) => r.id));
        const newUnique = local.filter((r) => !existingIds.has(r.id));
        return [...newUnique, ...reports];
      }
    } catch {
      // Ignore
    }
    return reports;
  }, [reports]);

  const getStatusType = (status) => {
    if (status === 'resolved') return 'resolved';
    if (status === 'in_progress' || status === 'assigned') return 'in_progress';
    return 'pending';
  };

  const pendingReports = allReports.filter((r) => getStatusType(r.status) === 'pending');
  const inProgressReports = allReports.filter((r) => getStatusType(r.status) === 'in_progress');
  const resolvedReports = allReports.filter((r) => getStatusType(r.status) === 'resolved');

  const displayedReports = filterTab === 'pending'
    ? pendingReports
    : filterTab === 'in_progress'
    ? inProgressReports
    : filterTab === 'resolved'
    ? resolvedReports
    : allReports;

  const formatReportDateTime = (dateStr) => {
    return formatDateTime(dateStr, lang) || 'Just now';
  };

  const getWardName = (wardId) => {
    const ward = wardsData.find((w) => w.id === wardId);
    if (!ward) return lang === 'gu' ? 'વોર્ડ ૧૪, પશ્ચિમ ઝોન' : 'Ward 14, West Zone';
    if (lang === 'gu') {
      return `${ward.name_gu || ward.name_en}, ${ward.zone_gu || ward.zone_en}`;
    }
    return `${ward.name_en}, ${ward.zone_en}`;
  };

  const getLocalizedTitle = (item) => {
    if (lang === 'gu' && item.description_gu) return item.description_gu;
    if (lang === 'hi' && item.description_hi) return item.description_hi;
    return item.description_en || (lang === 'gu' ? 'કચરાનો ઢગલો' : lang === 'hi' ? 'कचरे का ढेर' : 'OVERFLOWING GARBAGE DUMP');
  };

  return (
    <div className="variant-my-reports-container">
      {/* Header Row: Title & Filter Tabs */}
      <div className="variant-reports-header">
        <div className="variant-reports-title-wrap">
          <span className="variant-tag">
            {lang === 'gu' ? 'નાગરિક ડેશબોર્ડ' : lang === 'hi' ? 'नागरिक डैशबोर्ड' : 'ACCOUNT DASHBOARD'}
          </span>
          <h1 className="variant-page-title">
            {lang === 'gu' ? 'મારી ફરિયાદો' : lang === 'hi' ? 'मेरी शिकायतें' : 'MY REPORTS'}
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="variant-reports-filter-pills">
          <button
            type="button"
            className={`variant-filter-pill ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            {lang === 'gu' ? `બધી (${allReports.length})` : lang === 'hi' ? `सभी (${allReports.length})` : `ALL (${allReports.length})`}
          </button>
          <button
            type="button"
            className={`variant-filter-pill ${filterTab === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterTab('pending')}
          >
            {lang === 'gu' ? `બાકી (${pendingReports.length})` : lang === 'hi' ? `लंबित (${pendingReports.length})` : `PENDING (${pendingReports.length})`}
          </button>
          <button
            type="button"
            className={`variant-filter-pill ${filterTab === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilterTab('in_progress')}
          >
            {lang === 'gu' ? `ચાલુ (${inProgressReports.length})` : lang === 'hi' ? `प्रगति पर (${inProgressReports.length})` : `IN PROGRESS (${inProgressReports.length})`}
          </button>
          <button
            type="button"
            className={`variant-filter-pill ${filterTab === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilterTab('resolved')}
          >
            {lang === 'gu' ? `ઉકેલાયેલ (${resolvedReports.length})` : lang === 'hi' ? `समाधानित (${resolvedReports.length})` : `RESOLVED (${resolvedReports.length})`}
          </button>
        </div>
      </div>

      {/* Reports List Cards */}
      <div className="variant-reports-list">
        {displayedReports.length === 0 ? (
          <div className="variant-slab-card variant-empty-state">
            <p>
              {lang === 'gu'
                ? 'આ શ્રેણીમાં કોઈ ફરિયાદ મળી નથી.'
                : lang === 'hi'
                ? 'इस श्रेणी में कोई शिकायत नहीं मिली।'
                : 'No reports found in this category.'}
            </p>
            <button
              type="button"
              className="variant-btn-primary"
              onClick={onOpenReport}
              style={{ marginTop: '16px' }}
            >
              {lang === 'gu' ? 'નવી ફરિયાદ નોંધાવો' : lang === 'hi' ? 'नई शिकायत दर्ज करें' : 'REPORT AN ISSUE'}
            </button>
          </div>
        ) : (
          displayedReports.map((item, index) => {
            const statusType = getStatusType(item.status);
            const ticketId = item.amc_ticket_id || `#AS-${98240 - index}`;
            const title = getLocalizedTitle(item);

            return (
              <div
                key={item.id || index}
                className="variant-slab-card variant-report-item-card"
                onClick={() => onSelectReport && onSelectReport(item)}
              >
                {/* Left Thumbnail */}
                <div className="variant-report-thumb-box">
                  {item.image_url ? (
                    <img src={item.image_url} alt="Report evidence" className="report-thumb-img" />
                  ) : (
                    <div className="thumb-placeholder-icon">
                      <Image size={24} />
                    </div>
                  )}
                </div>

                {/* Center Content */}
                <div className="variant-report-item-content">
                  <div className="variant-report-meta-line">
                    <span className="meta-ticket">{ticketId}</span>
                    <span className="meta-dot">·</span>
                    <span className="meta-date" title={formatReportDateTime(item.created_at || item.reported_at)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} style={{ color: '#FF6B35' }} />
                      <span>{formatReportDateTime(item.created_at || item.reported_at)}</span>
                    </span>
                  </div>

                  <h3 className="variant-report-item-title">
                    {title}
                  </h3>

                  <div className="variant-report-location">
                    <MapPin size={13} />
                    <span>{getWardName(item.ward_id)}</span>
                  </div>

                  {statusType === 'resolved' && item.resolved_at && (
                    <div style={{ fontSize: '11px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: 600 }}>
                      <span>✓ {lang === 'gu' ? 'ઉકેલાયું:' : lang === 'hi' ? 'समाधानित:' : 'Resolved:'}</span>
                      <span>{formatReportDateTime(item.resolved_at)}</span>
                    </div>
                  )}
                </div>

                {/* Right Status Pill & Chevron */}
                <div className="variant-report-item-right">
                  <div className={`variant-status-badge ${statusType}`}>
                    <span className="status-indicator-dot" />
                    <div className="status-text-wrap">
                      <span className="status-label-top">
                        {lang === 'gu' ? 'સ્થિતિ' : lang === 'hi' ? 'स्थिति' : 'STATUS'}
                      </span>
                      <span className="status-val">
                        {statusType === 'pending'
                          ? (lang === 'gu' ? 'ચકાસણી બાકી' : lang === 'hi' ? 'सत्यापन लंबित' : 'PENDING VERIFICATION')
                          : statusType === 'in_progress'
                          ? (lang === 'gu' ? 'સફાઈ ચાલુ' : lang === 'hi' ? 'सफाई कार्य जारी' : 'CLEANING IN PROGRESS')
                          : (lang === 'gu' ? 'સફળતાપૂર્વક સાફ' : lang === 'hi' ? 'सफलतापूर्वक हल' : 'RESOLVED SUCCESSFULLY')}
                      </span>
                    </div>
                  </div>

                  {statusType === 'resolved' ? (
                    <button
                      type="button"
                      className="variant-view-receipt-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewReceipt) {
                          onViewReceipt(item);
                        } else if (onSelectReport) {
                          onSelectReport(item);
                        }
                      }}
                    >
                      <FileText size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {lang === 'gu' ? 'રસીદ જુઓ' : lang === 'hi' ? 'रसीद देखें' : 'VIEW RECEIPT'}
                    </button>
                  ) : (
                    <ChevronRight size={18} className="variant-item-chevron" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyReportsView;
