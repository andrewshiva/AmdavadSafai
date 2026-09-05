import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import HeaderV2 from './HeaderV2';
import AboutSection from '../components/AboutSection';
import ReportPage from '../components/ReportPage';
import MyReportsView from './MyReportsView';
import ImpactGalleryView from './ImpactGalleryView';
import DashboardView from './DashboardView';
import StatisticsView from './StatisticsView';
import WardsProfileView from './WardsProfileView';
import CleanupDrivesView from './CleanupDrivesView';
import VideoModal from '../components/VideoModal';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';
import ListView from '../components/ListView';
import WelcomeOverlay from '../components/WelcomeOverlay';
import ReportDetailModal from '../components/ReportDetailModal';
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
import { Loader2 } from 'lucide-react';
import { checkDailyVisitStreak } from '../utils/gamification';

export const AppV2 = ({ onSwitchVersion }) => {
  const { t, lang } = useTranslation();
  const [activeView, setActiveView] = useState('about'); // 'about', 'dashboard', 'reports', 'wards', 'impact', 'report'

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [pickedCoords, setPickedCoords] = useState(null);
  const [verifyingReport, setVerifyingReport] = useState(null);
  const [flaggingReport, setFlaggingReport] = useState(null);
  const [disputingReport, setDisputingReport] = useState(null);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isCleanedWallOpen, setIsCleanedWallOpen] = useState(false);
  const [isRWAOpen, setIsRWAOpen] = useState(false);
  const [shareCardTarget, setShareCardTarget] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
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

  useEffect(() => {
    checkDailyVisitStreak();
  }, []);

  // Reporting and civic actions are anonymous — no login required (ADR-0004).
  const handleOpenReport = (coords) => {
    if (coords && coords.lat && coords.lng) {
      setPickedCoords(coords);
    } else {
      setPickedCoords(null);
    }
    setActiveView('report');
  };

  return (
    <div className="app-container app-v2-theme">
      {/* Welcome Screen */}
      <WelcomeOverlay />

      {/* Variant Top Header */}
      <HeaderV2
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenEvents={() => setIsEventsOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenRWA={() => setIsRWAOpen(true)}
        onOpenVideo={() => setIsVideoOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onSwitchVersion={onSwitchVersion}
      />

      {/* Main app body */}
      <main className="main-content about-view-active">
        {activeView === 'report' ? (
          <ReportPage
            onCancel={() => {
              setPickedCoords(null);
              setActiveView('dashboard');
              if (refetch) refetch();
            }}
            onSuccess={() => {
              setPickedCoords(null);
              if (refetch) refetch();
            }}
            pickedCoords={pickedCoords}
          />
        ) : activeView === 'dashboard' ? (
          <DashboardView
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onOpenReport={handleOpenReport}
          />
        ) : activeView === 'about' ? (
          <AboutSection
            reports={filteredReports}
            onOpenReport={handleOpenReport}
            onOpenEvents={() => setIsEventsOpen(true)}
            onToggleStats={() => setActiveView('stats')}
            onOpenVideo={() => setIsVideoOpen(true)}
          />
        ) : activeView === 'reports' ? (
          <MyReportsView
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onViewReceipt={(report) => setSelectedReceipt(report)}
            onOpenReport={handleOpenReport}
          />
        ) : activeView === 'wards' ? (
          <WardsProfileView
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onOpenReport={handleOpenReport}
          />
        ) : activeView === 'drives' ? (
          <CleanupDrivesView
            onOpenCreateEvent={() => {
              setIsCreateEventOpen(true);
            }}
            onNavigateToImpact={() => setActiveView('impact')}
          />
        ) : activeView === 'impact' ? (
          <ImpactGalleryView
            onOpenEvents={() => setActiveView('drives')}
            onOpenReport={handleOpenReport}
          />
        ) : activeView === 'stats' ? (
          <StatisticsView reports={filteredReports} />
        ) : (
          <DashboardView
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onOpenReport={handleOpenReport}
          />
        )}
      </main>


      {/* Introduction & Overview Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          isOpen={Boolean(selectedReport)}
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onViewReceipt={(report) => {
            setSelectedReport(null);
            setSelectedReceipt(report);
          }}
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

      {/* Official AMC Resolution Receipt & Cleanliness Certificate Modal */}
      {selectedReceipt && (
        <ResolutionReceiptModal
          isOpen={Boolean(selectedReceipt)}
          report={selectedReceipt}
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

      {/* Share Card Modal */}
      <ShareCardModal
        isOpen={!!shareCardTarget}
        onClose={() => setShareCardTarget(null)}
        data={shareCardTarget}
      />

      {/* Civic AI Assistant Modal */}
      <CivicAIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />


    </div>
  );
};

export default AppV2;
