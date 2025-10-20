const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'sale', 'trade', 'listing', 'nft_trade', 'gift', 'reward', 'penalty'],
    required: true
  },
  
  // Parties involved
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Card involved
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  
  cardDetails: {
    name: String,
    rarity: String,
    type: String,
    level: Number
  },
  
  // Transaction Details
  price: {
    type: Number,
    default: 0
  },
  
  currency: {
    type: String,
    enum: ['gold', 'tokens', 'gems'],
    default: 'gold'
  },
  
  // Platform fee
  platformFee: {
    type: Number,
    default: 0
  },
  
  netAmount: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  
  // Payment method (if applicable)
  paymentMethod: {
    type: String,
    default: 'in-game'
  },
  
  // NFT specific
  nftTransaction: {
    blockchainTxHash: String,
    gasUsed: Number,
    contractAddress: String,
    tokenId: String
  },
  
  // Metadata
  description: String,
  
  notes: String,
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  confirmedAt: {
    type: Date,
    default: null
  },
  
  // References
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  
  marketplace: {
    type: String,
    default: 'in-game'
  },
  
  // Dispute handling
  isDisputed: {
    type: Boolean,
    default: false
  },
  
  disputeReason: String,
  
  disputedAt: Date,
  
  resolvedAt: Date,
  
  resolution: String,
  
  // Additional fields
  taxApplied: {
    type: Number,
    default: 0
  },
  
  bonusApplied: {
    type: Number,
    default: 0
  }
});

// Index for queries
TransactionSchema.index({ buyer: 1, createdAt: -1 });
TransactionSchema.index({ seller: 1, createdAt: -1 });
TransactionSchema.index({ card: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ completedAt: -1 });

// Method to calculate net amount
TransactionSchema.methods.calculateNetAmount = function() {
  let net = this.price - this.platformFee;
  net -= this.taxApplied;
  net += this.bonusApplied;
  this.netAmount = net;
  return this.netAmount;
};

// Method to complete transaction
TransactionSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.calculateNetAmount();
  return this;
};

// Method to fail transaction
TransactionSchema.methods.fail = function(reason) {
  this.status = 'failed';
  this.notes = reason;
  return this;
};

// Method to mark as disputed
TransactionSchema.methods.dispute = function(reason) {
  this.isDisputed = true;
  this.status = 'disputed';
  this.disputeReason = reason;
  this.disputedAt = new Date();
  return this;
};

// Method to resolve dispute
TransactionSchema.methods.resolveDispute = function(resolution) {
  this.resolution = resolution;
  this.resolvedAt = new Date();
  this.isDisputed = false;
  return this;
};

// Middleware to set platform fee
TransactionSchema.pre('save', function(next) {
  if (this.isModified('price') && this.type !== 'gift' && this.type !== 'reward') {
    // 5% platform fee for marketplace transactions
    this.platformFee = Math.floor(this.price * 0.05);
    this.calculateNetAmount();
  }
  next();
});

// Virtual for time elapsed
TransactionSchema.virtual('timeElapsed').get(function() {
  const completedDate = this.completedAt || new Date();
  return Math.floor((completedDate - this.initiatedAt) / 1000); // in seconds
});

// Virtual for total value (including fees)
TransactionSchema.virtual('totalValue').get(function() {
  return this.price + this.platformFee;
});

module.exports = mongoose.model('Transaction', TransactionSchema);