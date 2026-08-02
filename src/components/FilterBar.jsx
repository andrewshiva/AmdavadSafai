import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { Eye, AlertOctagon, Search, Tag, MapPin, X } from 'lucide-react';
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

  return (
    <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      {/* Search Input */}
      <div className="filter-item" style={{ flex: '1 1 180px', minWidth: '160px', position: 'relative' }}>
        <Search size={15} className="filter-icon" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search complaint description..."
          className="filter-select"
          style={{ width: '100%', paddingLeft: '32px', paddingRight: search ? '28px' : '10px' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

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
          <option value="all">All Categories</option>
          <option value="mixed_waste">{t('cat_mixed_waste')}</option>
          <option value="construction_dump">{t('cat_construction_dump')}</option>
          <option value="overflowing_bin">{t('cat_overflowing_bin')}</option>
          <option value="roadside_garbage">{t('cat_roadside_garbage')}</option>
          <option value="drainage_blockage">{t('cat_drainage_blockage')}</option>
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
          <option value="all">All Wards</option>
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
          onClick={resetFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <X size={14} />
          Reset Filters
        </button>
      )}
    </div>
  );
};
export default FilterBar;
