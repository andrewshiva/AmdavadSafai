import React, { useState, useEffect } from 'react';
import { useTranslation } from './i18n/useTranslation';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import MapView from './components/MapView';
import ListView from './components/ListView';
import StatsPanel from './components/StatsPanel';
import WelcomeOverlay from './components/WelcomeOverlay';
import ReportModal from './components/ReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import OutofCityModal from './components/OutofCityModal';
import VerifyCleanupModal from './components/VerifyCleanupModal';
import FlagReportModal from './components/FlagReportModal';
import DisputeResolutionModal from './components/DisputeResolutionModal';
import EventsModal from './components/EventsModal';
import CreateEventModal from './components/CreateEventModal';
import BadgesModal from './components/BadgesModal';
import ShareCardModal from './components/ShareCardModal';
import WallOfCleanedModal from './components/WallOfCleanedModal';
import RWADashboardModal from './components/RWADashboardModal';
import { useFilter } from './hooks/useFilter';
import { Map, List, Loader2, Plus, Sparkles, Calendar, Building2, BarChart2 } from 'lucide-react';
import { checkDailyVisitStreak } from './utils/gamification';
import wardsData from './data/wards.json';

export const App = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('map'); // 'map' or 'list'
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);

  // Initialize Citizen Device ID & Daily Streak on startup
  useEffect(() => {
    checkDailyVisitStreak();
  }, []);

  // Modals state
  const [selectedReport, setSelectedReport] = useState(null);
  const [verifyReportTarget, setVerifyReportTarget] = useState(null);
  const [flagReportTarget, setFlagReportTarget] = useState(null);
  const [disputeReportTarget, setDisputeReportTarget] = useState(null);
  const [outofCityMessage, setOutofCityMessage] = useState(null);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isCleanedWallOpen, setIsCleanedWallOpen] = useState(false);
  const [isRWAOpen, setIsRWAOpen] = useState(false);
  const [shareCardTarget, setShareCardTarget] = useState(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const {
    severity,
    setSeverity,
    status,
    setStatus,
    category,
    setCategory,
    wardId,
    setWardId,
    search,
    setSearch,
    filteredReports,
    loading,
    isFiltered,
    resetFilters,
    refetch
  } = useFilter();

  // Hash state deep link handling (#report=rpt_001)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#report=')) {
        const reportId = hash.replace('#report=', '');
        const r = filteredReports.find((item) => item.id === reportId);
        if (r) setSelectedReport(r);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [filteredReports]);

  // Listen for event popup button clicks from MapLibre
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const btn = e.target.closest('.view-event-detail-btn');
      if (btn) {
        setIsEventsOpen(true);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  return (
    <div className="app-container">
      {/* Welcome Screen */}
      <WelcomeOverlay />

      {/* Header bar with Trilingual toggle, Drives trigger, Cleaned Spots & Karma points */}
      <Header
        onOpenEvents={() => setIsEventsOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenCleanedSpots={() => setIsCleanedWallOpen(true)}
        onOpenRWA={() => setIsRWAOpen(true)}
      />

      {/* Main app body */}
      <main className="main-content">
        {/* Desktop Toggle between Map and List View */}
        <div className="view-controls-bar">
          <button
            className={`view-toggle-btn ${activeView === 'map' ? 'active' : ''}`}
            onClick={() => setActiveView('map')}
          >
            <Map size={14} />
            <span>{t('map')}</span>
          </button>
          <button
            className={`view-toggle-btn ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
          >
            <List size={14} />
            <span>{t('list')}</span>
          </button>
        </div>

        {/* Global Filter Bar */}
        <FilterBar
          severity={severity}
          setSeverity={setSeverity}
          status={status}
          setStatus={setStatus}
          category={category}
          setCategory={setCategory}
          wardId={wardId}
          setWardId={setWardId}
          search={search}
          setSearch={setSearch}
          isFiltered={isFiltered}
          resetFilters={resetFilters}
        />

        {/* Loading Indicator Overlay */}
        {loading && filteredReports.length === 0 && (
          <div className="view-loading-overlay">
            <Loader2 className="animate-spin text-teal" size={32} />
          </div>
        )}

        {/* Dynamic Views */}
        {activeView === 'map' ? (
          <MapView
            reports={filteredReports}
            wardId={wardId}
            onReportSelect={(report) => setSelectedReport(report)}
            onMapClick={(coords) => {
              if (isReportOpen) {
                setPickedCoords(coords);
              }
            }}
          />
        ) : (
          <ListView
            reports={filteredReports}
            onReportSelect={(report) => setSelectedReport(report)}
          />
        )}
      </main>

      {/* Floating Report Garbage Action Button */}
      <button
        className="fab-report-btn"
        onClick={() => setIsReportOpen(true)}
        aria-label={t('report_garbage') || 'Report Garbage'}
      >
        <Plus size={20} strokeWidth={2.8} />
        <span className="fab-label">{t('report_garbage')}</span>
      </button>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setPickedCoords(null);
        }}
        wards={wardsData}
        onSuccess={refetch}
        pickedCoords={pickedCoords}
        onOutofCity={(msg) => setOutofCityMessage(msg)}
      />

      {/* Rich Report Detail Modal */}
      <ReportDetailModal
        isOpen={Boolean(selectedReport)}
        onClose={() => {
          setSelectedReport(null);
          if (window.location.hash.includes('#report=')) {
            history.pushState('', document.title, window.location.pathname + window.location.search);
          }
        }}
        report={selectedReport}
        onVerifyClick={(rpt) => {
          setSelectedReport(null);
          setVerifyReportTarget(rpt);
        }}
        onFlagClick={(rpt) => {
          setSelectedReport(null);
          setFlagReportTarget(rpt);
        }}
        onDisputeClick={(rpt) => {
          setSelectedReport(null);
          setDisputeReportTarget(rpt);
        }}
        onUpvoteSuccess={refetch}
        onOpenShareCard={(cardData) => setShareCardTarget(cardData)}
      />

      {/* Out of City Geofence Modal */}
      <OutofCityModal
        isOpen={Boolean(outofCityMessage)}
        onClose={() => setOutofCityMessage(null)}
      />

      {/* Verify Cleanup Modal */}
      <VerifyCleanupModal
        isOpen={Boolean(verifyReportTarget)}
        onClose={() => setVerifyReportTarget(null)}
        report={verifyReportTarget}
        onSuccess={refetch}
      />

      {/* Flag Incorrect Report Modal */}
      <FlagReportModal
        isOpen={Boolean(flagReportTarget)}
        onClose={() => setFlagReportTarget(null)}
        report={flagReportTarget}
        onSuccess={refetch}
      />

      {/* Dispute False Cleanup / Re-Open Modal */}
      <DisputeResolutionModal
        isOpen={Boolean(disputeReportTarget)}
        onClose={() => setDisputeReportTarget(null)}
        report={disputeReportTarget}
        onSuccess={refetch}
      />

      {/* Community Cleanup Drives Modal */}
      <EventsModal
        isOpen={isEventsOpen}
        onClose={() => setIsEventsOpen(false)}
        onOpenCreateEvent={() => {
          setIsEventsOpen(false);
          setIsCreateEventOpen(true);
        }}
        onOpenShareCard={(cardData) => setShareCardTarget(cardData)}
      />

      {/* Create Cleanup Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={() => {
          setIsEventsOpen(true);
        }}
      />

      {/* Citizen Badges & Impact Modal */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        onOpenEvents={() => setIsEventsOpen(true)}
      />

      {/* Wall of Cleaned Spots (Before/After Transformations) */}
      <WallOfCleanedModal
        isOpen={isCleanedWallOpen}
        onClose={() => setIsCleanedWallOpen(false)}
        reports={filteredReports}
        wards={wardsData}
      />

      {/* Ward RWA Pilot & Accountability Dashboard */}
      <RWADashboardModal
        isOpen={isRWAOpen}
        onClose={() => setIsRWAOpen(false)}
        reports={filteredReports}
        wards={wardsData}
      />

      {/* Social Share Card Modal */}
      <ShareCardModal
        isOpen={Boolean(shareCardTarget)}
        onClose={() => setShareCardTarget(null)}
        data={shareCardTarget}
      />

      {/* Bottom stats drawer */}
      <StatsPanel
        reports={filteredReports}
        isOpen={isStatsOpen}
        onToggleOpen={setIsStatsOpen}
      />

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mobile-nav-tab ${activeView === 'map' && !isStatsOpen ? 'active' : ''}`}
          onClick={() => {
            setActiveView('map');
            setIsStatsOpen(false);
          }}
        >
          <div className="mobile-nav-icon-wrap">
            <Map size={20} />
          </div>
          <span className="mobile-nav-label">{t('map')}</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeView === 'list' && !isStatsOpen ? 'active' : ''}`}
          onClick={() => {
            setActiveView('list');
            setIsStatsOpen(false);
          }}
        >
          <div className="mobile-nav-icon-wrap">
            <List size={20} />
            {filteredReports.filter(r => r.status === 'unresolved').length > 0 && (
              <span className="mobile-nav-badge">
                {filteredReports.filter(r => r.status === 'unresolved').length}
              </span>
            )}
          </div>
          <span className="mobile-nav-label">{t('list')}</span>
        </button>

        <button
          type="button"
          className="mobile-nav-tab"
          onClick={() => setIsEventsOpen(true)}
        >
          <div className="mobile-nav-icon-wrap">
            <Calendar size={20} />
            <span className="mobile-nav-badge">5</span>
          </div>
          <span className="mobile-nav-label">{t('cleanup_drives') || 'Drives'}</span>
        </button>

        <button
          type="button"
          className="mobile-nav-tab"
          onClick={() => setIsCleanedWallOpen(true)}
        >
          <div className="mobile-nav-icon-wrap">
            <Sparkles size={20} />
          </div>
          <span className="mobile-nav-label">{t('cleaned_spots_short') || 'Cleaned'}</span>
        </button>

        <button
          type="button"
          className="mobile-nav-tab"
          onClick={() => setIsRWAOpen(true)}
        >
          <div className="mobile-nav-icon-wrap">
            <Building2 size={20} />
          </div>
          <span className="mobile-nav-label">{t('rwa_hub_short') || 'RWA Hub'}</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${isStatsOpen ? 'active' : ''}`}
          onClick={() => setIsStatsOpen(!isStatsOpen)}
        >
          <div className="mobile-nav-icon-wrap">
            <BarChart2 size={20} />
          </div>
          <span className="mobile-nav-label">{t('stats')}</span>
        </button>
      </nav>

    </div>
  );
};

export default App;

