/**
 * AmdavadSafai community tracking-reference utilities.
 *
 * References look like AS-2026-90412. They are INTERNAL platform identifiers
 * for community reports — NOT official AMC CCRS 311 tickets (see ADR-0005).
 * Citizens must file officially via the AMC CCRS 311 helpline (155303).
 * Legacy AMC-CCRS- prefixed IDs in old data are still recognised.
 */

const NEW_PREFIX = 'AS-2026-';
const LEGACY_PREFIX = 'AMC-CCRS-2026-';

/**
 * Returns the tracking reference for a report object.
 * Accepts new (AS-2026-) and legacy (AMC-CCRS-2026-) IDs; otherwise derives a
 * deterministic 5-digit reference from the report ID or coordinates.
 *
 * @param {Object} report - Report object
 * @returns {string} e.g. "AS-2026-88412"
 */
export const getAmcTicketId = (report) => {
  if (report?.amc_ticket_id && typeof report.amc_ticket_id === 'string') {
    const id = report.amc_ticket_id;
    if (id.startsWith(NEW_PREFIX) || id.startsWith(LEGACY_PREFIX)) {
      // If ticket was generated with old hex slice (e.g. AMC-CCRS-2026-59b11), clean it into a 5-digit numeric ID
      const parts = id.split('-');
      const suffix = parts[parts.length - 1];
      if (/^\d{5}$/.test(suffix)) {
        return id;
      }
    }
  }

  if (!report) return `${NEW_PREFIX}88412`;

  const seedStr = `${report.id || ''}_${report.lat || ''}_${report.lng || ''}_${report.ward_id || ''}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) & 0xffffffff;
  }
  const ticketNum = 10000 + (Math.abs(hash) % 90000);
  return `${NEW_PREFIX}${ticketNum}`;
};

/**
 * Generates a fresh community tracking reference for newly submitted reports.
 *
 * @returns {string} e.g. "AS-2026-74912"
 */
export const generateAmcTicketId = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${NEW_PREFIX}${randomNum}`;
};

export default {
  getAmcTicketId,
  generateAmcTicketId
};
