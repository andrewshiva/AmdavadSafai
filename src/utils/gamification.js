const STORAGE_KEY = 'amdavad_safai_karma_v1';

export const KARMA_ACTIONS = {
  REPORT_SUBMITTED: { points: 10, key: 'badge_action_report' },
  CLEANUP_VERIFIED: { points: 25, key: 'badge_action_verify' },
  EVENT_JOINED: { points: 50, key: 'badge_action_join' },
  EVENT_CREATED: { points: 100, key: 'badge_action_create' }
};

export const BADGE_TIERS = [
  { id: 'safai_sevak', minPoints: 0, titleKey: 'badge_safai_sevak', icon: '🥉', color: '#64748B' },
  { id: 'ward_guardian', minPoints: 50, titleKey: 'badge_ward_guardian', icon: '🥈', color: '#0284C7' },
  { id: 'safai_warrior', minPoints: 150, titleKey: 'badge_safai_warrior', icon: '🥇', color: '#16A34A' },
  { id: 'eco_champion', minPoints: 300, titleKey: 'badge_eco_champion', icon: '👑', color: '#D97706' }
];

export const getKarmaData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    points: 35, // starting civic welcome bonus
    history: [
      { action: 'WELCOME_BONUS', points: 35, timestamp: new Date().toISOString() }
    ],
    joinedEvents: [],
    reportsFiled: [],
    cleanupsVerified: []
  };
};

export const addKarmaPoints = (actionType, customPoints = null) => {
  const current = getKarmaData();
  const pointsToAdd = customPoints || KARMA_ACTIONS[actionType]?.points || 10;
  
  const updated = {
    ...current,
    points: current.points + pointsToAdd,
    history: [
      {
        action: actionType,
        points: pointsToAdd,
        timestamp: new Date().toISOString()
      },
      ...current.history.slice(0, 20)
    ]
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('amdavad-safai-karma-updated', { detail: updated }));
    }
  } catch (err) {
    console.error('Failed to save karma points:', err);
  }

  return updated;
};

export const getCurrentBadge = (points) => {
  let currentBadge = BADGE_TIERS[0];
  for (const tier of BADGE_TIERS) {
    if (points >= tier.minPoints) {
      currentBadge = tier;
    }
  }
  return currentBadge;
};

export const getNextBadge = (points) => {
  for (const tier of BADGE_TIERS) {
    if (points < tier.minPoints) {
      return tier;
    }
  }
  return null;
};
