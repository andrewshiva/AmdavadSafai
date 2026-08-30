/**
 * Centralized AMC CCRS 311 Ticket Formatting & Generation Utilities
 * Ensures all tickets follow official Ahmedabad Municipal Corporation 5-digit decimal standard:
 * e.g. AMC-CCRS-2026-90412
 */

/**
 * Returns a clean, official AMC CCRS ticket identifier for a given report object.
 * If report already has an AMC ticket ID, returns it.
 * Otherwise, generates a deterministic 5-digit decimal ticket number from the report ID or coordinates.
 *
 * @param {Object} report - Report object
 * @returns {string} e.g. "AMC-CCRS-2026-88412"
 */
export const getAmcTicketId = (report) => {
  if (report?.amc_ticket_id && typeof report.amc_ticket_id === 'string' && report.amc_ticket_id.startsWith('AMC-CCRS-')) {
    // If ticket was generated with old hex slice (e.g. AMC-CCRS-2026-59b11), clean it into a 5-digit numeric ID
    const parts = report.amc_ticket_id.split('-');
    const suffix = parts[parts.length - 1];
    if (/^\d{5}$/.test(suffix)) {
      return report.amc_ticket_id;
    }
  }

  if (!report) return 'AMC-CCRS-2026-88412';

  const seedStr = `${report.id || ''}_${report.lat || ''}_${report.lng || ''}_${report.ward_id || ''}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) & 0xffffffff;
  }
  const ticketNum = 10000 + (Math.abs(hash) % 90000);
  return `AMC-CCRS-2026-${ticketNum}`;
};

/**
 * Generates a fresh authentic AMC CCRS Ticket ID for newly submitted citizen reports.
 *
 * @returns {string} e.g. "AMC-CCRS-2026-74912"
 */
export const generateAmcTicketId = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `AMC-CCRS-2026-${randomNum}`;
};

export default {
  getAmcTicketId,
  generateAmcTicketId
};
