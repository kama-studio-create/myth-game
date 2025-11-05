// backend/src/models/EnhancedUser.js - Update existing User model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EnhancedUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  
  // Currency
  gold: {
    type: Number,
    default: 0
  },
  tokens: {
    type: Number,
    default: 0
  },
  
  // VIP Status
  isVIP: {
    type: Boolean,
    default: false
  },
  vipExpiresAt: {
    type: Date,
    default: null
  },
  
  // Tournament
  tournamentTickets: {
    type: Number,
    default: 20 // Free starter tickets
  },
  
  // Points
  weeklyPoints: {
    type: Number,
    default: 0
  },
  monthlyPoints: {
    type: Number,
    default: 0
  },
  yearlyPoints: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  
  // Cards
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameCard'
  }],
  
  // Daily limits
  dailyCardsPurchased: {
    type: Number,
    default: 0
  },
  lastCardPurchaseReset: {
    type: Date,
    default: Date.now
  },
  
  // Clan
  clan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clan',
    default: null
  },
  clanRole: {
    type: String,
    enum: ['founder', 'member'],
    default: 'member'
  },
  clanMembershipExpiresAt: {
    type: Date,
    default: null
  },
  
  // Starter bonus claimed
  starterBonusClaimed: {
    type: Boolean,
    default: false
  },
  
  // Token withdrawal
  totalTokensWithdrawn: {
    type: Number,
    default: 0
  },
  
  // Statistics
  stats: {
    totalBattles: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    upgradeAttempts: { type: Number, default: 0 },
    successfulUpgrades: { type: Number, default: 0 },
    totalGoldEarned: { type: Number, default: 0 },
    totalGoldSpent: { type: Number, default: 0 }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
EnhancedUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
EnhancedUserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Check if VIP is active
EnhancedUserSchema.methods.isVIPActive = function() {
  if (!this.isVIP) return false;
  if (!this.vipExpiresAt) return false;
  return new Date() < this.vipExpiresAt;
};

// Apply VIP discount
EnhancedUserSchema.methods.applyVIPDiscount = function(amount) {
  if (this.isVIPActive()) {
    return Math.floor(amount * 0.8); // 20% discount
  }
  return amount;
};

module.exports = mongoose.model('EnhancedUser', EnhancedUserSchema);