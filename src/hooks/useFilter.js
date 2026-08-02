import { useState, useEffect } from 'react';
import reportsData from '../data/reports.json';

export const useFilter = () => {
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async (sev, stat) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports?severity=${sev}&status=${stat}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      if (!response.ok) throw new Error('Failed to fetch reports');
      setFilteredReports(await response.json());
    } catch {
      // The dashboard remains useful when the optional FastAPI service is not
      // running (for example on a static Vercel deployment).
      const fallback = reportsData.filter((report) =>
        (sev === 'all' || report.severity === sev) &&
        (stat === 'all' || report.status === stat)
      );
      setFilteredReports(fallback);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch reports whenever filters change
  useEffect(() => {
    fetchReports(severity, status);
  }, [severity, status]);

  return {
    severity,
    setSeverity,
    status,
    setStatus,
    filteredReports,
    loading,
    error,
    refetch: () => fetchReports(severity, status)
  };
};
