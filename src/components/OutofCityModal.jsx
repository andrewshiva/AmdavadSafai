import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { X, MapPinOff, QrCode, Smartphone } from 'lucide-react';

export const OutofCityModal = ({ isOpen, onClose, distanceKm }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
            <MapPinOff size={22} />
            {t('outside_city_title')}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '24px 16px' }}>
          {distanceKm && (
            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', fontWeight: 600 }}>
              {Math.round(distanceKm)} km from Ahmedabad center
            </span>
          )}

          <p className="modal-description" style={{ fontSize: '13.5px', lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: 0 }}>
            {t('outside_city_desc')}
          </p>

          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1px solid #E2E8F0' }}>
            <QrCode size={160} style={{ color: '#0F172A' }} />
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Smartphone size={13} /> {t('scan_qr_hint')}
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', background: 'var(--color-bg-elevated)', padding: '10px 14px', borderRadius: '8px', width: '100%' }}>
            {t('outside_city_tip')}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-btn-primary" onClick={onClose} style={{ width: '100%', background: 'var(--color-primary)', color: 'white', border: 'none' }}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OutofCityModal;
