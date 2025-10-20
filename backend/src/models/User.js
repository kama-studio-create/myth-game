const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: '🎮'
  },
  
  // Game Stats
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  experience: {
    type: Number,
    default: 0
  },
  
  // Currency
  gold: {
    type: Number,
    default: 1000,
    min: 0
  },
  gems: {
    type: Number,
    default: 100,
    min: 0
  },
  tokens: {
    type: Number,
    default: 100,
    min: 0
  },
  
  // Battle Stats
  rating: {
    type: Number,
    default: 1000
  },
  rank: {
    type: String,
    default: 'Bronze',
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Legendary']
  },
  stats: {
    totalBattles: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    winStreak: {
      type: Number,
      default: 0
    },
    bestWinStreak: {
      type: Number,
      default: 0
    },
    tournamentsWon: {
      type: Number,
      default: 0
    },
    totalGoldEarned: {
      type: Number,
      default: 0
    },
    cardsCollected: {
      type: Number,
      default: 0
    },
    tokensEarned: {
      type: Number,
      default: 0
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Clan
  clan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clan',
    default: null
  },
  clanRole: {
    type: String,
    enum: ['Leader', 'Elder', 'Member'],
    default: 'Member'
  },
  
  // Cards
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  
  // Decks
  decks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck'
  }],
  
  // Inventory
  inventory: [{
    itemId: mongoose.Schema.Types.ObjectId,
    quantity: Number
  }],
  
  // Daily Rewards
  lastDailyRewardClaim: {
    type: Date,
    default: null
  },
  dailyRewardStreak: {
    type: Number,
    default: 0
  },
  
  // Account Info
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  
  // Preferences
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de']
  },
  notifications: {
    type: Boolean,
    default: true
  },
  privateProfile: {
    type: Boolean,
    default: false
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update level based on experience
UserSchema.methods.checkLevelUp = function() {
  const expPerLevel = 500;
  const newLevel = Math.floor(this.experience / expPerLevel) + 1;
  
  if (newLevel > this.level) {
    const levelUpCount = newLevel - this.level;
    this.level = newLevel;
    this.gold += 500 * levelUpCount; // Bonus gold for level up
    return true;
  }
  return false;
};

// Method to update rank based on rating
UserSchema.methods.updateRank = function() {
  const rankThresholds = {
    'Bronze': 0,
    'Silver': 1200,
    'Gold': 1500,
    'Platinum': 1800,
    'Diamond': 2100,
    'Master': 2500,
    'Legendary': 3000
  };

  for (const [rank, threshold] of Object.entries(rankThresholds)) {
    if (this.rating >= threshold) {
      this.rank = rank;
    }
  }
};

// Method to calculate win rate
UserSchema.methods.getWinRate = function() {
  if (this.stats.totalBattles === 0) return 0;
  return ((this.stats.wins / this.stats.totalBattles) * 100).toFixed(2);
};

// Virtual for total value
UserSchema.virtual('totalValue').get(function() {
  return this.gold + this.gems + this.tokens;
});

module.exports = mongoose.model('User', UserSchema);