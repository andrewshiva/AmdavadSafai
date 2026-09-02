import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Play, Volume2, ShieldCheck, Sparkles, Download } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export const VideoModal = ({ isOpen, onClose }) => {
  const { t, lang } = useTranslation();

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
    <div className="modal-overlay video-modal-overlay" onClick={onClose}>
      <div
        className="modal-content video-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="video-modal-header">
          <div className="video-header-title-wrap">
            <div className="video-badge-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="video-modal-title">
                {lang === 'gu'
                  ? 'અમદાવાદ સફાઈ — પ્રોજેક્ટ વિહંગાવલોકન'
                  : 'Ahmedabad Safai — Platform Overview Video'}
              </h3>
              <span className="video-modal-sub">
                Civic Technology & Real-Time Municipal Accountability
              </span>
            </div>
          </div>

          <button
            type="button"
            className="video-modal-close-btn"
            onClick={onClose}
            aria-label="Close Video"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="video-player-frame">
          <video
            controls
            autoPlay
            playsInline
            preload="auto"
            className="intro-video-element"
            poster="/video_poster.jpg"
          >
            <source src="/intro_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Footer Info */}
        <div className="video-modal-footer">
          <div className="video-features-summary">
            <span className="feat-badge">
              <ShieldCheck size={14} className="text-emerald" />
              <span>AMC Solid Waste Management Integration</span>
            </span>
            <span className="feat-badge">
              <span>⚡ 48 Ward Real-Time Heatmaps</span>
            </span>
            <span className="feat-badge">
              <span>📍 GPS Geotagged Reporting</span>
            </span>
          </div>

          <a
            href="/intro_video.mp4"
            download="Ahmedabad_Safai_Introduction.mp4"
            className="video-download-btn"
          >
            <Download size={14} />
            <span>Download Video</span>
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VideoModal;
