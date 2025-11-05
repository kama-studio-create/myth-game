// backend/src/config/gameConfig.js
module.exports = {
  GAME_CONFIG: {
    // CARD SYSTEM
    CARDS: {
      TOTAL_SUPPLY: 1000000,
      DAILY_LIMIT_REGULAR: 500,
      DAILY_LIMIT_VIP: 50,
      STATS: [
        { number: 1, atk: 10, def: 10, hp: 10 },
        { number: 2, atk: 20, def: 20, hp: 20 },
        { number: 3, atk: 30, def: 30, hp: 30 },
        { number: 4, atk: 40, def: 40, hp: 40 },
        { number: 5, atk: 50, def: 50, hp: 50 },
        { number: 6, atk: 60, def: 60, hp: 60 },
        { number: 7, atk: 70, def: 70, hp: 70 },
        { number: 8, atk: 80, def: 80, hp: 80 },
      ],
      FREE_STARTER_CARDS: 5,
      FREE_STARTER_TICKETS: 20,
    },

    // PACK PRICES (in gold, $1 = 1000 gold)
    PACKS: {
      PACK_1: { 
        price: 1000, // $1
        cards: 1,
        possibleCards: [1, 2, 3, 4, 5, 6, 7, 8],
        name: '1-Card Pack'
      },
      PACK_5: { 
        price: 4000, // $4
        cards: 5,
        possibleCards: [2, 3, 4],
        name: '5-Card Pack'
      },
      PACK_20: { 
        price: 14000, // $14
        cards: 20,
        possibleCards: [3, 4, 5],
        name: '20-Card Pack'
      },
      PACK_50: { 
        price: 30000, // $30
        cards: 50,
        possibleCards: [4, 5, 6],
        name: '50-Card Pack'
      },
    },

    // GOLD SYSTEM
    GOLD: {
      CONVERSION_RATE: 1000, // 1000 gold = $1 worth of tokens
      DAILY_PRODUCTION_MULTIPLIER: 1, // Card ATK = daily gold
    },

    // TOURNAMENT TICKETS
    TICKETS: {
      TICKET_1: { price: 500, quantity: 1, priceInUSD: 0.5 },    // $0.5 in tokens
      TICKET_10: { price: 4000, quantity: 10, priceInUSD: 4 },   // $4 in tokens
      TICKET_50: { price: 18000, quantity: 50, priceInUSD: 18 }, // $18 in tokens
      TICKET_100: { price: 30000, quantity: 100, priceInUSD: 30 }, // $30 in tokens
    },

    // VIP SYSTEM
    VIP: {
      MONTHLY_FEE: 10, // $10 in TON
      DISCOUNT: 0.20, // 20% discount
      GOLD_BOOST: 0.20, // 20% more gold
      POINTS_BOOST: 0.20, // 20% more points
    },

    // CARD UPGRADE SYSTEM
    UPGRADE: {
      SUCCESS_CHANCE: 0.30, // 30%
      BASE_COST: 100, // First upgrade = 100 gold
      COST_INCREASE_PER_LEVEL: 0.20, // 20% increase per level
    },

    // TOKEN ECONOMY
    TOKENS: {
      TOTAL_SUPPLY: 1000000000,
      INITIAL_LIQUIDITY: 10000000, // 10M tokens
      INITIAL_LIQUIDITY_VALUE: 1000, // $1000
      WEEKLY_REWARDS: 500000,
      MONTHLY_REWARDS: 2000000,
      YEARLY_REWARDS: 30000000,
      ANNUAL_DECREASE: 0.10, // 10% decrease per year
      MIN_TOKEN_VALUE: 1, // 1 point = min 1 token
      MAX_TOKEN_VALUE: 10, // 1 point = max 10 tokens
      MIN_WITHDRAWAL: 10000, // Minimum 10,000 tokens to withdraw
    },

    // POINTS SYSTEM
    POINTS: {
      TOURNAMENT_ENTRY: 100,
      UPGRADE_ATTEMPT: 10,
      UPGRADE_SUCCESS: 20,
    },

    // CLAN SYSTEM
    CLAN: {
      CREATION_COST: 50, // 50 TON
      INITIAL_CAPACITY: 30,
      UPGRADE_COST: 5, // 5 TON per upgrade
      CAPACITY_INCREASE: 10, // +10 members per upgrade
      MONTHLY_MEMBERSHIP: 2, // 2 TON per month
      FOUNDER_TICKETS: 10, // Free tickets per month
      MEMBER_TICKETS: 5, // Free tickets per month
      MEMBER_REWARD_BOOST: 0.10, // 10% more rewards
      LEADER_REWARD_BOOST: 0.20, // 20% more rewards
      FREE_MEMBERS_PER_MONTH: 5,
    },
  }
};