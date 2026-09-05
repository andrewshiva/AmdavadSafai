import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import HeaderV1 from './HeaderV1';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';
import ListView from '../components/ListView';
import StatsPanel from '../components/StatsPanel';
import WelcomeOverlay from '../components/WelcomeOverlay';
import ReportModal from '../components/ReportModal';
import ReportDetailModal from '../components/ReportDetailModal';
import OutofCityModal from '../components/OutofCityModal';
import VerifyCleanupModal from '../components/VerifyCleanupModal';
import FlagReportModal from '../components/FlagReportModal';
import DisputeResolutionModal from '../components/DisputeResolutionModal';
import EventsModal from '../components/EventsModal';
import CreateEventModal from '../components/CreateEventModal';
import BadgesModal from '../components/BadgesModal';
import ShareCardModal from '../components/ShareCardModal';
import WallOfCleanedModal from '../components/WallOfCleanedModal';
import RWADashboardModal from '../components/RWADashboardModal';
import ResolutionReceiptModal from '../components/ResolutionReceiptModal';
import CivicAIAssistantModal from '../components/CivicAIAssistantModal';
import { useFilter } from '../hooks/useFilter';
import { Map, List, Loader2, Plus } from 'lucide-react';
import { checkDailyVisitStreak } from '../utils/gamification';
import wardsData from '../data/wards.json';

export const AppV1 = ({ onSwitchVersion }) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('map'); // 'map' or 'list'
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [pickedCoords, setPickedCoords] = useState(null);
  const [outOfCityMessage, setOutOfCityMessage] = useState('');
  const [verifyingReport, setVerifyingReport] = useState(null);
  const [flaggingReport, setFlaggingReport] = useState(null);
  const [disputingReport, setDisputingReport] = useState(null);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isCleanedWallOpen, setIsCleanedWallOpen] = useState(false);
  const [isRWAOpen, setIsRWAOpen] = useState(false);
  const [shareCardTarget, setShareCardTarget] = useState(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

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

  // Daily login streak gamification check on mount
  useEffect(() => {
    checkDailyVisitStreak();
  }, []);

  return (
    <div className="app-container app-v1-theme">
      {/* Welcome Screen */}
      <WelcomeOverlay />

      {/* Header bar with Trilingual toggle, Drives trigger, Cleaned Spots & Karma points */}
      <HeaderV1
        onOpenEvents={() => setIsEventsOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenCleanedSpots={() => setIsCleanedWallOpen(true)}
        onOpenRWA={() => setIsRWAOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onSwitchVersion={onSwitchVersion}
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
        onSuccess={() => {
          setIsReportOpen(false);
          setPickedCoords(null);
          if (refetch) refetch();
        }}
        pickedCoords={pickedCoords}
        onOutofCity={(msg) => setOutOfCityMessage(msg)}
      />

      {/* Out of City Boundary Alert Modal */}
      <OutofCityModal
        isOpen={!!outOfCityMessage}
        onClose={() => setOutOfCityMessage('')}
        message={outOfCityMessage}
      />

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          isOpen={Boolean(selectedReport)}
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onViewReceipt={(report) => setSelectedReceipt(report)}
          onVerify={(report) => {
            setSelectedReport(null);
            setVerifyingReport(report);
          }}
          onFlag={(report) => {
            setSelectedReport(null);
            setFlaggingReport(report);
          }}
          onDispute={(report) => {
            setSelectedReport(null);
            setDisputingReport(report);
          }}
          onShareCard={(report) => {
            setShareCardTarget(report);
          }}
        />
      )}

      {/* Official AMC Resolution Receipt Modal */}
      {selectedReceipt && (
        <ResolutionReceiptModal
          report={selectedReceipt}
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          onDispute={(report) => {
            setSelectedReceipt(null);
            setDisputingReport(report);
          }}
          onShareCard={(report) => {
            setShareCardTarget(report);
          }}
          onOpenReportDetail={(report) => {
            setSelectedReceipt(null);
            setSelectedReport(report);
          }}
        />
      )}

      {/* Cleanup Verification Modal */}
      {verifyingReport && (
        <VerifyCleanupModal
          report={verifyingReport}
          onClose={() => setVerifyingReport(null)}
          onSuccess={() => {
            setVerifyingReport(null);
            if (refetch) refetch();
          }}
        />
      )}

      {/* Flag Abuse Modal */}
      {flaggingReport && (
        <FlagReportModal
          report={flaggingReport}
          onClose={() => setFlaggingReport(null)}
          onSuccess={() => {
            setFlaggingReport(null);
            if (refetch) refetch();
          }}
        />
      )}

      {/* Dispute Resolution Modal */}
      {disputingReport && (
        <DisputeResolutionModal
          report={disputingReport}
          onClose={() => setDisputingReport(null)}
          onSuccess={() => {
            setDisputingReport(null);
            if (refetch) refetch();
          }}
        />
      )}

      {/* Sunday Cleanup Drives Modal */}
      <EventsModal
        isOpen={isEventsOpen}
        onClose={() => setIsEventsOpen(false)}
        onOpenCreate={() => {
          setIsEventsOpen(false);
          setIsCreateEventOpen(true);
        }}
        onShareEvent={(event) => {
          setShareCardTarget(event);
        }}
      />

      {/* Create Sunday Cleanup Drive Modal */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSuccess={() => {
          setIsCreateEventOpen(false);
          setIsEventsOpen(true);
        }}
      />

      {/* Gamification Citizen Badges Modal */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
      />

      {/* Wall of Cleaned Spots Modal */}
      <WallOfCleanedModal
        isOpen={isCleanedWallOpen}
        onClose={() => setIsCleanedWallOpen(false)}
      />

      {/* RWA & Ward Dashboard Modal */}
      <RWADashboardModal
        isOpen={isRWAOpen}
        onClose={() => setIsRWAOpen(false)}
      />

      {/* Share Card Modal (Canvas Generator) */}
      <ShareCardModal
        isOpen={!!shareCardTarget}
        onClose={() => setShareCardTarget(null)}
        data={shareCardTarget}
      />

      {/* MiniMind-3 Civic AI Assistant Modal */}
      <CivicAIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      {/* Stats Drawer (Bottom Left Drawer) */}
      <StatsPanel
        reports={filteredReports}
        isOpen={isStatsOpen}
        onToggleOpen={() => setIsStatsOpen(!isStatsOpen)}
      />
    </div>
  );
};

export default AppV1;
