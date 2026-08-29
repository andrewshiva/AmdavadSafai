import React, { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const GuideModal = ({ isOpen, onClose, t }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    fetch('/guide/sop_citizens.md')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load guide content');
        return res.text();
      })
      .then(text => {
        // Fix image paths for the markdown renderer so they resolve to public/guide/
        const fixedText = text.replace(/\]\(\.\//g, '](/guide/');
        setContent(fixedText);
        setError(null);
      })
      .catch(err => {
        console.error("Error loading SOP:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  // Animate in after mount
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`guide-panel-backdrop ${visible ? 'guide-panel-backdrop--visible' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`guide-panel ${visible ? 'guide-panel--open' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="guide-panel-header">
          <h2 className="guide-panel-title">
            <BookOpen size={20} style={{ color: 'var(--color-primary)' }} />
            {t ? t('help_guide_title') || 'Citizen SOP Guide' : 'Citizen SOP Guide'}
          </h2>
          <button className="guide-panel-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="guide-panel-body markdown-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
              Loading guide...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-danger)' }}>
              {error}
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};
