const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
    trim: true
  },
  
  description: {
    type: String,
    default: ''
  },
  
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Tournament Details
  status: {
    type: String,
    enum: ['registration', 'ongoing', 'completed', 'cancelled'],
    default: 'registration'
  },
  
  format: {
    type: String,
    enum: ['single-elimination', 'double-elimination', 'round-robin', 'best-of-3', 'best-of-5'],
    default: 'single-elimination'
  },
  
  // Participants
  maxParticipants: {
    type: Number,
    required: true,
    default: 64
  },
  
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  requiredLevel: {
    type: Number,
    default: 1
  },
  
  // Prize Pool
  entryFee: {
    type: Number,
    default: 0
  },
  
  prizePool: {
    type: Number,
    default: 0
  },
  
  prizes: [{
    placement: Number,
    gold: Number,
    gems: Number,
    tokens: Number
  }],
  
  // Results
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  runnerUp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  thirdPlace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  finalResults: [{
    placement: Number,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reward: {
      gold: Number,
      gems: Number,
      tokens: Number
    }
  }],
  
  // Bracket/Matches
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle'
  }],
  
  bracket: {
    round: Number,
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Battle'
    }
  },
  
  // Schedule
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    default: null
  },
  
  registrationDeadline: {
    type: Date,
    default: null
  },
  
  // Stats
  totalMatches: {
    type: Number,
    default: 0
  },
  
  completedMatches: {
    type: Number,
    default: 0
  },
  
  // Rules
  bestOf: {
    type: Number,
    enum: [1, 3, 5],
    default: 1
  },
  
  minDeckSize: {
    type: Number,
    default: 5
  },
  
  allowedRarities: [{
    type: String,
    enum: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic']
  }],
  
  // Restrictions
  restrictions: {
    minLevel: {
      type: Number,
      default: 1
    },
    maxLevel: {
      type: Number,
      default: 100
    },
    banList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card'
    }]
  },
  
  // Sponsorship/Rewards
  sponsored: {
    type: Boolean,
    default: false
  },
  
  sponsor: {
    name: String,
    icon: String
  },
  
  specialRewards: [{
    name: String,
    icon: String,
    condition: String
  }],
  
  // Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  
  spectatorMode: {
    type: Boolean,
    default: true
  },
  
  streamUrl: {
    type: String,
    default: null
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

// Index for queries
TournamentSchema.index({ status: 1, startDate: -1 });
TournamentSchema.index({ organizer: 1 });
TournamentSchema.index({ 'participants': 1 });
TournamentSchema.index({ winner: 1 });

// Virtual for participant count
TournamentSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for available slots
TournamentSchema.virtual('availableSlots').get(function() {
  return this.maxParticipants - this.participants.length;
});

// Virtual for progress percentage
TournamentSchema.virtual('progressPercentage').get(function() {
  if (this.totalMatches === 0) return 0;
  return Math.floor((this.completedMatches / this.totalMatches) * 100);
});

// Method to add participant
TournamentSchema.methods.addParticipant = function(userId) {
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Tournament is full');
  }
  
  if (this.participants.includes(userId)) {
    throw new Error('User already registered');
  }
  
  this.participants.push(userId);
  return this;
};

// Method to remove participant
TournamentSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.toString() !== userId.toString());
  return this;
};

// Method to check if user is participant
TournamentSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Method to record match
TournamentSchema.methods.recordMatch = function(matchId) {
  this.matches.push(matchId);
  this.totalMatches = this.matches.length;
  return this;
};

// Method to mark match as completed
TournamentSchema.methods.completeMatch = function() {
  this.completedMatches += 1;
  return this;
};

// Method to end tournament
TournamentSchema.methods.endTournament = function(winnerId, runnerUpId, thirdPlaceId) {
  this.status = 'completed';
  this.endDate = new Date();
  this.winner = winnerId;
  this.runnerUp = runnerUpId;
  this.thirdPlace = thirdPlaceId;
  return this;
};

// Method to calculate prize distribution
TournamentSchema.methods.calculatePrizes = function() {
  const totalPrizePool = this.prizePool;
  
  return [
    { placement: 1, percentage: 0.5 }, // 50%
    { placement: 2, percentage: 0.3 }, // 30%
    { placement: 3, percentage: 0.15 }, // 15%
    { placement: 4, percentage: 0.05 }  // 5%
  ].map(prize => ({
    placement: prize.placement,
    gold: Math.floor(totalPrizePool * prize.percentage)
  }));
};

module.exports = mongoose.model('Tournament', TournamentSchema);