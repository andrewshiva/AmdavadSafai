/**
 * Reusable date and time formatting utilities with Gujarati, Hindi, and English support.
 */

const LOCALE_MAP = {
  gu: 'gu-IN',
  hi: 'hi-IN',
  en: 'en-US'
};

/**
 * Format date string into localized Date & Time (e.g., "Sep 05, 2026 · 12:20 PM" or Gujarati/Hindi equivalent)
 */
export const formatDateTime = (dateStr, lang = 'gu') => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';

    const locale = LOCALE_MAP[lang] || 'en-US';
    const datePart = d.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${datePart} · ${timePart}`;
  } catch {
    return '';
  }
};

/**
 * Format date string into localized Date only (e.g., "Sep 05, 2026")
 */
export const formatDateOnly = (dateStr, lang = 'gu') => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';

    const locale = LOCALE_MAP[lang] || 'en-US';
    return d.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

/**
 * Format date string into localized Time only (e.g., "12:20 PM")
 */
export const formatTimeOnly = (dateStr, lang = 'gu') => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';

    const locale = LOCALE_MAP[lang] || 'en-US';
    return d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
};

/**
 * Get relative time string (e.g. "Just now", "15m ago", "2h ago", "3d ago")
 */
export const getRelativeTime = (dateStr, lang = 'gu') => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = Math.max(0, now - d);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      if (lang === 'gu') return 'હમણાં જ';
      if (lang === 'hi') return 'अभी-अभी';
      return 'Just now';
    }
    if (diffMins < 60) {
      if (lang === 'gu') return `${diffMins} મિનિટ પહેલાં`;
      if (lang === 'hi') return `${diffMins} मिनट पहले`;
      return `${diffMins} mins ago`;
    }
    if (diffHours < 24) {
      if (lang === 'gu') return `${diffHours} કલાક પહેલાં`;
      if (lang === 'hi') return `${diffHours} घंटे पहले`;
      return `${diffHours} hours ago`;
    }
    if (lang === 'gu') return `${diffDays} દિવસ પહેલાં`;
    if (lang === 'hi') return `${diffDays} दिन पहले`;
    return `${diffDays} days ago`;
  } catch {
    return '';
  }
};

export default {
  formatDateTime,
  formatDateOnly,
  formatTimeOnly,
  getRelativeTime
};
