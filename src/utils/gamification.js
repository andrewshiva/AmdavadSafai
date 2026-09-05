/**
 * AmdavadSafai — Advanced Civic Karma, Device Identity & Returning User System
 * 
 * Technology Stack & Logic:
 * 1. Persistent Device Identity: Cryptographic UUID + Hardware Fingerprinting across LocalStorage & Cookies
 * 2. Returning User & Streak Engine: Daily check-in detection (YYYY-MM-DD), consecutive streaks, milestone bonuses
 * 3. Idempotent Action Ledger: Anti-fraud deduplication (prevents double-rewarding on same report/event)
 * 4. Multi-Tier Progression: 5 civic tiers (Sevak -> Guardian -> Warrior -> Champion -> Ratna)
 */

const STORAGE_KEY = 'amdavad_safai_karma_v2';
const LEGACY_STORAGE_KEY = 'amdavad_safai_karma_v1';
const DEVICE_ID_KEY = 'amdavad_citizen_device_id';

// Civic Karma Action Catalog with standard points and daily caps
export const KARMA_ACTIONS = {
  WELCOME_BONUS: { points: 35, key: 'badge_action_welcome', description: 'Welcome to AmdavadSafai Citizen Network' },
  DAILY_CHECKIN: { points: 10, key: 'badge_action_daily', description: 'Daily Civic Check-in & Surveillance' },
  STREAK_7D: { points: 50, key: 'badge_action_streak_7d', description: '7-Day Civic Surveillance Streak Bonus' },
  STREAK_30D: { points: 200, key: 'badge_action_streak_30d', description: '30-Day Active Ward Guardian Streak' },
  REPORT_SUBMITTED: { points: 15, key: 'badge_action_report', description: 'Geo-tagged Garbage Complaint Registered' },
  CLEANUP_VERIFIED: { points: 30, key: 'badge_action_verify', description: 'Photo-verified Cleaned Spot Confirmation' },
  EVENT_JOINED: { points: 50, key: 'badge_action_join', description: 'Joined Sunday Community Cleanup Drive' },
  EVENT_CREATED: { points: 100, key: 'badge_action_create', description: 'Organized Community Cleanup Drive' },
  REPORT_UPVOTED: { points: 5, key: 'badge_action_upvote', description: 'Verified Neighbor Complaint Hotspot' },
  DISPUTE_FILED: { points: 15, key: 'badge_action_dispute', description: 'Filed False Cleanup Dispute Notice' },
  DOSSIER_DOWNLOADED: { points: 10, key: 'badge_action_dossier', description: 'Generated Ward Corporator Civic Dossier' },
  SHARE_CARD_COPIED: { points: 5, key: 'badge_action_share', description: 'Shared AMC Civic Alert to WhatsApp/Social' }
};

// 5 Civic Badge Tiers
export const BADGE_TIERS = [
  { id: 'safai_sevak', minPoints: 0, titleKey: 'badge_safai_sevak', icon: '🥉', color: '#64748B', titleEn: 'Safai Sevak', titleGu: 'સફાઈ સેવક' },
  { id: 'ward_guardian', minPoints: 50, titleKey: 'badge_ward_guardian', icon: '🥈', color: '#0284C7', titleEn: 'Ward Guardian', titleGu: 'વોર્ડ રક્ષક' },
  { id: 'safai_warrior', minPoints: 150, titleKey: 'badge_safai_warrior', icon: '🥇', color: '#16A34A', titleEn: 'Safai Warrior', titleGu: 'સફાઈ યોદ્ધા' },
  { id: 'eco_champion', minPoints: 300, titleKey: 'badge_eco_champion', icon: '👑', color: '#D97706', titleEn: 'Eco Champion', titleGu: 'ઇકો ચેમ્પિયન' },
  { id: 'amdavad_ratna', minPoints: 600, titleKey: 'badge_amdavad_ratna', icon: '🏆', color: '#8B5CF6', titleEn: 'Amdavad Ratna', titleGu: 'અમદાવાદ રત્ન' }
];

/**
 * 1. Persistent Device Identifier (UUID + Cookie + LocalStorage fallback)
 * Identifies distinct mobile devices, tablets, and desktop browsers.
 */
