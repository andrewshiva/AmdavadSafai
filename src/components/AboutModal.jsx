import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  Sparkles,
  Heart,
  MapPin,
  Building2,
  Calendar,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  Code2,
  CheckCircle2,
  Award,
  Zap,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export const AboutModal = ({
  isOpen,
  onClose,
  onOpenReport,
  onOpenEvents,
  onOpenCleanedSpots,
  onOpenRWA
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay about-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-content about-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Header */}
        <div className="about-hero-header">
          <div className="about-hero-badge-row">
            <span className="about-pill-tag">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Amdavad Civic Tech</span>
            </span>
            <span className="about-version-tag">v1.1.0 · Open Source</span>
          </div>

          <div className="about-header-main">
            <div>
              <h2 id="about-modal-title" className="about-header-title">
                {t('about_title') || 'About AmdavadSafai'}
              </h2>
              <p className="about-header-slogan">
                {t('about_mission_slogan') || 'આપણું શહેર, આપણી જવાબદારી ❤️'}
              </p>
            </div>

            <button
              type="button"
              className="about-close-btn"
              onClick={onClose}
              aria-label={t('close') || 'Close'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Subtitle & Mission Quote */}
          <div className="about-quote-box">
            <p className="about-quote-text">
              {t('about_mission_quote') || '“Don’t just report the problem. Help solve it.”'}
            </p>
          </div>

          {/* Navigation Tab Bar */}
          <div className="about-tab-bar" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'overview'}
              className={`about-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Heart size={15} />
              <span>{t('about_tab_overview') || 'Mission & Workflow'}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'features'}
              className={`about-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <Zap size={15} />
              <span>{t('about_tab_features') || 'Innovations'}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'governance'}
              className={`about-tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
              onClick={() => setActiveTab('governance')}
            >
              <Building2 size={15} />
              <span>{t('about_tab_governance') || 'Governance'}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tech'}
              className={`about-tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
              onClick={() => setActiveTab('tech')}
            >
              <Code2 size={15} />
              <span>{t('about_tab_tech') || 'Open Source'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Tab Body */}
        <div className="about-modal-body">
          {/* TAB 1: OVERVIEW & MISSION */}
          {activeTab === 'overview' && (
            <div className="about-tab-section">
              {/* Mission Summary Card */}
              <div className="about-card highlight-card">
                <div className="about-card-header">
                  <div className="about-card-icon-wrap emerald">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="about-card-title">{t('about_story_title') || 'The AmdavadSafai Mission'}</h3>
                    <span className="about-card-badge">Ahmedabad · 27 Wards · 7 Zones</span>
                  </div>
                </div>
                <p className="about-card-text">
                  {t('about_story_desc') ||
                    'AmdavadSafai (અમદાવાદ સફાઈ) is an open civic-tech platform bridging citizens, community volunteers, Resident Welfare Associations (RWAs), and the Ahmedabad Municipal Corporation (AMC). We believe true urban cleanliness requires radical transparency, localized accountability, and citizen action.'}
                </p>

                {/* Key Metrics Stats Pills */}
                <div className="about-metrics-grid">
                  <div className="about-metric-pill">
                    <span className="metric-val">27</span>
                    <span className="metric-lbl">Wards Mapped</span>
                  </div>
                  <div className="about-metric-pill">
                    <span className="metric-val">7</span>
                    <span className="metric-lbl">Municipal Zones</span>
                  </div>
                  <div className="about-metric-pill">
                    <span className="metric-val">311</span>
                    <span className="metric-lbl">AMC CCRS Bridge</span>
                  </div>
                  <div className="about-metric-pill">
                    <span className="metric-val">100%</span>
                    <span className="metric-lbl">Citizen Driven</span>
                  </div>
                </div>
              </div>

              {/* 4-Step Action Loop */}
              <div className="about-section-heading">
                <h4>{t('about_how_it_works') || 'How It Works (4-Step Action Loop)'}</h4>
              </div>

              <div className="about-steps-grid">
                <div className="about-step-card">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h5>{t('about_step1_title') || '1. Pin & Categorize'}</h5>
                    <p>{t('about_step1_desc') || 'Citizens take a photo of a waste dump and tap the interactive map. The app auto-detects the AMC ward and GPS coordinates.'}</p>
                  </div>
                </div>

                <div className="about-step-card">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h5>{t('about_step2_title') || '2. Public Accountability'}</h5>
                    <p>{t('about_step2_desc') || 'The complaint is assigned an official AMC CCRS 311 tracking ticket and linked to the local Ward Corporator, MLA, and MP.'}</p>
                  </div>
                </div>

                <div className="about-step-card">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h5>{t('about_step3_title') || '3. Community Action'}</h5>
                    <p>{t('about_step3_desc') || 'Citizens can join or host Sunday Community Cleanup Drives (સફાઈ અભિયાન) to resolve persistent neighborhood blackspots.'}</p>
                  </div>
                </div>

                <div className="about-step-card">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h5>{t('about_step4_title') || '4. Verify & Transform'}</h5>
                    <p>{t('about_step4_desc') || 'Upload after-cleanup photos to create Before ↔ After sliders, earn Citizen Karma badges, and update the ward cleanliness score.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORE INNOVATIONS */}
          {activeTab === 'features' && (
            <div className="about-tab-section">
              <div className="about-features-list">
                {/* Feature 1: GeoJSON Map */}
                <div className="about-feature-item">
                  <div className="feature-icon indigo">
                    <MapPin size={20} />
                  </div>
                  <div className="feature-info">
                    <h4>Precision 27-Ward GeoJSON Overlays</h4>
                    <p>Dynamic cleanliness score heatmap (0-100) reflecting real-time unresolved complaint ratios and 48h+ overdue escalation alerts.</p>
                  </div>
                </div>

                {/* Feature 2: Before After Verification */}
                <div className="about-feature-item">
                  <div className="feature-icon emerald">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="feature-info">
                    <h4>Before ↔ After Transformation Sliders</h4>
                    <p>Transparent community photo verification ensuring municipal cleanups are genuinely executed and verifiable by every resident.</p>
                  </div>
                </div>

                {/* Feature 3: Citizen Karma */}
                <div className="about-feature-item">
                  <div className="feature-icon amber">
                    <Award size={20} />
                  </div>
                  <div className="feature-info">
                    <h4>Citizen Karma & Streak Gamification</h4>
                    <p>Earn points for reporting (+15), verifying (+30), and joining drives (+50). Unlock badges from Safai Sevak to Eco Champion.</p>
                  </div>
                </div>

                {/* Feature 4: Sunday Cleanups */}
                <div className="about-feature-item">
                  <div className="feature-icon teal">
                    <Calendar size={20} />
                  </div>
                  <div className="feature-info">
                    <h4>Sunday Community Cleanup Drives (સફાઈ અભિયાન)</h4>
                    <p>Organize and RSVP to neighborhood weekend drives with supply checklists, meeting points, and live volunteer headcount.</p>
                  </div>
                </div>

                {/* Feature 5: RWA Dashboard */}
                <div className="about-feature-item">
                  <div className="feature-icon violet">
                    <Building2 size={20} />
                  </div>
                  <div className="feature-info">
                    <h4>Ward RWA Pilot & Scorecard Hub</h4>
                    <p>Dedicated portal for Resident Welfare Associations with oldest dump trackers, corporator scorecards, and printable PDF/dossiers.</p>
                  </div>
                </div>

                {/* Feature 6: Viral Social Share Cards */}
                <div className="about-feature-item">
                  <div className="feature-icon rose">
                    <Share2 size={20} />
                  </div>
                  <div className="feature-info">
                    <h4>Branded WhatsApp & Instagram Share Cards</h4>
                    <p>Instant HTML5 Canvas-rendered social cards formatted for WhatsApp Status and Instagram Stories to mobilize neighbors.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNANCE & HELPLINES */}
          {activeTab === 'governance' && (
            <div className="about-tab-section">
              <div className="about-card highlight-card">
                <div className="about-card-header">
                  <div className="about-card-icon-wrap indigo">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="about-card-title">{t('about_helplines_title') || 'Official AMC Helplines & Escalation'}</h3>
                    <span className="about-card-badge">Ahmedabad Municipal Corporation</span>
                  </div>
                </div>

                {/* Helpline Directory */}
                <div className="about-helpline-grid">
                  <a
                    href="tel:155303"
                    className="about-helpline-box"
                    title="Call AMC CCRS 311 Helpline"
                  >
                    <div className="helpline-icon-tag phone">
                      <PhoneCall size={16} />
                    </div>
                    <div className="helpline-meta">
                      <span className="helpline-title">{t('about_amc_ccrs_phone') || 'AMC CCRS 311 Call Center'}</span>
                      <span className="helpline-number">155303 (Toll Free)</span>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/917567855303?text=Hi%20AMC%20Safai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-helpline-box"
                    title="Chat with AMC WhatsApp Bot"
                  >
                    <div className="helpline-icon-tag whatsapp">
                      <MessageSquare size={16} />
                    </div>
                    <div className="helpline-meta">
                      <span className="helpline-title">{t('about_amc_whatsapp_bot') || 'AMC WhatsApp Chatbot'}</span>
                      <span className="helpline-number">+91 75678 55303</span>
                    </div>
                  </a>

                  <a
                    href="tel:07925391811"
                    className="about-helpline-box"
                    title="Call AMC Central Control Room"
                  >
                    <div className="helpline-icon-tag alert">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="helpline-meta">
                      <span className="helpline-title">{t('about_amc_control_room') || 'AMC Control Room (Danapith)'}</span>
                      <span className="helpline-number">079-25391811</span>
                    </div>
                  </a>

                  <a
                    href="https://ahmedabadcity.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-helpline-box"
                    title="Visit Official AMC Portal"
                  >
                    <div className="helpline-icon-tag portal">
                      <ExternalLink size={16} />
                    </div>
                    <div className="helpline-meta">
                      <span className="helpline-title">AMC Official Portal</span>
                      <span className="helpline-number">ahmedabadcity.gov.in</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Representative Accountability Hierarchy */}
              <div className="about-section-heading">
                <h4>Elected Representative Governance Structure</h4>
              </div>

              <div className="about-reps-hierarchy">
                <div className="rep-level-card">
                  <div className="rep-badge corporator">Ward Level</div>
                  <h5>Municipal Corporators (AMC)</h5>
                  <p>Directly responsible for sanitation workers, daily SWM tipper vehicle routes, and neighborhood dustbin clearance.</p>
                </div>

                <div className="rep-level-card">
                  <div className="rep-badge mla">Constituency Level</div>
                  <h5>Vidhan Sabha MLA (Gujarat Assembly)</h5>
                  <p>Oversees municipal infrastructure grants, solid waste processing plants (Pirana bio-mining), and legislative funding.</p>
                </div>

                <div className="rep-level-card">
                  <div className="rep-badge mp">Parliamentary Level</div>
                  <h5>Lok Sabha MP (Member of Parliament)</h5>
                  <p>Coordinates Central Swachh Bharat Mission (SBM-Urban 2.0) funding, national cleanliness rankings, and green city targets.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TECH & OPEN SOURCE */}
          {activeTab === 'tech' && (
            <div className="about-tab-section">
              <div className="about-card highlight-card">
                <div className="about-card-header">
                  <div className="about-card-icon-wrap emerald">
                    <Code2 size={18} />
                  </div>
                  <div>
                    <h3 className="about-card-title">{t('about_open_source_title') || '100% Open Source & Privacy-First'}</h3>
                    <span className="about-card-badge">MIT Licensed Civic Architecture</span>
                  </div>
                </div>

                <p className="about-card-text">
                  {t('about_open_source_desc') ||
                    'Built with privacy in mind. No user tracking, no phone number mandate, and no commercial ads. Anonymous citizen device identity is securely hashed on your local device.'}
                </p>

                {/* Tech Stack Pills */}
                <div className="about-tech-stack-grid">
                  <div className="tech-badge">⚡ React 18 & Vite</div>
                  <div className="tech-badge">🗺️ MapLibre GL JS</div>
                  <div className="tech-badge">🐍 FastAPI & Python 3.12</div>
                  <div className="tech-badge">🗄️ SQLite + SQLAlchemy</div>
                  <div className="tech-badge">🌐 Trilingual (GU / HI / EN)</div>
                  <div className="tech-badge">📊 Recharts & Canvas</div>
                </div>
              </div>

              {/* GitHub & Community Contribution */}
              <div className="about-github-box">
                <div className="github-meta">
                  <h4>Contribute on GitHub</h4>
                  <p>Help build civic tools for Ahmedabad. Submit bug reports, feature requests, or translations.</p>
                </div>
                <a
                  href="https://github.com/andrewshiva/AmdavadSafai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-github-btn"
                >
                  <ExternalLink size={15} />
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="about-modal-footer">
          <div className="about-footer-actions">
            {onOpenReport && (
              <button
                type="button"
                className="about-cta-btn primary"
                onClick={() => {
                  onClose();
                  onOpenReport();
                }}
              >
                <span>➕ {t('report_garbage') || 'Report Garbage'}</span>
              </button>
            )}

            {onOpenEvents && (
              <button
                type="button"
                className="about-cta-btn secondary"
                onClick={() => {
                  onClose();
                  onOpenEvents();
                }}
              >
                <span>🧹 {t('cleanup_drives') || 'Sunday Drives'}</span>
              </button>
            )}

            {onOpenCleanedSpots && (
              <button
                type="button"
                className="about-cta-btn secondary header-desktop-only"
                onClick={() => {
                  onClose();
                  onOpenCleanedSpots();
                }}
              >
                <span>✨ {t('cleaned_spots_short') || 'Cleaned Spots'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            className="modal-btn-secondary"
            onClick={onClose}
          >
            {t('close') || 'Close'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AboutModal;
