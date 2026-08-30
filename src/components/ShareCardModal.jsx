import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { X, Share2, Download, Copy, Check, Sparkles, MessageCircle, Heart } from 'lucide-react';

export const ShareCardModal = ({ isOpen, onClose, data }) => {
  const { t, lang } = useTranslation();
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const reportOrEvent = data || {
    type: 'report',
    title: 'Garbage hotspot reported on Maninagar Canal Road',
    location: 'Maninagar, Ahmedabad',
    status: 'unresolved',
    severity: 'severe'
  };

  const rawLocation = reportOrEvent.location || reportOrEvent.location_name || 'Ahmedabad, Gujarat';
  const cleanLocation = rawLocation.replace(/\s*\(Ward\s+ward_\d+\)/gi, '').trim();
  const isEvent = reportOrEvent.type === 'event';
  const ticketRef = reportOrEvent.ticketId ? `🎫 *AMC Ticket:* ${reportOrEvent.ticketId}\n` : '';

  const appUrl = 'https://amdavad-safai-9i9g.vercel.app';
  const shareText = isEvent
    ? `*AmdavadSafai — Sunday Cleanup Drive!* 🧹\n\n📍 *Location:* ${cleanLocation}\n⏰ *Time:* ${reportOrEvent.date_time || 'Sunday 7:00 AM'}\n👥 *Volunteers Joined:* ${reportOrEvent.volunteers || 24}+\n\n🤝 *આપણું શહેર, આપણી જવાબદારી*\n👉 *Join & Track:* ${appUrl}`
    : `*AmdavadSafai — Cleanliness Action in Ahmedabad!* 🧹\n\n📍 *Location:* ${cleanLocation}\n${ticketRef}⚠️ *Status:* ${reportOrEvent.status === 'resolved' ? '✅ Resolved & Cleaned' : '⏳ Pending AMC Action'}\n\n🤝 *આપણું શહેર, આપણી જવાબદારી*\n👉 *Track live on map:* ${appUrl}`;

  // Draw Canvas Card
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 640;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Ahmedabad Civic Navy & Emerald)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.5, '#1E293B');
    bgGrad.addColorStop(1, '#064E3B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative top accent bar
    const barGrad = ctx.createLinearGradient(0, 0, width, 0);
    barGrad.addColorStop(0, '#10B981');
    barGrad.addColorStop(0.5, '#F59E0B');
    barGrad.addColorStop(1, '#0284C7');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, width, 12);

    // App Header & Logo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('🧹 AmdavadSafai', 40, 70);

    ctx.fillStyle = '#34D399';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('આપણું શહેર, આપણી જવાબદારી • Ahmedabad Clean Mission', 40, 100);

    // Inner White Card container
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.roundRect(40, 130, width - 80, 520, 20);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Badge Banner inside Card
    const isEvent = reportOrEvent.type === 'event';
    ctx.fillStyle = isEvent ? '#059669' : reportOrEvent.status === 'resolved' ? '#16A34A' : '#DC2626';
    ctx.beginPath();
    ctx.roundRect(70, 160, isEvent ? 240 : 180, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(isEvent ? '📅 SUNDAY CLEANUP DRIVE' : reportOrEvent.status === 'resolved' ? '✅ VERIFIED CLEAN SPOT' : '⚠️ CIVIC ACTION REPORT', 85, 184);

    // Location & Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px sans-serif';
    const rawTitle = reportOrEvent.title || reportOrEvent.description_en || 'Cleanliness Action in Ahmedabad';
    const words = rawTitle.split(' ');
    let line = '';
    let y = 240;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 180 && n > 0) {
        ctx.fillText(line, 70, y);
        line = words[n] + ' ';
        y += 32;
        if (y > 340) break;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 70, y);

    // Landmark Info Box
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(70, y + 20, width - 140, 140, 14);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('📍 LOCATION / WARD', 90, y + 55);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(cleanLocation, 90, y + 85);

    ctx.fillStyle = '#059669';
    ctx.font = '600 14px sans-serif';
    if (isEvent) {
      ctx.fillText(`⏰ ${reportOrEvent.date_time || 'Sunday 7:00 AM'} • 👥 ${reportOrEvent.volunteers || 24} Joined`, 90, y + 125);
    } else {
      ctx.fillText(`❤️ Tracked on live municipal map • Upvoted by citizens`, 90, y + 125);
    }

    // Impact / Slogan quote
    ctx.fillStyle = '#0F172A';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText('"Don\'t just report the problem. Help solve it."', 70, 610);

    // Footer Web Link Bar
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('🌐 amdavad-safai-9i9g.vercel.app', 40, 720);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Join the citizen movement to keep Amdavad spotless!', 40, 745);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawCard, 100);
    }
  }, [isOpen, reportOrEvent]);

  if (!isOpen) return null;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `AmdavadSafai_Card_${Date.now()}.png`;
      link.href = imageUri;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content share-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px', borderRadius: '16px', overflow: 'hidden' }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            padding: '16px 20px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} style={{ color: '#34D399' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
              {t('share_card')}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px', background: 'var(--color-bg-primary, #FFFFFF)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px 0', textAlign: 'center' }}>
            {t('share_card_desc')}
          </p>

          {/* Canvas Card Preview */}
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #E2E8F0'
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

          {/* Share Action Buttons */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
            <button
              onClick={handleShareWhatsApp}
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37,211,102,0.25)'
              }}
            >
              <MessageCircle size={18} />
              {t('share_on_whatsapp')}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={handleCopyText}
                style={{
                  background: 'rgba(37, 211, 102, 0.12)',
                  color: '#15803D',
                  border: '1px solid rgba(37, 211, 102, 0.35)',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {copiedText ? <Check size={15} style={{ color: '#16A34A' }} /> : <Copy size={15} />}
                {copiedText ? (t('ticket_copied') || 'Text Copied!') : (t('copy_message') || 'Copy Message')}
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={15} />
                {t('download_card')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShareCardModal;
