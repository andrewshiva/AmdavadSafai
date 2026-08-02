import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import {
  X,
  MapPin,
  ExternalLink,
  ThumbsUp,
  CheckCircle2,
  Flag,
  Share2,
  Building2,
  UserCheck,
  ShieldCheck,
  Tag
} from 'lucide-react';
import wardsData from '../data/wards.json';

export const ReportDetailModal = ({
  isOpen,
  onClose,
  report,
  onVerifyClick,
  onFlagClick,
  onUpvoteSuccess
}) => {
  const { t, lang } = useTranslation();
  const [upvotes, setUpvotes] = useState(report?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const ward = wardsData.find((w) => w.id === report.ward_id);
  const wardName = ward ? (lang === 'gu' ? ward.name_gu : ward.name_en) : '';
  const zoneName = ward ? (lang === 'gu' ? ward.zone_gu : ward.zone_en) : '';
  const corporatorName = ward ? (lang === 'gu' ? ward.corporator_gu : ward.corporator_en) : '';
  const mlaName = ward ? (lang === 'gu' ? ward.mla_gu : ward.mla_en) : 'Darshana Vaghela';
  const mlaParty = ward?.mla_party || 'BJP';
  const mpName = ward ? (lang === 'gu' ? ward.mp_gu : ward.mp_en) : 'Hasmukh Patel';

  const categoryKey = report.category ? `cat_${report.category}` : 'cat_mixed_waste';
  const categoryLabel = t(categoryKey);

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setUpvotes((prev) => prev + 1);
    setHasUpvoted(true);

    try {
      await fetch(`/api/reports/${report.id}/upvote`, { method: 'POST' });
      if (onUpvoteSuccess) onUpvoteSuccess();
    } catch {
      // Local state updated
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#report=${report.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${report.lat},${report.lng}`;

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const diffMs = new Date() - new Date(timestamp);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return t('hours_ago');
    return `${diffDays} ${t('days_ago')}`;
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: 0, overflow: 'hidden' }}
      >
        {/* Top Image Banner */}
        <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#1E293B' }}>
          {report.image_url ? (
            <img
              src={report.image_url}
              alt="Reported dump"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px' }}>
              📍 {wardName} Garbage Dump Location
            </div>
          )}

          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.75)', color: 'white', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>

          <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className={`badge badge-${report.severity}`} style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
              {t(`filter_${report.severity}`)}
            </span>
            <span className={`badge status-${report.status}`} style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
              {t(`${report.status}_badge`)}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '20px', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Header & Location */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> {wardName} · {zoneName}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {getRelativeTime(report.reported_at)}
              </span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
              {lang === 'gu' ? report.description_gu : report.description_en}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <Tag size={14} style={{ color: 'var(--color-primary)' }} />
              <span>{t('category_label')}: <strong style={{ color: 'var(--color-text-primary)' }}>{categoryLabel}</strong></span>
            </div>
          </div>

          {/* Social Upvote & Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'var(--color-bg-elevated)', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <button
              type="button"
              onClick={handleUpvote}
              disabled={hasUpvoted}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: hasUpvoted ? '#059669' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: hasUpvoted ? 'default' : 'pointer'
              }}
            >
              <ThumbsUp size={14} />
              <span>{hasUpvoted ? 'Verified ✓' : t('ive_seen_this')} ({upvotes})</span>
            </button>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={14} />
              {t('get_directions')}
            </a>

            <button
              type="button"
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                color: 'var(--color-text-secondary)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Share2 size={13} />
              <span>{copied ? 'Copied!' : t('share_report')}</span>
            </button>
          </div>

          {/* Full Representative Hierarchy Card */}
          <div style={{ background: 'var(--color-bg-elevated)', padding: '14px', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
              Elected Representative Hierarchy & Accountability
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--color-bg)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  <UserCheck size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  {t('corporator_title')}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{corporatorName}</span>
                <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>AMC Ward Representative</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--color-bg)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  <Building2 size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  {t('mla_title')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{mlaName}</span>
                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: mlaParty === 'BJP' ? '#FF9933' : '#19AAED', color: 'white' }}>
                    {mlaParty}
                  </span>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>Gujarat Vidhan Sabha MLA</span>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
              <span>{t('mp_title')}: <strong>{mpName}</strong></span>
              <span>AMC Swachh Helpline: <a href="tel:155303" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>155303</a></span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <a
                href="tel:155303"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--color-text-primary)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                📞 Call AMC Control Room (155303)
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Unresolved garbage complaint in Ward ${wardName}, Ahmedabad. Needs action @AHMAMC @AmdavadSafai ${window.location.origin}/#report=${report.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#000000',
                  color: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                🐦 Escalate on X / Twitter
              </a>
            </div>
          </div>


          {/* Verification Photo Preview if Resolved */}
          {report.status === 'resolved' && report.verified_image_url && (
            <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', padding: '12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065F46', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <CheckCircle2 size={14} /> Verified Clean Spot Evidence
              </span>
              <img src={report.verified_image_url} alt="Cleaned site" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px' }} />
            </div>
          )}

          {/* Community Actions (Verify / Flag) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => onVerifyClick(report)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #16A34A',
                background: '#F0FDF4',
                color: '#166534',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={15} />
              {t('verify_cleanup')}
            </button>

            <button
              type="button"
              onClick={() => onFlagClick(report)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #DC2626',
                background: '#FEF2F2',
                color: '#991B1B',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Flag size={15} />
              {t('flag_incorrect')}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--glass-border)', padding: '12px 20px' }}>
          <button type="button" className="modal-btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            {t('close')}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ReportDetailModal;