export const getOrCreateDeviceId = () => {
  if (typeof window === 'undefined') return 'server_instance';

  // 1. Try LocalStorage
  try {
    const stored = localStorage.getItem(DEVICE_ID_KEY);
    if (stored && stored.length > 8) return stored;
  } catch {
    // ignore
  }

  // 2. Try Cookie
  try {
    const match = document.cookie.match(new RegExp('(^| )' + DEVICE_ID_KEY + '=([^;]+)'));
    if (match && match[2]) {
      const idFromCookie = decodeURIComponent(match[2]);
      try { localStorage.setItem(DEVICE_ID_KEY, idFromCookie); } catch {}
      return idFromCookie;
    }
  } catch {
    // ignore
  }

  // 3. Generate Cryptographic Unique Citizen Device ID
  let newId = '';
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    newId = `amd_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  } else {
    // Fallback pseudo-UUID
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 10);
    const screenSig = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '0x0';
    newId = `amd_${ts}_${rand}_${screenSig.replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  // Persist to LocalStorage and Long-lived Cookie (1 year)
  try {
    localStorage.setItem(DEVICE_ID_KEY, newId);
    document.cookie = `${DEVICE_ID_KEY}=${encodeURIComponent(newId)}; max-age=31536000; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }

  return newId;
};

/**
 * Get current ISO calendar date string (YYYY-MM-DD) in local timezone
 */
const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Calculate calendar day difference between two YYYY-MM-DD strings
 */
const getDayDifference = (dateStr1, dateStr2) => {
  if (!dateStr1 || !dateStr2) return null;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Reads Raw Karma Profile from Storage
 */
export const getKarmaData = () => {
  const deviceId = getOrCreateDeviceId();

  if (typeof window === 'undefined') {
    return createInitialProfile(deviceId);
  }

  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const data = JSON.parse(rawV2);
      if (!data.deviceId) data.deviceId = deviceId;
      return data;
    }

    // Migrate from v1 if present
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const v1Data = JSON.parse(rawV1);
      const migrated = {
        ...createInitialProfile(deviceId),
        points: Math.max(35, v1Data.points || 35),
        history: Array.isArray(v1Data.history) ? v1Data.history : []
      };
      saveKarmaData(migrated);
      return migrated;
    }
  } catch {
    // ignore
  }

  const initial = createInitialProfile(deviceId);
  saveKarmaData(initial);
  return initial;
};

/**
 * Creates initial clean profile for a new citizen device
 */
const createInitialProfile = (deviceId) => {
  const today = getTodayDateString();
  const now = new Date().toISOString();
  return {
    version: 2,
    deviceId: deviceId,
    points: 35, // starting welcome bonus
    streakDays: 1,
    lastVisitDate: today,
    lastVisitTime: now,
    totalVisits: 1,
    history: [
      {
        id: `act_${Date.now()}`,
        action: 'WELCOME_BONUS',
        points: 35,
        targetId: 'welcome',
        timestamp: now,
        description: KARMA_ACTIONS.WELCOME_BONUS.description
      }
    ],
    // Deduplication tracking sets
    verifiedReports: {},
    upvotedReports: {},
    joinedEvents: {},
    createdEvents: {},
    filedDisputes: {},
    dailyReportCount: { [today]: 0 }
  };
};

/**
 * Saves profile to LocalStorage and triggers sync event
 */
const saveKarmaData = (data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('amdavad-safai-karma-updated', { detail: data }));
    
    // Optional background sync with server
    syncKarmaWithBackend(data).catch(() => {});
  } catch (err) {
    console.error('Failed to save karma data:', err);
  }
};

/**
 * 2. Returning User Intelligence & Civic Streak Check
 * Runs automatically on page load to reward daily surveillance visits
 */
export const checkDailyVisitStreak = () => {
  const current = getKarmaData();
  const today = getTodayDateString();
  const now = new Date().toISOString();

  // If already checked in today, just update visit timestamp and total visit count
  if (current.lastVisitDate === today) {
    current.totalVisits = (current.totalVisits || 1) + 1;
    current.lastVisitTime = now;
    saveKarmaData(current);
    return { isNewCheckin: false, currentStreak: current.streakDays || 1, pointsAdded: 0 };
  }

  const dayDiff = getDayDifference(current.lastVisitDate, today);
  let newStreak = 1;
  let pointsEarned = 0;
  const newHistory = [];

  if (dayDiff === 1) {
    // Consecutive day visit!
    newStreak = (current.streakDays || 1) + 1;
    pointsEarned += KARMA_ACTIONS.DAILY_CHECKIN.points;

    newHistory.push({
      id: `act_${Date.now()}_daily`,
      action: 'DAILY_CHECKIN',
      points: KARMA_ACTIONS.DAILY_CHECKIN.points,
      targetId: today,
      timestamp: now,
      description: `Day ${newStreak} Civic Check-in (+10 pts)`
    });

    // Milestone bonus checks
    if (newStreak === 7) {
      pointsEarned += KARMA_ACTIONS.STREAK_7D.points;
      newHistory.push({
        id: `act_${Date.now()}_s7`,
        action: 'STREAK_7D',
        points: KARMA_ACTIONS.STREAK_7D.points,
        targetId: `streak_7_${today}`,
        timestamp: now,
        description: '🌟 7-Day Active Citizen Streak Milestone Bonus (+50 pts)'
      });
    } else if (newStreak === 30) {
      pointsEarned += KARMA_ACTIONS.STREAK_30D.points;
      newHistory.push({
        id: `act_${Date.now()}_s30`,
        action: 'STREAK_30D',
        points: KARMA_ACTIONS.STREAK_30D.points,
        targetId: `streak_30_${today}`,
        timestamp: now,
        description: '👑 30-Day Ward Guardian Streak Milestone Bonus (+200 pts)'
      });
    }
  } else {
    // Gap in visits: restart streak at 1
    newStreak = 1;
    pointsEarned += KARMA_ACTIONS.DAILY_CHECKIN.points;
    newHistory.push({
      id: `act_${Date.now()}_daily`,
      action: 'DAILY_CHECKIN',
      points: KARMA_ACTIONS.DAILY_CHECKIN.points,
      targetId: today,
      timestamp: now,
      description: 'Daily Civic Check-in (+10 pts)'
    });
  }

  // Update profile
  const updated = {
    ...current,
    points: current.points + pointsEarned,
    streakDays: newStreak,
    lastVisitDate: today,
    lastVisitTime: now,
    totalVisits: (current.totalVisits || 1) + 1,
    history: [...newHistory, ...(current.history || [])].slice(0, 30)
  };

  saveKarmaData(updated);

  return {
    isNewCheckin: true,
    currentStreak: newStreak,
    pointsAdded: pointsEarned
  };
};

/**
 * 3. Idempotent Action Rewarder with Anti-Abuse Protection
 * Prevents spamming points on the same complaint or event
 */
export const addKarmaPoints = (actionType, customPoints = null, metadata = {}) => {
  const current = getKarmaData();
  const actionDef = KARMA_ACTIONS[actionType];
  const pointsToAdd = customPoints !== null ? customPoints : (actionDef?.points || 10);
  const targetId = metadata.targetId || metadata.reportId || metadata.eventId || 'generic';
  const today = getTodayDateString();
  const now = new Date().toISOString();

  // Deduplication checks
  if (actionType === 'CLEANUP_VERIFIED' && targetId !== 'generic') {
    if (current.verifiedReports && current.verifiedReports[targetId]) {
      return { success: false, reason: 'ALREADY_VERIFIED', current };
    }
    current.verifiedReports = { ...(current.verifiedReports || {}), [targetId]: now };
  }

  if (actionType === 'REPORT_UPVOTED' && targetId !== 'generic') {
    if (current.upvotedReports && current.upvotedReports[targetId]) {
      return { success: false, reason: 'ALREADY_UPVOTED', current };
    }
    current.upvotedReports = { ...(current.upvotedReports || {}), [targetId]: now };
  }

  if (actionType === 'EVENT_JOINED' && targetId !== 'generic') {
    if (current.joinedEvents && current.joinedEvents[targetId]) {
      return { success: false, reason: 'ALREADY_JOINED', current };
    }
    current.joinedEvents = { ...(current.joinedEvents || {}), [targetId]: now };
  }

  if (actionType === 'DISPUTE_FILED' && targetId !== 'generic') {
    if (current.filedDisputes && current.filedDisputes[targetId]) {
      return { success: false, reason: 'ALREADY_DISPUTED', current };
    }
    current.filedDisputes = { ...(current.filedDisputes || {}), [targetId]: now };
  }

  // Daily report submission cap (max 5 reports per day for points to prevent bot spam)
  if (actionType === 'REPORT_SUBMITTED') {
    const todayCount = current.dailyReportCount?.[today] || 0;
    if (todayCount >= 5) {
      return { success: false, reason: 'DAILY_CAP_REACHED', current };
    }
    current.dailyReportCount = { ...(current.dailyReportCount || {}), [today]: todayCount + 1 };
  }

  const newEntry = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action: actionType,
    points: pointsToAdd,
    targetId: targetId,
    timestamp: now,
    description: metadata.description || actionDef?.description || actionType
  };

  const updated = {
    ...current,
    points: current.points + pointsToAdd,
    history: [newEntry, ...(current.history || [])].slice(0, 30)
  };

  saveKarmaData(updated);

  return {
    success: true,
    pointsAdded: pointsToAdd,
    totalPoints: updated.points,
    current: updated
  };
};

/**
 * 3b. Karma Escrow for verifications (Q9 decision).
 * CLEANUP_VERIFIED points are held as pending until the report is certified
 * (reporter confirm or 2-device quorum). Prevents leaderboard spam from
 * unverified confirmations. No slashing — honest mistakes stay friendly.
 */
export const holdKarmaEscrow = (actionType = 'CLEANUP_VERIFIED', metadata = {}) => {
  const current = getKarmaData();
  const actionDef = KARMA_ACTIONS[actionType];
  const pointsToHold = actionDef?.points || 30;
  const targetId = metadata.targetId || metadata.reportId || 'generic';
  const now = new Date().toISOString();
  const escrow = Array.isArray(current.escrow) ? [...current.escrow] : [];

  // Idempotent: one pending escrow per target
  if (targetId !== 'generic' && escrow.some((e) => e.targetId === targetId && e.status === 'pending')) {
    return { success: false, reason: 'ALREADY_PENDING', current };
  }
  // Already verified before: nothing to hold
  if (actionType === 'CLEANUP_VERIFIED' && targetId !== 'generic') {
    if (current.verifiedReports && current.verifiedReports[targetId]) {
      return { success: false, reason: 'ALREADY_VERIFIED', current };
    }
    current.verifiedReports = { ...(current.verifiedReports || {}), [targetId]: now };
  }

  escrow.unshift({
    id: `esc_${Date.now()}`,
    action: actionType,
    points: pointsToHold,
    targetId,
    timestamp: now,
    status: 'pending',
    description: metadata.description || actionDef?.description || actionType
  });
  const updated = { ...current, escrow: escrow.slice(0, 30) };
  saveKarmaData(updated);
  return { success: true, pointsHeld: pointsToHold, current: updated };
};

/**
 * Finalize pending escrow for a target (called when its report certifies).
 */
export const finalizeKarmaEscrow = (targetId) => {
  const current = getKarmaData();
  const escrow = Array.isArray(current.escrow) ? [...current.escrow] : [];
  let released = 0;
  const remaining = escrow.map((e) => {
    if (e.targetId === targetId && e.status === 'pending') {
      released += e.points;
      return { ...e, status: 'released' };
    }
    return e;
  });
  if (released === 0) return { success: false, reason: 'NOTHING_PENDING', current };
  const releasedEntries = remaining
    .filter((e) => e.targetId === targetId && e.status === 'released')
    .map((e) => ({ id: e.id, action: e.action, points: e.points, targetId: e.targetId, timestamp: e.timestamp, description: e.description }));
  const updated = {
    ...current,
    points: current.points + released,
    escrow: remaining.slice(0, 30),
    history: [...releasedEntries, ...(current.history || [])].slice(0, 30)
  };
  saveKarmaData(updated);
  return { success: true, pointsReleased: released, totalPoints: updated.points, current: updated };
};

/**
 * Pending (unreleased) escrow entries for display.
 */
export const getPendingEscrow = () => {
  try {
    const current = getKarmaData();
    return (current.escrow || []).filter((e) => e.status === 'pending');
  } catch {
    return [];
  }
};

/**
 * 4. Badge Progression Calculations
 */
export const getCurrentBadge = (points) => {
  const pts = typeof points === 'number' ? points : 0;
  let currentBadge = BADGE_TIERS[0];
  for (const tier of BADGE_TIERS) {
    if (pts >= tier.minPoints) {
      currentBadge = tier;
    }
  }
  return currentBadge;
};

export const getNextBadge = (points) => {
  const pts = typeof points === 'number' ? points : 0;
  for (const tier of BADGE_TIERS) {
    if (pts < tier.minPoints) {
      return tier;
    }
  }
  return null;
};

/**
 * Optional background sync with backend server
 */
async function syncKarmaWithBackend(karmaProfile) {
  if (typeof fetch === 'undefined') return;
  try {
    await fetch('/api/karma/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: karmaProfile.deviceId,
        points: karmaProfile.points,
        streak_days: karmaProfile.streakDays,
        total_visits: karmaProfile.totalVisits,
        last_visit: karmaProfile.lastVisitTime
      })
    });
  } catch {
    // offline or static mode — local state remains single source of truth
  }
}
