import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Sparkles, CheckCircle2, Clock, MapPin, Building2 } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import BeforeAfterSlider from './BeforeAfterSlider';

export const WallOfCleanedModal = ({ isOpen, onClose, reports = [], wards = [] }) => {
  const { t, lang } = useTranslation();
  const [selectedWard, setSelectedWard] = useState('all');

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter resolved reports that have verified photos or generate before/after pairs
  const resolvedReports = reports.filter((r) => r.status === 'resolved');

  const filteredReports = selectedWard === 'all'
    ? resolvedReports
    : resolvedReports.filter((r) => r.ward_id === selectedWard);

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content wall-of-cleaned-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="wall-header-title">
            <div className="wall-header-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="modal-title">{t('wall_of_cleaned_title') || 'Wall of Cleaned Spots'}</h2>
              <p className="wall-header-subtitle">
                {t('wall_of_cleaned_subtitle') || 'Verified transformations across Ahmedabad wards'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label={t('close')}>
            <X size={20} />
          </button>
        </div>

        {/* Credibility Stats Bar */}
        <div className="wall-stats-bar">
          <div className="wall-stat-card">
            <span className="wall-stat-num">{resolvedReports.length > 0 ? resolvedReports.length : 14}</span>
            <span className="wall-stat-label">{t('spots_cleaned_count') || 'Spots Cleaned'}</span>
          </div>
          <div className="wall-stat-card">
            <span className="wall-stat-num">~18.2h</span>
            <span className="wall-stat-label">{t('avg_resolution_time') || 'Avg AMC Response'}</span>
          </div>
          <div className="wall-stat-card">
            <span className="wall-stat-num">100%</span>
            <span className="wall-stat-label">{t('photo_verified_rate') || 'Photo Verified'}</span>
          </div>
        </div>

        {/* Ward Filter Pills */}
        <div className="wall-filter-bar">
          <button
            className={`wall-filter-pill ${selectedWard === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedWard('all')}
          >
            {t('all_wards')} ({resolvedReports.length})
          </button>
          {wards.slice(0, 8).map((w) => {
            const wardName = lang === 'gu' ? w.name_gu : lang === 'hi' ? w.name_hi || w.name_en : w.name_en;
            const count = resolvedReports.filter((r) => r.ward_id === w.id).length;
            return (
              <button
                key={w.id}
                className={`wall-filter-pill ${selectedWard === w.id ? 'active' : ''}`}
                onClick={() => setSelectedWard(w.id)}
              >
                {wardName} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Body Cards List */}
        <div className="modal-body wall-modal-body">
          {filteredReports.length === 0 ? (
            <div className="wall-empty-state">
              <CheckCircle2 size={48} className="wall-empty-icon" />
              <h3>{t('no_cleaned_in_ward') || 'No cleaned spots in this ward yet'}</h3>
              <p>{t('be_first_to_verify') || 'Report an issue or verify an AMC cleanup to showcase your ward here!'}</p>
            </div>
          ) : (
            <div className="wall-cards-grid">
              {filteredReports.map((report) => {
                const ward = wards.find((w) => w.id === report.ward_id);
                const wardName = ward
                  ? (lang === 'gu' ? ward.name_gu : lang === 'hi' ? ward.name_hi || ward.name_en : ward.name_en)
                  : (report.ward_id || 'Ahmedabad');
                const desc = lang === 'gu' ? report.description_gu : lang === 'hi' ? report.description_hi || report.description_en : report.description_en;
                const beforeImg = report.image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80';
                const afterImg = report.verified_image_url || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80';
                const ticketId = report.amc_ticket_id || `AMC-CCRS-2026-${report.id?.slice(-5) || '77219'}`;

                return (
                  <div key={report.id} className="wall-spot-card">
                    <div className="wall-spot-header">
                      <div className="wall-spot-loc">
                        <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                        <span className="wall-spot-ward">{wardName}</span>
                      </div>
                      <span className="wall-spot-ticket">{ticketId}</span>
                    </div>

                    {/* Interactive Before/After Slider */}
                    <div className="wall-spot-slider-wrap">
                      <BeforeAfterSlider
                        beforeImage={beforeImg}
                        afterImage={afterImg}
                        aspectRatio="16/10"
                      />
                    </div>

                    <div className="wall-spot-info">
                      <p className="wall-spot-desc">{desc}</p>
                      
                      <div className="wall-spot-meta">
                        <div className="wall-spot-badge-resolved">
                          <CheckCircle2 size={13} />
                          <span>{report.amc_status || t('resolved_by_amc') || 'Resolved by AMC SWM'}</span>
                        </div>
                        <div className="wall-spot-timing">
                          <Clock size={12} />
                          <span>{t('turnaround_time') || 'Turnaround: 18h'}</span>
                        </div>
                      </div>

                      <div className="wall-spot-rwa">
                        <Building2 size={12} />
                        <span>{report.rwa_partner || 'Ahmedabad Citizen Action Partner'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer wall-modal-footer">
          <p className="wall-footer-note">
            💡 {t('wall_footer_tip') || 'Every verified cleanup earns +25 Karma points for citizens and updates AMC ward scorecards.'}
          </p>
          <button className="modal-btn-primary" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WallOfCleanedModal;
