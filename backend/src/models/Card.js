const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Card name is required'],
    trim: true
  },
  
  type: {
    type: String,
    required: true,
    enum: ['Warrior', 'Mage', 'Assassin', 'Tank', 'Support'],
    default: 'Warrior'
  },
  
  rarity: {
    type: String,
    required: true,
    enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'],
    default: 'Common'
  },
  
  // Stats
  attack: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 200
  },
  
  defense: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 200
  },
  
  health: {
    type: Number,
    required: true,
    default: 100,
    min: 0,
    max: 500
  },
  
  magic: {
    type: Number,
    default: 0,
    min: 0,
    max: 200
  },
  
  speed: {
    type: Number,
    default: 0,
    min: 0,
    max: 200
  },
  
  // Ability
  ability: {
    name: String,
    description: String,
    cooldown: Number
  },
  
  // Power calculation
  power: {
    type: Number,
    default: 0
  },
  
  // Card Level (can be upgraded)
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 50
  },
  
  // NFT specific fields
  nftId: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Marketplace
  forSale: {
    type: Boolean,
    default: false
  },
  
  salePrice: {
    type: Number,
    default: 0
  },
  
  // NFT Metadata
  blockchain: {
    type: String,
    default: 'Ethereum',
    enum: ['Ethereum', 'Polygon', 'BSC', 'Mock']
  },
  
  contractAddress: {
    type: String,
    default: null
  },
  
  transactionHash: {
    type: String,
    default: null
  },
  
  // Media
  image: {
    type: String,
    default: null
  },
  
  thumbnail: {
    type: String,
    default: null
  },
  
  animation: {
    type: String,
    default: null
  },
  
  // History
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  mintDate: {
    type: Date,
    default: Date.now
  },
  
  upgradedAt: {
    type: Date,
    default: null
  },
  
  upgradeCount: {
    type: Number,
    default: 0
  },
  
  // Rarity drop rate (for generation)
  dropRate: {
    type: Number,
    default: 0
  },
  
  // Metadata
  metadata: {
    attributes: [{
      name: String,
      value: mongoose.Schema.Types.Mixed
    }],
    rarityScore: Number,
    creatorName: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for common queries
CardSchema.index({ owner: 1, forSale: 1 });
CardSchema.index({ rarity: 1, type: 1 });
CardSchema.index({ nftId: 1 });
CardSchema.index({ salePrice: 1 });

// Virtual for card power
CardSchema.virtual('totalStats').get(function() {
  return this.attack + this.defense + this.health + (this.magic || 0) + (this.speed || 0);
});

// Method to calculate power
CardSchema.methods.calculatePower = function() {
  const rarityMultipliers = {
    'Common': 1,
    'Rare': 1.5,
    'Epic': 2,
    'Legendary': 3,
    'Mythic': 5
  };
  
  const baseStats = this.attack + this.defense + (this.health / 2);
  const rarityMultiplier = rarityMultipliers[this.rarity] || 1;
  const levelMultiplier = 1 + (this.level * 0.1);
  
  this.power = Math.floor(baseStats * rarityMultiplier * levelMultiplier);
  return this.power;
};

// Method to upgrade card
CardSchema.methods.upgrade = function() {
  this.level += 1;
  this.attack = Math.floor(this.attack * 1.05);
  this.defense = Math.floor(this.defense * 1.05);
  this.health = Math.floor(this.health * 1.05);
  this.upgradeCount += 1;
  this.upgradedAt = new Date();
  this.calculatePower();
  return this;
};

// Method to list for sale
CardSchema.methods.listForSale = function(price) {
  this.forSale = true;
  this.salePrice = price;
  return this;
};

// Method to remove from sale
CardSchema.methods.removeFromSale = function() {
  this.forSale = false;
  this.salePrice = 0;
  return this;
};

// Middleware to update power on save
CardSchema.pre('save', function(next) {
  if (this.isModified('level') || this.isModified('attack') || this.isModified('defense') || this.isModified('health')) {
    this.calculatePower();
  }
  next();
});

module.exports = mongoose.model('Card', CardSchema);