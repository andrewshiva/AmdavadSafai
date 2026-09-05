import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import HeaderV2 from './HeaderV2';
import AboutSection from '../components/AboutSection';
import ReportPage from '../components/ReportPage';
import MyReportsView from './MyReportsView';
import ImpactGalleryView from './ImpactGalleryView';
import DashboardView from './DashboardView';
import WardsProfileView from './WardsProfileView';
import CleanupDrivesView from './CleanupDrivesView';
import LoginModal from './LoginModal';
import VideoModal from '../components/VideoModal';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';
import ListView from '../components/ListView';
import StatsPanel from '../components/StatsPanel';
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
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('amdavad_safai_user_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

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
  const [isStatsOpen, setIsStatsOpen] = useState(false);
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

  const handleLoginSuccess = (userData) => {
    const user = {
      name: userData.name || (userData.role === 'officer' ? 'Inspector R. Shah' : 'Jatin Sharma'),
      initials: userData.role === 'officer' ? 'RS' : 'JS',
      phone: userData.phone || '+91 98765 43210',
      role: userData.role || 'citizen'
    };
    setCurrentUser(user);
    try {
      localStorage.setItem('amdavad_safai_user_v2', JSON.stringify(user));
    } catch {
      // Ignore
    }
    const msg = lang === 'gu' ? `સ્વાગત છે, ${user.name}` : lang === 'hi' ? `स्वागत है, ${user.name}` : `Welcome, ${user.name}`;
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (activeView === 'report') {
      setActiveView('about');
    }
    try {
      localStorage.removeItem('amdavad_safai_user_v2');
    } catch {
      // Ignore
    }
    const msg = lang === 'gu' ? 'તમે સફળતાપૂર્વક સાઇન આઉટ થયા છો' : lang === 'hi' ? 'आप सफलतापूर्वक साइन आउट हो गए हैं' : 'Signed out successfully';
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleRequireLoginOrReport = () => {
    if (!currentUser) {
      setIsLoginOpen(true);
    } else {
      setActiveView('report');
    }
  };

  return (
    <div className="app-container app-v2-theme">
      {/* Welcome Screen */}
      <WelcomeOverlay />

      {/* Variant Top Header */}
      <HeaderV2
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onOpenEvents={() => setIsEventsOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenRWA={() => setIsRWAOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenVideo={() => setIsVideoOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onSwitchVersion={onSwitchVersion}
      />

      {/* Main app body */}
      <main className="main-content about-view-active">
        {activeView === 'report' ? (
          <ReportPage
            onCancel={() => {
              setActiveView('dashboard');
              if (refetch) refetch();
            }}
            onSuccess={() => {
              if (refetch) refetch();
            }}
            pickedCoords={pickedCoords}
          />
        ) : activeView === 'dashboard' ? (
          <DashboardView
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onOpenReport={handleRequireLoginOrReport}
          />
        ) : activeView === 'about' ? (
          <AboutSection
            currentUser={currentUser}
            onOpenReport={handleRequireLoginOrReport}
            onOpenEvents={() => setIsEventsOpen(true)}
            onToggleStats={() => setIsStatsOpen(!isStatsOpen)}
            onOpenVideo={() => setIsVideoOpen(true)}
          />
        ) : activeView === 'reports' ? (
          <MyReportsView
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onViewReceipt={(report) => setSelectedReceipt(report)}
            onOpenReport={handleRequireLoginOrReport}
          />
        ) : activeView === 'wards' ? (
          <WardsProfileView
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onOpenReport={handleRequireLoginOrReport}
          />
        ) : activeView === 'drives' ? (
          <CleanupDrivesView
            onOpenCreateEvent={() => {
              if (!currentUser) {
                setIsLoginOpen(true);
              } else {
                setIsCreateEventOpen(true);
              }
            }}
            onRequireLogin={() => setIsLoginOpen(true)}
            onNavigateToImpact={() => setActiveView('impact')}
          />
        ) : activeView === 'impact' ? (
          <ImpactGalleryView
            onOpenEvents={() => setActiveView('drives')}
            onOpenReport={handleRequireLoginOrReport}
          />
        ) : (
          <DashboardView
            reports={filteredReports}
            onSelectReport={(report) => setSelectedReport(report)}
            onOpenReport={handleRequireLoginOrReport}
          />
        )}
      </main>

      {/* Login & Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

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
            if (!currentUser) {
              setIsLoginOpen(true);
            } else {
              setVerifyingReport(report);
            }
          }}
          onFlag={(report) => {
            setSelectedReport(null);
            if (!currentUser) {
              setIsLoginOpen(true);
            } else {
              setFlaggingReport(report);
            }
          }}
          onDispute={(report) => {
            setSelectedReport(null);
            if (!currentUser) {
              setIsLoginOpen(true);
            } else {
              setDisputingReport(report);
            }
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
            if (!currentUser) {
              setIsLoginOpen(true);
            } else {
              setDisputingReport(report);
            }
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
          if (!currentUser) {
            setIsLoginOpen(true);
          } else {
            setIsCreateEventOpen(true);
          }
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

      {/* MiniMind-3 Civic AI Assistant Modal */}
      <CivicAIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      {/* Stats Drawer - Only visible after login in Version 2 */}
      {currentUser && (
        <StatsPanel
          reports={filteredReports}
          isOpen={isStatsOpen}
          onToggleOpen={() => setIsStatsOpen(!isStatsOpen)}
        />
      )}

      {/* Dynamic Action Toast */}
      {toastMsg && (
        <div className="v2-action-toast">
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default AppV2;
