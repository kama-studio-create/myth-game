// Game Constants

// Card Rarities
exports.CARD_RARITIES = {
  COMMON: 'Common',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
  MYTHIC: 'Mythic'
};

// Card Types
exports.CARD_TYPES = {
  WARRIOR: 'Warrior',
  MAGE: 'Mage',
  ASSASSIN: 'Assassin',
  TANK: 'Tank',
  SUPPORT: 'Support'
};

// Battle Types
exports.BATTLE_TYPES = {
  QUICK: 'quick',
  RANKED: 'ranked',
  TOURNAMENT: 'tournament',
  CLAN: 'clan',
  PRACTICE: 'practice'
};

// User Ranks
exports.USER_RANKS = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Master',
  'Legendary'
];

// Rarity Multipliers
exports.RARITY_MULTIPLIERS = {
  'Common': 1,
  'Rare': 1.5,
  'Epic': 2,
  'Legendary': 3,
  'Mythic': 5
};

// Experience per level
exports.EXP_PER_LEVEL = 500;

// Max level
exports.MAX_LEVEL = 100;

// Initial resources
exports.INITIAL_RESOURCES = {
  gold: 1000,
  gems: 100,
  tokens: 100,
  energy: 100
};

// Battle energy cost
exports.BATTLE_ENERGY_COST = 10;

// Battle rewards
exports.BATTLE_REWARDS = {
  quick: {
    winnerTokens: 50,
    winnerGold: 150,
    loserTokens: 10,
    loserGold: 50,
    ratingWin: 15,
    ratingLoss: -10
  },
  ranked: {
    winnerTokens: 100,
    winnerGold: 300,
    loserTokens: 20,
    loserGold: 100,
    ratingWin: 25,
    ratingLoss: -20
  },
  tournament: {
    winnerTokens: 150,
    winnerGold: 500,
    loserTokens: 50,
    loserGold: 200,
    ratingWin: 50,
    ratingLoss: -30
  },
  clan: {
    winnerTokens: 75,
    winnerGold: 200,
    loserTokens: 25,
    loserGold: 75,
    ratingWin: 20,
    ratingLoss: -15
  },
  practice: {
    winnerTokens: 20,
    winnerGold: 50,
    loserTokens: 10,
    loserGold: 25,
    ratingWin: 0,
    ratingLoss: 0
  }
};

// Daily rewards
exports.DAILY_REWARDS = [
  { day: 1, gold: 100, gems: 0 },
  { day: 2, gold: 150, gems: 5 },
  { day: 3, gold: 200, gems: 0 },
  { day: 4, gold: 300, gems: 10 },
  { day: 5, gold: 400, gems: 0 },
  { day: 6, gold: 500, gems: 25 },
  { day: 7, gold: 1000, gems: 100 }
];

// Card stats limits
exports.CARD_STATS_LIMITS = {
  attack: { min: 0, max: 200 },
  defense: { min: 0, max: 200 },
  health: { min: 0, max: 500 },
  magic: { min: 0, max: 200 },
  speed: { min: 0, max: 200 }
};

// Deck settings
exports.DECK_SETTINGS = {
  MIN_CARDS: 5,
  MAX_CARDS: 10,
  MAX_DECKS: 3
};

// Marketplace
exports.MARKETPLACE = {
  PLATFORM_FEE_PERCENTAGE: 5,
  MIN_PRICE: 1,
  MAX_PRICE: 1000000
};

// Tournament settings
exports.TOURNAMENT_SETTINGS = {
  MIN_PARTICIPANTS: 2,
  MAX_PARTICIPANTS: 512,
  ENTRY_FEE_MIN: 0,
  ENTRY_FEE_MAX: 100000
};

// Clan settings
exports.CLAN_SETTINGS = {
  MAX_MEMBERS: 50,
  MAX_MEMBERS_ELITE: 100,
  CREATION_COST: 5000,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500
};

// Rating thresholds for ranks
exports.RANK_THRESHOLDS = {
  'Bronze': 0,
  'Silver': 1200,
  'Gold': 1500,
  'Platinum': 1800,
  'Diamond': 2100,
  'Master': 2500,
  'Legendary': 3000
};

// Error messages
exports.ERROR_MESSAGES = {
  INSUFFICIENT_GOLD: 'Insufficient gold',
  INSUFFICIENT_GEMS: 'Insufficient gems',
  INSUFFICIENT_TOKENS: 'Insufficient tokens',
  CARD_NOT_FOUND: 'Card not found',
  USER_NOT_FOUND: 'User not found',
  BATTLE_NOT_FOUND: 'Battle not found',
  UNAUTHORIZED: 'Unauthorized',
  INVALID_LEVEL: 'Invalid level',
  DECK_FULL: 'Deck is full',
  TOURNAMENT_FULL: 'Tournament is full'
};

// Success messages
exports.SUCCESS_MESSAGES = {
  CARD_PURCHASED: 'Card purchased successfully',
  CARD_SOLD: 'Card sold successfully',
  BATTLE_COMPLETED: 'Battle completed successfully',
  LEVEL_UP: 'Level up!',
  TOURNAMENT_REGISTERED: 'Successfully registered for tournament'
};

// Pagination
exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Sorting options
exports.SORT_OPTIONS = {
  NEWEST: { createdAt: -1 },
  OLDEST: { createdAt: 1 },
  PRICE_HIGH: { salePrice: -1 },
  PRICE_LOW: { salePrice: 1 },
  POWER: { power: -1 },
  LEVEL: { level: -1 },
  RATING: { rating: -1 }
};

// Languages
exports.LANGUAGES = ['en', 'es', 'fr', 'de'];

// User roles
exports.USER_ROLES = {
  PLAYER: 'player',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

// Clan roles
exports.CLAN_ROLES = {
  LEADER: 'Leader',
  ELDER: 'Elder',
  MEMBER: 'Member'
};

// Transaction types
exports.TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  TRADE: 'trade',
  LISTING: 'listing',
  NFT_TRADE: 'nft_trade',
  GIFT: 'gift',
  REWARD: 'reward',
  PENALTY: 'penalty'
};

// Transaction status
exports.TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
};

module.exports = exports;