// Game Constants

export const CARD_RARITIES = {
  COMMON: 'Common',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
  MYTHIC: 'Mythic'
};

export const CARD_TYPES = {
  WARRIOR: 'Warrior',
  MAGE: 'Mage',
  ASSASSIN: 'Assassin',
  TANK: 'Tank',
  SUPPORT: 'Support'
};

export const RARITY_COLORS = {
  Common: 'from-gray-500 to-gray-600',
  Rare: 'from-blue-500 to-blue-600',
  Epic: 'from-purple-500 to-purple-600',
  Legendary: 'from-yellow-500 to-orange-600',
  Mythic: 'from-pink-500 to-red-600'
};

export const RARITY_GLOW = {
  Common: 'shadow-gray-500/50',
  Rare: 'shadow-blue-500/50',
  Epic: 'shadow-purple-500/50',
  Legendary: 'shadow-yellow-500/50',
  Mythic: 'shadow-pink-500/50'
};

export const RARITY_DROP_RATES = {
  Common: 50,
  Rare: 30,
  Epic: 15,
  Legendary: 4,
  Mythic: 1
};

export const PACK_PRICES = {
  BASIC: 500,
  PREMIUM: 1500,
  LEGENDARY: 5000
};

export const PACK_CARD_COUNTS = {
  BASIC: 3,
  PREMIUM: 5,
  LEGENDARY: 10
};

export const INITIAL_DECK_SIZE = 5;
export const MAX_DECK_SIZE = 10;
export const BATTLE_ENERGY_COST = 10;
export const DAILY_QUEST_REWARD = 200;
export const LEVEL_UP_REWARD = 500;

export const BATTLE_REWARDS = {
  WIN: {
    gold: 150,
    exp: 100
  },
  LOSS: {
    gold: 50,
    exp: 25
  }
};

export const CLAN_CREATION_COST = 5000;
export const CLAN_MAX_MEMBERS = 50;

export const TOURNAMENT_ENTRY_FEES = {
  ROOKIE: 100,
  AMATEUR: 500,
  PROFESSIONAL: 1000,
  MASTER: 2000,
  LEGENDARY: 5000
};

export const ROUTES = {
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  BATTLE: '/battle',
  DECK_BUILDER: '/deck-builder',
  MARKETPLACE: '/marketplace',
  CLAN: '/clan',
  TOURNAMENT: '/tournament',
  LEADERBOARD: '/leaderboard'
};