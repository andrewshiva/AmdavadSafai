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
  Tag,
  Copy,
  Check,
  AlertTriangle,
  Users,
  Clock,
  FileText
} from 'lucide-react';
import wardsData from '../data/wards.json';
import BeforeAfterSlider from './BeforeAfterSlider';
import { getAmcTicketId } from '../utils/amcTickets';
import { addKarmaPoints } from '../utils/gamification';
import { formatDateTime } from '../utils/dateTime';

export const ReportDetailModal = ({
  isOpen = true,
  onClose,
  report,
  onVerifyClick,
  onFlagClick,
  onDisputeClick,
  onUpvoteSuccess,
  onOpenShareCard,
  onViewReceipt,
  onVerify,
  onFlag,
  onDispute,
  onShareCard
}) => {
  const { t, lang } = useTranslation();
  const [upvotes, setUpvotes] = useState(report?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);

  if ((isOpen !== undefined && !isOpen) || !report) return null;

  const ward = wardsData.find((w) => w.id === report.ward_id);
  const wardName = ward ? (lang === 'gu' ? ward.name_gu : ward.name_en) : '';
  const zoneName = ward ? (lang === 'gu' ? ward.zone_gu : ward.zone_en) : '';
  const corporatorName = ward ? (lang === 'gu' ? ward.corporator_gu : ward.corporator_en) : '';
  const mlaName = ward ? (lang === 'gu' ? ward.mla_gu : ward.mla_en) : 'Darshana Vaghela';
  const mlaParty = ward?.mla_party || 'BJP';
  const mpName = ward ? (lang === 'gu' ? ward.mp_gu : ward.mp_en) : 'Hasmukh Patel';

  const description = lang === 'gu' ? report.description_gu : lang === 'hi' ? report.description_hi || report.description_en : report.description_en;
  const categoryKey = report.category ? `cat_${report.category}` : 'cat_mixed_waste';
  const categoryLabel = t(categoryKey);

  const diffHours = report.reported_at ? Math.floor((new Date() - new Date(report.reported_at)) / (1000 * 60 * 60)) : 0;
  const isOverdue = report.status === 'unresolved' && diffHours >= 48;

  const handleVerify = () => {
    if (onVerifyClick) onVerifyClick(report);
    else if (onVerify) onVerify(report);
  };

  const handleFlag = () => {
    if (onFlagClick) onFlagClick(report);
    else if (onFlag) onFlag(report);
  };

  const handleDispute = () => {
    if (onDisputeClick) onDisputeClick(report);
    else if (onDispute) onDispute(report);
  };

  const handleShareCard = (data) => {
    if (onOpenShareCard) onOpenShareCard(data);
    else if (onShareCard) onShareCard(data);
  };

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setUpvotes((prev) => prev + 1);
    setHasUpvoted(true);

    // Award +5 Karma points with targetId deduplication
    addKarmaPoints('REPORT_UPVOTED', 5, { targetId: report.id, description: `Upvoted Complaint Hotspot (${wardName})` });

    try {
      await fetch(`/api/reports/${report.id}/upvote`, { method: 'POST' });
      if (onUpvoteSuccess) onUpvoteSuccess();
    } catch {
      // Local storage fallback for offline support
      const stored = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
      const updated = stored.map((r) => r.id === report.id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r);
      localStorage.setItem('amdavad_safai_local_reports', JSON.stringify(updated));
      if (onUpvoteSuccess) onUpvoteSuccess();
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
              📍 {wardName}
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
            {isOverdue && (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: '#DC2626', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 0 8px rgba(220, 38, 38, 0.6)' }}>
                🔥 {diffHours}h+ {t('amc_overdue') || 'Overdue'}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="modal-body report-detail-body" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
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

            {/* Date & Time Timestamp Badges */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', padding: '4px 9px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                <Clock size={13} style={{ color: 'var(--color-primary)' }} />
                <span>{t('reported_on') || 'Reported on'}: <strong style={{ color: 'var(--color-text-primary)' }}>{formatDateTime(report.reported_at, lang) || 'Recent'}</strong></span>
              </div>
              {report.status === 'resolved' && report.resolved_at && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#166534', background: '#F0FDF4', padding: '4px 9px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                  <span>{t('resolved_on') || 'Resolved on'}: <strong style={{ color: '#14532D' }}>{formatDateTime(report.resolved_at, lang)}</strong></span>
                </div>
              )}
            </div>

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

            {(onOpenShareCard || onShareCard) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  handleShareCard({
                    type: 'report',
                    title: description,
                    location: ward ? `${wardName} (${zoneName || 'Ahmedabad'})` : 'Ahmedabad',
                    ticketId: getAmcTicketId(report),
                    status: report.status,
                    severity: report.severity
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(37, 211, 102, 0.1)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  color: '#15803D',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Share2 size={13} />
                <span>WhatsApp / Insta</span>
              </button>
            )}

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
              <ExternalLink size={13} />
              <span>{copied ? t('link_copied') : t('share_report')}</span>
            </button>
          </div>

          {/* Full Representative Hierarchy Card */}
          <div style={{ background: 'var(--color-bg-elevated)', padding: '14px', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
              {t('rep_hierarchy_title')}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--color-bg)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  <UserCheck size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  {t('corporator_title')}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{corporatorName}</span>
                <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>{t('amc_ward_rep')}</span>
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
                <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>{t('gujarat_vidhan_sabha_mla')}</span>
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
                {t('call_amc_control_room')}
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
                {t('escalate_x_twitter')}
              </a>
            </div>
          </div>


          {/* Official AMC CCRS & 311 Ticket Integration Card */}
          {(() => {
            const ticketId = getAmcTicketId(report);
            const handleCopyTicketNum = () => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(ticketId);
                setCopiedTicket(true);
                setTimeout(() => setCopiedTicket(false), 2000);
              }
            };

            return (
              <div className="report-amc-ccrs-card">
                <div className="amc-ccrs-header">
                  <div className="amc-ccrs-badge">
                    <span className="amc-logo-dot"></span>
                    <span>AMC CCRS 311 OFFICIAL TICKET</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="amc-ticket-num">{ticketId}</span>
                    <button
                      type="button"
                      onClick={handleCopyTicketNum}
                      className="amc-copy-ticket-btn"
                      title={copiedTicket ? (t('ticket_copied') || 'Copied!') : (t('copy_ticket') || 'Copy Ticket #')}
                      style={{
                        background: copiedTicket ? '#059669' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white',
                        borderRadius: '6px',
                        padding: '3px 7px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {copiedTicket ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedTicket ? (t('ticket_copied') || 'Copied!') : (t('copy_ticket') || 'Copy')}</span>
                    </button>
                  </div>
                </div>

                <div className="amc-status-row">
                  <span className="amc-status-label">{t('amc_status_label') || 'AMC CCRS Status:'}</span>
                  <span className={`amc-status-pill ${report.status === 'resolved' ? 'status-resolved' : 'status-assigned'}`}>
                    {report.amc_status || (report.status === 'resolved' ? 'Resolved by AMC SWM' : 'Assigned to SWM Inspector')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)', margin: '6px 0 2px 0' }}>
                  <Clock size={12} style={{ color: '#FDBA74' }} />
                  <span>{t('filing_timestamp') || 'Filing Date & Time'}: <strong style={{ color: '#FFFFFF' }}>{formatDateTime(report.reported_at, lang) || 'Recorded'}</strong></span>
                </div>

                <p className="amc-dept-sub">
                  🏢 {report.amc_department || 'Solid Waste Management (SWM) • Health Dept'}
                </p>

                {report.rwa_partner && (
                  <p className="amc-rwa-partner-sub" style={{ fontSize: '11.5px', color: '#94A3B8', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🤝</span>
                    <span><strong>{t('rwa_partner_label') || 'Civic Partner'}:</strong> {report.rwa_partner}</span>
                  </p>
                )}

                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', margin: '8px 0 12px 0', lineHeight: 1.4 }}>
                  {t('amc_ccrs_explainer') || 'Directly synced with AMC Comprehensive Complaint Redressal System (CCRS) and escalated to the local Ward SWM Inspector.'}
                </p>

                <div className="amc-dispatch-actions">
                  <a
                    href={`https://api.whatsapp.com/send?phone=917567855303&text=${encodeURIComponent(`Hi AMC CCRS,\nI want to report a garbage issue via AmdavadSafai.\n\n📍 Ward: ${wardName}\n🏷️ Category: ${categoryLabel}\n⚠️ Severity: ${report.severity.toUpperCase()}\n📝 Description: ${description}\n🌐 Map GPS: https://maps.google.com/?q=${report.lat},${report.lng}\n🎫 Ticket Ref: ${ticketId}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="amc-whatsapp-btn"
                  >
                    <span>📲 Send to AMC WhatsApp (+91 75678 55303)</span>
                  </a>

                  <a
                    href="https://www.amccrs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="amc-portal-link"
                  >
                    <span>🌐 Track on amccrs.com</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Verification Transformation Slider if Resolved */}
          {report.status === 'resolved' && (
            <div className="report-resolved-transformation-wrap">
              <div className="transformation-header">
                <CheckCircle2 size={16} style={{ color: '#059669' }} />
                <span>{t('before_after_transformation') || 'Verified Transformation (Before ↔ After)'}</span>
              </div>
              <BeforeAfterSlider
                beforeImage={report.image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'}
                afterImage={report.verified_image_url || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80'}
                aspectRatio="16/10"
              />
            </div>
          )}

          {/* Official AMC Resolution Receipt Banner if Resolved */}
          {report.status === 'resolved' && (
            <div
              className="report-receipt-banner"
              style={{
                background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(16, 185, 129, 0.12) 100%)',
                border: '1px solid #86EFAC',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#16A34A',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#14532D' }}>
                    {lang === 'gu' ? 'સામુદાયિક સફાઈ રેકોર્ડ' : lang === 'hi' ? 'सामुदायिक सफाई रिकॉर्ड' : 'Community Cleanup Record'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>
                    {lang === 'gu' ? 'સમુદાય-ચકાસેલ સફાઈ નોંધ' : lang === 'hi' ? 'समुदाय-सत्यापित सफाई रिकॉर्ड' : 'Community-verified cleanup record'}
                  </div>
                </div>
              </div>
              {onViewReceipt && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewReceipt(report);
                  }}
                  style={{
                    background: '#16A34A',
                    color: 'white',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  <FileText size={14} />
                  <span>{lang === 'gu' ? 'રસીદ જુઓ' : lang === 'hi' ? 'रसीद देखें' : 'View Receipt'}</span>
                </button>
              )}
            </div>
          )}

          {/* Society WhatsApp Mobilization Action */}
          {(() => {
            const ticketId = getAmcTicketId(report);
            const societyMsg = `📢 *Urgent Civic Alert for ${wardName} Residents!*\n\nA garbage hotspot is pending action in our area:\n📍 *Ward:* ${wardName}\n⚠️ *Severity:* ${report.severity.toUpperCase()}\n🎫 *AMC CCRS Ticket:* ${ticketId}\n🏛️ *Ward Corporator:* ${corporatorName}\n\n👉 *Please click here to UPVOTE and push AMC to clear it:* ${window.location.origin}/#report=${report.id}\n\n🧹 AmdavadSafai — આપણું શહેર, આપણી જવાબદારી ❤️`;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(societyMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="society-rally-whatsapp-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#128C7E',
                    color: '#FFFFFF',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(18, 140, 126, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Users size={16} />
                  <span>📢 {t('rally_society_whatsapp') || 'Rally Society / RWA WhatsApp Group'}</span>
                </a>
              </div>
            );
          })()}

          {/* Community Actions (Verify / Dispute / Flag) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {report.status === 'resolved' ? (
              <button
                type="button"
                onClick={handleDispute}
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
                <AlertTriangle size={15} />
                <span>{t('dispute_false_resolution') || 'Dispute / Still Dirty ⚠️'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerify}
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
                <span>{t('verify_cleanup')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleFlag}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #64748B',
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Flag size={15} />
              <span>{t('flag_incorrect')}</span>
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
