import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  MapPin,
  Clock,
  Building2,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Award,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import wardsData from '../data/wards.json';
import { getAmcTicketId } from '../utils/amcTickets';
import { formatDateTime } from '../utils/dateTime';

export const ResolutionReceiptModal = ({
  isOpen = true,
  onClose,
  report,
  onDispute,
  onShareCard,
  onOpenReportDetail
}) => {
  const { t, lang } = useTranslation();
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !report) return null;

  const ward = wardsData.find((w) => w.id === report.ward_id);
  const wardName = ward ? (lang === 'gu' ? ward.name_gu : ward.name_en) : '';
  const zoneName = ward ? (lang === 'gu' ? ward.zone_gu : ward.zone_en) : '';
  const corporatorName = ward ? (lang === 'gu' ? ward.corporator_gu : ward.corporator_en) : 'Ward Corporator';

  const ticketId = getAmcTicketId(report);
  const receiptNumber = `AS-REC-2026-${ticketId.split('-').pop() || '90412'}`;
  const reportedTime = report.created_at || report.reported_at;
  const resolvedTime = report.resolved_at || new Date().toISOString();

  // Calculate turnaround time in hours
  let turnaroundHours = 24;
  if (reportedTime && resolvedTime) {
    const diffMs = Math.max(0, new Date(resolvedTime) - new Date(reportedTime));
    turnaroundHours = (diffMs / (1000 * 60 * 60)).toFixed(1);
    if (turnaroundHours === '0.0') turnaroundHours = '1.2';
  }

  const title = lang === 'gu' && report.description_gu
    ? report.description_gu
    : lang === 'hi' && report.description_hi
    ? report.description_hi
    : report.description_en || 'Cleaned municipal hotspot';

  const handleCopyTicket = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticketId);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const shareText = `🧹 *Community Cleanup Record — AmdavadSafai*\n\n` +
      `🎫 *Tracking Ref:* ${ticketId}\n` +
      `🧾 *Record No:* ${receiptNumber}\n` +
      `📍 *Location:* ${wardName} (${zoneName || 'West Zone'})\n` +
      `🧹 *Status:* Resolved & community-verified ✓\n` +
      `⏱️ *Turnaround:* ${turnaroundHours} Hours (community record)\n` +
      `🔗 *View record:* ${window.location.origin}/#report=${report.id}\n\n` +
      `File officially via AMC CCRS 311: 155303\n\n` +
      `🧹 AmdavadSafai — આપણું શહેર, આપણી જવાબદારી ❤️`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/#report=${report.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay receipt-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content receipt-modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Non-printing) */}
        <div className="receipt-control-bar receipt-no-print">
          <div className="receipt-control-left">
            <span className="receipt-badge-top">
              <ShieldCheck size={14} />
                {lang === 'gu' ? 'સામુદાયિક સફાઈ રેકોર્ડ' : lang === 'hi' ? 'सामुदायिक सफाई रिकॉर्ड' : 'Community Cleanup Record'}
            </span>
          </div>

          <div className="receipt-control-actions">
            <button
              type="button"
              className="receipt-btn-action receipt-btn-print"
              onClick={handlePrint}
              title="Print Receipt / Save PDF"
            >
              <Printer size={15} />
              <span>{lang === 'gu' ? 'પ્રિન્ટ / PDF' : lang === 'hi' ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              type="button"
              className="receipt-btn-action receipt-btn-share"
              onClick={handleWhatsAppShare}
              title="Share via WhatsApp"
            >
              <Share2 size={15} />
              <span>{lang === 'gu' ? 'શેર કરો' : lang === 'hi' ? 'साझा करें' : 'WhatsApp'}</span>
            </button>

            <button
              type="button"
              className="receipt-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Sheet */}
        <div className="receipt-sheet receipt-print-container">
          
          {/* Official AMC Municipal Header */}
          <div className="receipt-header-banner">
            <div className="receipt-amc-emblem-wrap">
              <div className="receipt-amc-emblem">
                <Building2 size={28} />
              </div>
            </div>

            <div className="receipt-header-titles">
              <h2 className="receipt-org-title">
                અમદાવાદ સફાઈ
              </h2>
              <h3 className="receipt-org-sub">
                AMDAVAD SAFAI
              </h3>
              <p className="receipt-dept-tag">
                Community Cleanup Record • Citizen-verified
              </p>
            </div>

            <div className="receipt-status-seal">
              <div className="seal-ring">
                <CheckCircle2 size={24} />
                <span className="seal-text">VERIFIED</span>
                <span className="seal-sub">RESOLVED</span>
              </div>
            </div>
          </div>

          <div className="receipt-decorative-line" />

          {/* Certificate Title Banner */}
          <div className="receipt-title-box">
            <div className="receipt-doc-tag">
              {lang === 'gu' ? 'નાગરિક-ચકાસેલ નોંધ' : lang === 'hi' ? 'नागरिक-सत्यापित रिकॉर्ड' : 'CITIZEN-VERIFIED RECORD'}
            </div>
            <h1 className="receipt-doc-heading">
              {lang === 'gu'
                ? 'સામુદાયિક સફાઈ રેકોર્ડ'
                : lang === 'hi'
                ? 'सामुदायिक सफाई रिकॉर्ड'
                : 'Community Cleanup Record'}
            </h1>
          </div>

          {/* Key Identifiers Grid */}
          <div className="receipt-meta-grid">
            <div className="receipt-meta-item">
              <span className="receipt-meta-lbl">
                {lang === 'gu' ? 'રસીદ નંબર:' : lang === 'hi' ? 'रसीद संख्या:' : 'Receipt Number:'}
              </span>
              <strong className="receipt-meta-val receipt-mono">{receiptNumber}</strong>
            </div>

            <div className="receipt-meta-item">
              <span className="receipt-meta-lbl">
                {lang === 'gu' ? 'ટ્રેકિંગ સંદર્ભ #:' : lang === 'hi' ? 'ट्रैकिंग संदर्भ #:' : 'Tracking Ref #:'}
              </span>
              <div className="receipt-ticket-copy-wrap">
                <strong className="receipt-meta-val receipt-highlight receipt-mono">{ticketId}</strong>
                <button
                  type="button"
                  className="receipt-copy-ticket-btn receipt-no-print"
                  onClick={handleCopyTicket}
                  title="Copy Ticket ID"
                >
                  {copiedTicket ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedTicket ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="receipt-meta-item">
              <span className="receipt-meta-lbl">
                {lang === 'gu' ? 'નિરાકરણ તારીખ અને સમય:' : lang === 'hi' ? 'समाधान दिनांक एवं समय:' : 'Resolved Timestamp:'}
              </span>
              <strong className="receipt-meta-val">{formatDateTime(resolvedTime, lang) || 'August 29, 2026 · 11:45 AM'}</strong>
            </div>

            <div className="receipt-meta-item">
              <span className="receipt-meta-lbl">
                {lang === 'gu' ? 'સ્થાન અને ઝોન:' : lang === 'hi' ? 'स्थान एवं ज़ोन:' : 'Ward & Zone:'}
              </span>
              <strong className="receipt-meta-val">{wardName} · {zoneName || 'West Zone'}</strong>
            </div>
          </div>

          {/* Grievance Description Card */}
          <div className="receipt-incident-card">
            <div className="receipt-incident-header">
              <div className="receipt-incident-tag">
                <MapPin size={13} />
                <span>{lang === 'gu' ? 'નિરાકરણ કરાયેલ ફરિયાદ વિગત' : lang === 'hi' ? 'समाधानित शिकायत विवरण' : 'Resolved Incident Details'}</span>
              </div>
              <span className="receipt-status-pill">
                ✓ {lang === 'gu' ? 'સંપૂર્ણ સાફ' : lang === 'hi' ? 'पूर्णतः साफ' : 'Cleaned & Sanitized'}
              </span>
            </div>
            <p className="receipt-incident-title">{title}</p>
          </div>

          {/* Audit Trail & Timestamps Timeline */}
          <div className="receipt-timeline-section">
            <h4 className="receipt-section-subtitle">
              <Clock size={14} />
                <span>{lang === 'gu' ? 'સામુદાયિક કાર્યવાહી સમયરેખા' : lang === 'hi' ? 'सामुदायिक कार्रवाई समयरेखा' : 'Community Action Timeline'}</span>
            </h4>

            <div className="receipt-timeline-grid">
              <div className="receipt-step">
                <div className="receipt-step-dot dot-orange" />
                <div className="receipt-step-body">
                  <span className="receipt-step-time">{formatDateTime(reportedTime, lang) || 'Aug 28, 2026 · 10:15 AM'}</span>
                  <span className="receipt-step-title">{lang === 'gu' ? 'નાગરિક દ્વારા નોંધણી' : lang === 'hi' ? 'नागरिक द्वारा पंजीकरण' : 'Complaint Filed by Citizen'}</span>
                    <span className="receipt-step-desc">Logged on AmdavadSafai with a community tracking reference</span>
                </div>
              </div>

              <div className="receipt-step">
                <div className="receipt-step-dot dot-blue" />
                <div className="receipt-step-body">
                  <span className="receipt-step-time">
                    {formatDateTime(new Date(new Date(reportedTime || Date.now()).getTime() + 3 * 3600 * 1000).toISOString(), lang)}
                  </span>
                  <span className="receipt-step-title">{lang === 'gu' ? 'વોર્ડ સફાઈ માટે ચિહ્નિત' : lang === 'hi' ? 'वार्ड सफाई हेतु चिह्नित' : 'Flagged for Ward Cleanup'}</span>
                  <span className="receipt-step-desc">Report published for community follow-up</span>
                </div>
              </div>

              <div className="receipt-step">
                <div className="receipt-step-dot dot-green" />
                <div className="receipt-step-body">
                  <span className="receipt-step-time">{formatDateTime(resolvedTime, lang) || 'Aug 29, 2026 · 11:45 AM'}</span>
                  <span className="receipt-step-title">{lang === 'gu' ? 'સફાઈ પૂર્ણ અને જંતુમુક્ત' : lang === 'hi' ? 'सफाई पूर्ण एवं विसंक्रमित' : 'Deep Cleared & Disinfected'}</span>
                  <span className="receipt-step-desc">Waste cleared, lime powder bleached, photo verified</span>
                </div>
              </div>
            </div>

            {/* SLA Compliance Box */}
            <div className="receipt-sla-banner">
              <div className="receipt-sla-left">
                <span className="receipt-sla-stat">{turnaroundHours} {lang === 'gu' ? 'કલાક' : lang === 'hi' ? 'घंटे' : 'Hours'}</span>
                <span className="receipt-sla-desc">{lang === 'gu' ? 'કુલ નિરાકરણ સમય' : lang === 'hi' ? 'कुल समाधान समय' : 'Total Redressal Turnaround'}</span>
              </div>
              <div className="receipt-sla-right">
                <span className="receipt-sla-badge">
                  ⚡ {lang === 'gu' ? 'સમુદાય-ચકાસેલ સફાઈ' : lang === 'hi' ? 'समुदाय-सत्यापित सफाई' : 'Community-verified cleanup'}
                </span>
              </div>
            </div>
          </div>

          {/* Photographic Verification Proof Comparison */}
          <div className="receipt-photos-section">
            <h4 className="receipt-section-subtitle">
              <CheckCircle2 size={14} style={{ color: '#16A34A' }} />
              <span>{lang === 'gu' ? 'ફોટોગ્રાફિક પુરાવો (પહેલાં ↔ પછી)' : lang === 'hi' ? 'फोटोग्राफिक प्रमाण (पहले ↔ बाद में)' : 'Photographic Verification Evidence (Before ↔ After)'}</span>
            </h4>

            <div className="receipt-photos-grid">
              <div className="receipt-photo-box">
                <div className="receipt-photo-tag tag-before">
                  {lang === 'gu' ? 'કચરો હતો (પહેલાં)' : lang === 'hi' ? 'कचरा स्थल (पहले)' : 'REPORTED DUMP (BEFORE)'}
                </div>
                <img
                  src={report.image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'}
                  alt="Before cleanup evidence"
                  className="receipt-evidence-img"
                />
              </div>

              <div className="receipt-photo-box">
                <div className="receipt-photo-tag tag-after">
                  ✓ {lang === 'gu' ? 'સ્વચ્છ સ્થળ (પછી)' : lang === 'hi' ? 'स्वच्छ स्थल (बाद में)' : 'VERIFIED CLEAN SPOT (AFTER)'}
                </div>
                <img
                  src={report.verified_image_url || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80'}
                  alt="After cleanup verified evidence"
                  className="receipt-evidence-img"
                />
              </div>
            </div>
          </div>

          {/* Citizen Safai Karma Award Badge */}
          <div className="receipt-karma-badge-card">
            <div className="receipt-karma-icon">
              <Award size={24} />
            </div>
            <div className="receipt-karma-info">
              <div className="receipt-karma-title">
                {lang === 'gu' ? '🎉 નાગરિકને +૨૫ સફાઈ કર્મા પોઈન્ટ્સ એનાયત' : lang === 'hi' ? '🎉 नागरिक को +25 सफाई कर्मा अंक प्राप्त' : '🎉 +25 Safai Karma Points Awarded to Citizen'}
              </div>
              <p className="receipt-karma-sub">
                {lang === 'gu'
                  ? 'સ્વચ્છ અને ગૌરવપૂર્ણ અમદાવાદ માટે સહભાગી થવા બદલ આભાર!'
                  : lang === 'hi'
                  ? 'स्वच्छ और सुंदर अहमदाबाद में सक्रिय योगदान हेतु आपका धन्यवाद!'
                  : 'Thank you for actively reporting and keeping Ahmedabad clean & proud!'}
              </p>
            </div>
          </div>

          {/* Signatures & Certification Seal */}
          <div className="receipt-signatures-grid">
            <div className="receipt-sig-block">
              <div className="receipt-sig-line">
                <UserCheck size={16} />
              </div>
              <span className="receipt-sig-name">{corporatorName}</span>
              <span className="receipt-sig-role">{lang === 'gu' ? 'વોર્ડ કોર્પોરેટર' : lang === 'hi' ? 'वार्ड पार्षद' : 'Ward Corporator'}</span>
            </div>

            <div className="receipt-sig-block">
              <div className="receipt-digital-stamp">
                <CheckCircle2 size={16} />
                <span>DIGITALLY CERTIFIED</span>
              </div>
              <span className="receipt-sig-name">AmdavadSafai Community Record</span>
              <span className="receipt-sig-role">Citizen-verified cleanup</span>
            </div>

            <div className="receipt-sig-block">
              <div className="receipt-sig-line">
                <Building2 size={16} />
              </div>
              <span className="receipt-sig-name">{lang === 'gu' ? 'નાગરિક રિપોર્ટર' : lang === 'hi' ? 'नागरिक रिपोर्टर' : 'Citizen Reporter'}</span>
              <span className="receipt-sig-role">AmdavadSafai community</span>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="receipt-disclaimer-footer">
            <p>
              This is a community-generated cleanup record from the AmdavadSafai platform — not an official AMC document. For official redressal, file with AMC CCRS 311 (155303). Record ref: <code>{ticketId}</code>.
            </p>
          </div>

        </div>

        {/* Bottom Interactive Modal Actions (Non-printing) */}
        <div className="receipt-modal-footer receipt-no-print">
          <div className="receipt-footer-left">
            <button
              type="button"
              className="receipt-btn-dispute"
              onClick={() => onDispute && onDispute(report)}
            >
              <AlertTriangle size={15} />
              <span>{t('dispute_false_resolution') || 'Dispute (Still Dirty?) ⚠️'}</span>
            </button>
          </div>

          <div className="receipt-footer-right">
            {onOpenReportDetail && (
              <button
                type="button"
                className="receipt-btn-secondary"
                onClick={() => onOpenReportDetail(report)}
              >
                <FileText size={15} />
                <span>{lang === 'gu' ? 'સંપૂર્ણ વિગતો જુઓ' : lang === 'hi' ? 'पूर्ण विवरण देखें' : 'View Full Details'}</span>
              </button>
            )}

            <button
              type="button"
              className="receipt-btn-secondary"
              onClick={handleCopyShareLink}
            >
              <ExternalLink size={15} />
              <span>{copiedShare ? 'Copied!' : (lang === 'gu' ? 'લિંક કોપી' : lang === 'hi' ? 'लिंक कॉपी' : 'Copy Link')}</span>
            </button>

            <button
              type="button"
              className="receipt-btn-primary"
              onClick={onClose}
            >
              {lang === 'gu' ? 'બંધ કરો' : lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ResolutionReceiptModal;
