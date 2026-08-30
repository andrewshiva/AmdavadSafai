import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { X, Award, Zap, Heart, Flame, ShieldCheck, Clock, Smartphone, CheckCircle2, History } from 'lucide-react';
import { getKarmaData, getCurrentBadge, getNextBadge, BADGE_TIERS, KARMA_ACTIONS } from '../utils/gamification';

export const BadgesModal = ({ isOpen, onClose, onOpenEvents }) => {
  const { t, lang } = useTranslation();
  const [karma, setKarma] = useState(getKarmaData());

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) setKarma(e.detail);
    };
    window.addEventListener('amdavad-safai-karma-updated', handleUpdate);
    return () => window.removeEventListener('amdavad-safai-karma-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setKarma(getKarmaData());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBadge = getCurrentBadge(karma.points);
  const nextBadge = getNextBadge(karma.points);
  const pointsToNext = nextBadge ? nextBadge.minPoints - karma.points : 0;
  const progressPct = nextBadge
    ? Math.min(100, Math.round(((karma.points - currentBadge.minPoints) / (nextBadge.minPoints - currentBadge.minPoints)) * 100))
    : 100;

  const badgeTitle = lang === 'gu'
    ? currentBadge.titleGu
    : lang === 'hi'
    ? currentBadge.titleHi || currentBadge.titleEn
    : currentBadge.titleEn;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content karma-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Header Gradient Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            padding: '24px',
            color: '#FFFFFF',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                border: '2px solid rgba(255,255,255,0.25)',
                flexShrink: 0
              }}
            >
              {currentBadge.icon}
            </div>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#34D399',
                  fontWeight: 700
                }}
              >
                {t('citizen_karma') || 'Citizen Karma Rank'}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 6px 0' }}>
                {badgeTitle}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#FCD34D'
                  }}
                >
                  ⚡ {karma.points} {t('karma_points') || 'pts'}
                </span>

                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#FCA5A5',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Flame size={13} style={{ color: '#EF4444' }} />
                  <span>{karma.streakDays || 1} Day Streak</span>
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
              <span>{badgeTitle}</span>
              {nextBadge ? (
                <span>
                  {pointsToNext} {t('karma_points') || 'pts'} to {lang === 'gu' ? nextBadge.titleGu : nextBadge.titleEn}
                </span>
              ) : (
                <span style={{ color: '#FCD34D', fontWeight: 700 }}>Highest Honor Achieved 👑</span>
              )}
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981, #F59E0B)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          {/* Device & Citizen ID Tag */}
          <div
            style={{
              marginTop: '16px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#94A3B8'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={13} style={{ color: '#38BDF8' }} />
              <span>Citizen Device: <strong>{karma.deviceId || 'amd_device'}</strong></span>
            </span>
            <span style={{ color: '#34D399', fontWeight: 600 }}>
              ✓ {karma.totalVisits || 1} Visits Active
            </span>
          </div>

        </div>

        {/* Badges Grid & Activities Body */}
        <div style={{ padding: '20px', background: 'var(--color-bg-card, #FFFFFF)', maxHeight: '60vh', overflowY: 'auto' }}>
          
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={18} style={{ color: '#059669' }} />
            {t('my_badges') || 'Civic Badge Tiers'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            {BADGE_TIERS.map((tier) => {
              const isUnlocked = karma.points >= tier.minPoints;
              const title = lang === 'gu' ? tier.titleGu : tier.titleEn;
              return (
                <div
                  key={tier.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isUnlocked ? '1.5px solid #10B981' : '1px dashed var(--glass-border, #CBD5E1)',
                    background: isUnlocked ? 'rgba(16,185,129,0.05)' : 'var(--color-bg-elevated, #F8FAFC)',
                    opacity: isUnlocked ? 1 : 0.65,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '24px', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                    {tier.icon}
                  </span>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', color: 'var(--color-text-primary)' }}>
                      {title}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {tier.minPoints} {t('karma_points') || 'pts'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Points Guide */}
          <div
            style={{
              marginTop: '18px',
              padding: '14px',
              borderRadius: '10px',
              background: 'rgba(2, 132, 199, 0.05)',
              border: '1px solid rgba(2, 132, 199, 0.15)'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Zap size={14} /> How Citizen Karma is Evaluated:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
              <div>📅 Daily App Check-in: <strong>+10 pts</strong></div>
              <div>🔥 7-Day Streak Bonus: <strong>+50 pts</strong></div>
              <div>🧹 Report Garbage: <strong>+15 pts</strong></div>
              <div>📸 Verify Clean Spot: <strong>+30 pts</strong></div>
              <div>👥 Join Sunday Drive: <strong>+50 pts</strong></div>
              <div>📢 Organize Drive: <strong>+100 pts</strong></div>
            </div>
          </div>

          {/* Recent Karma Activity History Ledger */}
          {karma.history && karma.history.length > 0 && (
            <div style={{ marginTop: '18px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} style={{ color: 'var(--color-primary)' }} />
                <span>Recent Activity Ledger ({karma.history.length})</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {karma.history.slice(0, 5).map((item) => (
                  <div
                    key={item.id || item.timestamp}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {item.description || item.action}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '12px', flexShrink: 0 }}>
                      +{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              className="modal-btn-primary"
              onClick={() => {
                onClose();
                if (onOpenEvents) onOpenEvents();
              }}
              style={{ flex: 1, padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Heart size={16} />
              <span>{t('cleanup_drives') || 'Join Sunday Drives'}</span>
            </button>
            <button
              className="modal-btn-secondary"
              onClick={onClose}
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              {t('close') || 'Close'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BadgesModal;
