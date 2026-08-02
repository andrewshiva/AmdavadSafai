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
import { useFilter } from './hooks/useFilter';
import { Map, List, Loader2, Plus } from 'lucide-react';
import wardsData from './data/wards.json';

export const App = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('map'); // 'map' or 'list'
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);

  // Modals state
  const [selectedReport, setSelectedReport] = useState(null);
  const [verifyReportTarget, setVerifyReportTarget] = useState(null);
  const [flagReportTarget, setFlagReportTarget] = useState(null);
  const [outofCityMessage, setOutofCityMessage] = useState(null);

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

  return (
    <div className="app-container">
      {/* Welcome Screen */}
      <WelcomeOverlay />

      {/* Header bar */}
      <Header />

      {/* Main app body */}
      <main className="main-content">
        {/* Toggle between Map and List View */}
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


        {/* Floating Report Garbage Action Button */}
        <button
          className="fab-report-btn"
          onClick={() => setIsReportOpen(true)}
          style={{
            position: 'absolute',
            bottom: '64px',
            right: '24px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-lg)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Plus size={18} strokeWidth={3} />
          <span>{t('report_garbage')}</span>
        </button>

        {/* Loading Indicator Overlay */}
        {loading && (
          <div className="view-loading-overlay">
            <Loader2 className="animate-spin text-teal" size={32} />
          </div>
        )}

        {/* Dynamic Views */}
        {activeView === 'map' ? (
          <MapView
            reports={filteredReports}
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
        onUpvoteSuccess={refetch}
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

      {/* Bottom stats drawer */}
      <StatsPanel reports={filteredReports} />
    </div>
  );
};

export default App;

