import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  aspectRatio = '16/10',
  className = ''
}) => {
  const { t } = useTranslation();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const position = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(position);
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleClick = (e) => {
    handleMove(e.clientX);
  };

  const effectiveBeforeLabel = beforeLabel || t('before_label') || 'Before';
  const effectiveAfterLabel = afterLabel || t('after_label') || 'After (Cleaned)';

  return (
    <div className={`before-after-container ${className}`}>
      <div
        ref={containerRef}
        className="before-after-wrapper"
        style={{ aspectRatio }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onClick={handleClick}
      >
        {/* AFTER Image (Full background) */}
        <img
          src={afterImage}
          alt={effectiveAfterLabel}
          className="before-after-img after-img"
          draggable={false}
        />

        {/* BEFORE Image (Clipped overlay) */}
        <div
          className="before-img-clip"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img
            src={beforeImage}
            alt={effectiveBeforeLabel}
            className="before-after-img before-img"
            draggable={false}
          />
        </div>

        {/* Divider Line */}
        <div
          className="slider-divider"
          style={{ left: `${sliderPosition}%` }}
        >
          <div
            className="slider-handle"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <ArrowLeftRight size={14} />
          </div>
        </div>

        {/* Labels */}
        <div className="slider-badge badge-before">
          <AlertCircle size={12} style={{ marginRight: '4px' }} />
          <span>{effectiveBeforeLabel}</span>
        </div>

        <div className="slider-badge badge-after">
          <Sparkles size={12} style={{ marginRight: '4px', color: '#10B981' }} />
          <span>{effectiveAfterLabel}</span>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="slider-quick-controls">
        <button
          type="button"
          className={`slider-btn ${sliderPosition === 100 ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setSliderPosition(100); }}
        >
          🔍 {effectiveBeforeLabel}
        </button>
        <button
          type="button"
          className={`slider-btn ${sliderPosition === 50 ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setSliderPosition(50); }}
        >
          ⚖️ 50/50
        </button>
        <button
          type="button"
          className={`slider-btn ${sliderPosition === 0 ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setSliderPosition(0); }}
        >
          ✨ {effectiveAfterLabel}
        </button>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
