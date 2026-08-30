import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { X, Award, Zap, ShieldCheck, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { getKarmaData, getCurrentBadge, getNextBadge, BADGE_TIERS } from '../utils/gamification';

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content karma-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', borderRadius: '16px', overflow: 'hidden' }}
      >
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
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.1)',
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
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 8px 20px rgba(16,185,129,0.3)',
                border: '2px solid rgba(255,255,255,0.2)'
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
                {t('citizen_karma')}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 4px 0' }}>
                {t(currentBadge.titleKey)}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#FCD34D'
                  }}
                >
                  ⚡ {karma.points} {t('karma_points')}
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
              <span>{t(currentBadge.titleKey)}</span>
              {nextBadge ? (
                <span>
                  {pointsToNext} {t('karma_points')} to {t(nextBadge.titleKey)}
                </span>
              ) : (
                <span style={{ color: '#FCD34D', fontWeight: 700 }}>Max Level Achieved 👑</span>
              )}
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
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
        </div>

        {/* Badges Grid */}
        <div style={{ padding: '20px', background: 'var(--color-bg-primary, #FFFFFF)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary, #0F172A)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={18} style={{ color: '#059669' }} />
            {t('my_badges')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {BADGE_TIERS.map((tier) => {
              const isUnlocked = karma.points >= tier.minPoints;
              return (
                <div
                  key={tier.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isUnlocked ? '1.5px solid #10B981' : '1px dashed #CBD5E1',
                    background: isUnlocked ? 'rgba(16,185,129,0.04)' : 'rgba(0,0,0,0.02)',
                    opacity: isUnlocked ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '24px', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                    {tier.icon}
                  </span>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: 'var(--color-text-primary, #0F172A)' }}>
                      {t(tier.titleKey)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {tier.minPoints} {t('karma_points')}
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
              <Zap size={14} /> How to Earn Citizen Points:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11.5px', color: '#334155' }}>
              <div>🧹 Report Garbage: <strong>+10 pts</strong></div>
              <div>📸 Verify Clean Spot: <strong>+25 pts</strong></div>
              <div>👥 Join Sunday Drive: <strong>+50 pts</strong></div>
              <div>📢 Organize Drive: <strong>+100 pts</strong></div>
            </div>
          </div>

          {/* Action CTA */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                if (onOpenEvents) onOpenEvents();
              }}
              style={{ flex: 1, padding: '10px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Heart size={16} />
              {t('cleanup_drives')}
            </button>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BadgesModal;
