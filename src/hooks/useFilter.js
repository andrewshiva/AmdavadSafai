import { useState, useEffect } from 'react';
import reportsData from '../data/reports.json';

export const useFilter = () => {
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [wardId, setWardId] = useState('all');
  const [search, setSearch] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async (sev, stat, cat, ward, query) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        severity: sev,
        status: stat,
        category: cat,
        ward_id: ward,
        search: query
      });
      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      setFilteredReports(await response.json());
    } catch {
      // Offline / Static deployment fallback
      const storedReports = JSON.parse(localStorage.getItem('amdavad_safai_local_reports') || '[]');
      const combined = [...storedReports, ...reportsData];
      const q = query.toLowerCase().trim();

      const fallback = combined.filter((report) => {
        const matchesSev = sev === 'all' || report.severity === sev;
        const matchesStat = stat === 'all' || report.status === stat;
        const matchesCat = cat === 'all' || report.category === cat;
        const matchesWard = ward === 'all' || report.ward_id === ward;
        const matchesSearch =
          !q ||
          (report.description_en && report.description_en.toLowerCase().includes(q)) ||
          (report.description_gu && report.description_gu.includes(q)) ||
          (report.id && report.id.toLowerCase().includes(q));

        return matchesSev && matchesStat && matchesCat && matchesWard && matchesSearch;
      });

      setFilteredReports(fallback);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(severity, status, category, wardId, search);
  }, [severity, status, category, wardId, search]);

  const resetFilters = () => {
    setSeverity('all');
    setStatus('all');
    setCategory('all');
    setWardId('all');
    setSearch('');
  };

  const isFiltered = severity !== 'all' || status !== 'all' || category !== 'all' || wardId !== 'all' || search !== '';

  return {
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
    error,
    isFiltered,
    resetFilters,
    refetch: () => fetchReports(severity, status, category, wardId, search)
  };
};

export default useFilter;
