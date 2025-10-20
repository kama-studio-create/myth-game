const mongoose = require('mongoose');

const BattleSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for AI battles
  },
  
  player1Deck: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  
  player2Deck: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  
  // Battle Info
  battleType: {
    type: String,
    enum: ['quick', 'ranked', 'tournament', 'clan', 'practice'],
    default: 'quick'
  },
  
  status: {
    type: String,
    enum: ['waiting', 'ongoing', 'completed', 'abandoned'],
    default: 'waiting'
  },
  
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Battle Details
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  endedAt: {
    type: Date,
    default: null
  },
  
  duration: {
    type: Number, // in seconds
    default: 0
  },
  
  // Battle Stats
  player1Stats: {
    health: {
      type: Number,
      default: 100
    },
    damageDealt: {
      type: Number,
      default: 0
    },
    damageTaken: {
      type: Number,
      default: 0
    },
    cardsUsed: {
      type: Number,
      default: 0
    },
    abilities: {
      type: Number,
      default: 0
    },
    dodges: {
      type: Number,
      default: 0
    }
  },
  
  player2Stats: {
    health: {
      type: Number,
      default: 100
    },
    damageDealt: {
      type: Number,
      default: 0
    },
    damageTaken: {
      type: Number,
      default: 0
    },
    cardsUsed: {
      type: Number,
      default: 0
    },
    abilities: {
      type: Number,
      default: 0
    },
    dodges: {
      type: Number,
      default: 0
    }
  },
  
  // Rewards
  player1Reward: {
    gold: {
      type: Number,
      default: 0
    },
    tokens: {
      type: Number,
      default: 0
    },
    experience: {
      type: Number,
      default: 0
    },
    ratingChange: {
      type: Number,
      default: 0
    }
  },
  
  player2Reward: {
    gold: {
      type: Number,
      default: 0
    },
    tokens: {
      type: Number,
      default: 0
    },
    experience: {
      type: Number,
      default: 0
    },
    ratingChange: {
      type: Number,
      default: 0
    }
  },
  
  // Actions/Moves
  battleLog: [{
    timestamp: Date,
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card'
    },
    damage: Number,
    result: String
  }],
  
  // Additional Info
  isSimulation: {
    type: Boolean,
    default: false
  },
  
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    default: null
  },
  
  clanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clan',
    default: null
  },
  
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
BattleSchema.index({ player1: 1, createdAt: -1 });
BattleSchema.index({ player2: 1, createdAt: -1 });
BattleSchema.index({ status: 1 });
BattleSchema.index({ winner: 1 });

// Method to calculate battle duration
BattleSchema.methods.getBattleDuration = function() {
  if (this.endedAt) {
    return Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  return Math.floor((new Date() - this.startedAt) / 1000);
};

// Method to add battle log entry
BattleSchema.methods.addLog = function(player, action, card, damage, result) {
  this.battleLog.push({
    timestamp: new Date(),
    player,
    action,
    card,
    damage,
    result
  });
  return this;
};

// Method to end battle
BattleSchema.methods.endBattle = function(winnerId, player1Stats, player2Stats) {
  this.status = 'completed';
  this.endedAt = new Date();
  this.winner = winnerId;
  this.duration = this.getBattleDuration();
  
  if (player1Stats) {
    this.player1Stats = { ...this.player1Stats, ...player1Stats };
  }
  if (player2Stats) {
    this.player2Stats = { ...this.player2Stats, ...player2Stats };
  }
  
  return this;
};

module.exports = mongoose.model('Battle', BattleSchema);