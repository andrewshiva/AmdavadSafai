import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/useTranslation';
import { Eye, AlertOctagon, Search, Tag, MapPin, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import wardsData from '../data/wards.json';

export const FilterBar = ({
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
  isFiltered,
  resetFilters
}) => {
  const { t, lang } = useTranslation();
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // Active filter count
  const activeFilterCount =
    (severity !== 'all' ? 1 : 0) +
    (status !== 'all' ? 1 : 0) +
    (category !== 'all' ? 1 : 0) +
    (wardId !== 'all' ? 1 : 0) +
    (search ? 1 : 0);

  const selectedWard = wardsData.find((w) => w.id === wardId);
  const wardDisplayName = selectedWard
    ? (lang === 'gu' ? selectedWard.name_gu : selectedWard.name_en)
    : t('filter_all_wards');

  return (
    <>
      {/* Desktop & Main Filter Bar */}
      <div className="filter-bar">
        {/* Search Input */}
        <div className="filter-search-wrapper">
          <Search size={16} className="filter-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder') || 'Search complaints...'}
            className="filter-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="filter-clear-search-btn"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Mobile Filter Trigger Button */}
        <button
          type="button"
          className={`mobile-filter-trigger-btn ${activeFilterCount > 0 ? 'has-active' : ''}`}
          onClick={() => setIsMobileModalOpen(true)}
        >
          <SlidersHorizontal size={15} />
          <span>{t('filters') || 'Filters'}</span>
          {activeFilterCount > 0 && (
            <span className="mobile-filter-badge">{activeFilterCount}</span>
          )}
        </button>

        {/* Desktop Filter Dropdowns */}
        <div className="desktop-filters-group">
          {/* Severity Filter */}
          <div className="filter-item">
            <AlertOctagon size={15} className="filter-icon" />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('filter_all_severity')}</option>
              <option value="minor">{t('filter_minor')}</option>
              <option value="moderate">{t('filter_moderate')}</option>
              <option value="severe">{t('filter_severe')}</option>
              <option value="critical">{t('filter_critical')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-item">
            <Eye size={15} className="filter-icon" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('filter_all_status')}</option>
              <option value="unresolved">{t('filter_unresolved')}</option>
              <option value="resolved">{t('filter_resolved')}</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-item">
            <Tag size={15} className="filter-icon" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('filter_all_categories')}</option>
              <option value="garbage_pile">{t('cat_garbage_pile')}</option>
              <option value="roadside_garbage">{t('cat_roadside_garbage')}</option>
              <option value="overflowing_bin">{t('cat_overflowing_bin')}</option>
              <option value="sewage_overflow">{t('cat_sewage_overflow')}</option>
              <option value="drainage_blockage">{t('cat_drainage_blockage')}</option>
              <option value="dead_animal">{t('cat_dead_animal')}</option>
              <option value="street_light">{t('cat_street_light')}</option>
              <option value="public_toilet">{t('cat_public_toilet')}</option>
              <option value="construction_dump">{t('cat_construction_dump')}</option>
              <option value="mixed_waste">{t('cat_mixed_waste')}</option>
              <option value="other_issue">{t('cat_other_issue')}</option>
            </select>
          </div>

          {/* Ward Filter */}
          <div className="filter-item">
            <MapPin size={15} className="filter-icon" />
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('filter_all_wards')}</option>
              {wardsData.map((w) => (
                <option key={w.id} value={w.id}>
                  {lang === 'gu' ? w.name_gu : w.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="filter-reset-btn"
            >
              <X size={14} />
              <span>{t('reset_filters')}</span>
            </button>
          )}
        </div>

        {/* Mobile Quick Filter Chips (Swipeable horizontally) */}
        <div className="mobile-quick-chips">
          <button
            type="button"
            className={`quick-chip ${status === 'unresolved' ? 'active' : ''}`}
            onClick={() => setStatus(status === 'unresolved' ? 'all' : 'unresolved')}
          >
            ⏳ {t('filter_unresolved')}
          </button>
          <button
            type="button"
            className={`quick-chip ${severity === 'critical' ? 'active' : ''}`}
            onClick={() => setSeverity(severity === 'critical' ? 'all' : 'critical')}
          >
            🔥 {t('filter_critical')}
          </button>
          <button
            type="button"
            className={`quick-chip ${severity === 'severe' ? 'active' : ''}`}
            onClick={() => setSeverity(severity === 'severe' ? 'all' : 'severe')}
          >
            ⚠️ {t('filter_severe')}
          </button>
          <button
            type="button"
            className={`quick-chip ${status === 'resolved' ? 'active' : ''}`}
            onClick={() => setStatus(status === 'resolved' ? 'all' : 'resolved')}
          >
            ✅ {t('filter_resolved')}
          </button>
          <button
            type="button"
            className={`quick-chip ${category === 'mixed_waste' ? 'active' : ''}`}
            onClick={() => setCategory(category === 'mixed_waste' ? 'all' : 'mixed_waste')}
          >
            🗑️ {t('cat_mixed_waste')}
          </button>
          {wardId !== 'all' && (
            <button
              type="button"
              className="quick-chip active"
              onClick={() => setWardId('all')}
            >
              📍 {wardDisplayName} <X size={12} style={{ marginLeft: 4 }} />
            </button>
          )}
          {isFiltered && (
            <button
              type="button"
              className="quick-chip reset-chip"
              onClick={resetFilters}
            >
              <RefreshCw size={11} /> {t('reset_filters')}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Modal */}
      {isMobileModalOpen && ReactDOM.createPortal(
        <div
          className="modal-overlay mobile-filter-sheet-overlay"
          role="presentation"
          onClick={() => setIsMobileModalOpen(false)}
        >
          <div
            className="modal-content mobile-filter-sheet-content"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="sheet-drag-handle" />

            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} className="text-primary" />
                <h2 className="modal-title" style={{ margin: 0 }}>
                  {t('filters') || 'Filter Complaints'}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsMobileModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Ward Selection */}
                <div className="input-group">
                  <label className="mobile-filter-label">
                    <MapPin size={15} />
                    <span>{t('select_ward') || 'Ward / Area'}</span>
                  </label>
                  <select
                    value={wardId}
                    onChange={(e) => setWardId(e.target.value)}
                    className="modal-input mobile-sheet-select"
                  >
                    <option value="all">{t('filter_all_wards')}</option>
                    {wardsData.map((w) => (
                      <option key={w.id} value={w.id}>
                        {lang === 'gu' ? w.name_gu : w.name_en} ({lang === 'gu' ? w.zone_gu : w.zone_en})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div className="input-group">
                  <label className="mobile-filter-label">
                    <Eye size={15} />
                    <span>{t('filter_all_status') || 'Resolution Status'}</span>
                  </label>
                  <div className="mobile-segmented-options">
                    <button
                      type="button"
                      className={`segmented-opt ${status === 'all' ? 'active' : ''}`}
                      onClick={() => setStatus('all')}
                    >
                      {t('filter_all_status')}
                    </button>
                    <button
                      type="button"
                      className={`segmented-opt ${status === 'unresolved' ? 'active' : ''}`}
                      onClick={() => setStatus('unresolved')}
                    >
                      ⏳ {t('filter_unresolved')}
                    </button>
                    <button
                      type="button"
                      className={`segmented-opt ${status === 'resolved' ? 'active' : ''}`}
                      onClick={() => setStatus('resolved')}
                    >
                      ✅ {t('filter_resolved')}
                    </button>
                  </div>
                </div>

                {/* Severity Selection */}
                <div className="input-group">
                  <label className="mobile-filter-label">
                    <AlertOctagon size={15} />
                    <span>{t('severity') || 'Severity Level'}</span>
                  </label>
                  <div className="mobile-segmented-grid">
                    <button
                      type="button"
                      className={`segmented-opt ${severity === 'all' ? 'active' : ''}`}
                      onClick={() => setSeverity('all')}
                    >
                      {t('filter_all_severity')}
                    </button>
                    <button
                      type="button"
                      className={`segmented-opt opt-minor ${severity === 'minor' ? 'active' : ''}`}
                      onClick={() => setSeverity('minor')}
                    >
                      🟢 {t('filter_minor')}
                    </button>
                    <button
                      type="button"
                      className={`segmented-opt opt-moderate ${severity === 'moderate' ? 'active' : ''}`}
                      onClick={() => setSeverity('moderate')}
                    >
                      🟡 {t('filter_moderate')}
                    </button>
                    <button
                      type="button"
                      className={`segmented-opt opt-severe ${severity === 'severe' ? 'active' : ''}`}
                      onClick={() => setSeverity('severe')}
                    >
                      🟠 {t('filter_severe')}
                    </button>
                    <button
                      type="button"
                      className={`segmented-opt opt-critical ${severity === 'critical' ? 'active' : ''}`}
                      onClick={() => setSeverity('critical')}
                    >
                      🔴 {t('filter_critical')}
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="input-group">
                  <label className="mobile-filter-label">
                    <Tag size={15} />
                    <span>{t('category_label') || 'Waste Category'}</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="modal-input mobile-sheet-select"
                  >
                    <option value="all">{t('filter_all_categories')}</option>
                    <option value="garbage_pile">{t('cat_garbage_pile')}</option>
                    <option value="roadside_garbage">{t('cat_roadside_garbage')}</option>
                    <option value="overflowing_bin">{t('cat_overflowing_bin')}</option>
                    <option value="sewage_overflow">{t('cat_sewage_overflow')}</option>
                    <option value="drainage_blockage">{t('cat_drainage_blockage')}</option>
                    <option value="dead_animal">{t('cat_dead_animal')}</option>
                    <option value="street_light">{t('cat_street_light')}</option>
                    <option value="public_toilet">{t('cat_public_toilet')}</option>
                    <option value="construction_dump">{t('cat_construction_dump')}</option>
                    <option value="mixed_waste">{t('cat_mixed_waste')}</option>
                    <option value="other_issue">{t('cat_other_issue')}</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Sticky Sheet Footer */}
            <div className="modal-footer mobile-filter-sheet-footer">
              <button
                type="button"
                className="modal-btn-secondary"
                onClick={() => {
                  resetFilters();
                  setIsMobileModalOpen(false);
                }}
                style={{ flex: 1 }}
              >
                {t('reset_filters')}
              </button>
              <button
                type="button"
                className="modal-btn-primary"
                onClick={() => setIsMobileModalOpen(false)}
                style={{ flex: 1.5 }}
              >
                {t('close') || 'Apply Filters'}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FilterBar;
