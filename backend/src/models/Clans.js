const mongoose = require('mongoose');

const ClanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Clan name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Clan name must be at least 3 characters'],
    maxlength: [50, 'Clan name cannot exceed 50 characters']
  },
  
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  icon: {
    type: String,
    default: '🛡️'
  },
  
  color: {
    type: String,
    default: '#9333ea'
  },
  
  // Leadership
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  elders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['Leader', 'Elder', 'Member'],
      default: 'Member'
    },
    contribution: {
      type: Number,
      default: 0
    }
  }],
  
  maxMembers: {
    type: Number,
    default: 50,
    max: 100
  },
  
  // Stats
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
  
  totalPower: {
    type: Number,
    default: 0
  },
  
  totalWins: {
    type: Number,
    default: 0
  },
  
  totalBattles: {
    type: Number,
    default: 0
  },
  
  treasury: {
    gold: {
      type: Number,
      default: 0
    },
    gems: {
      type: Number,
      default: 0
    }
  },
  
  // Requirements
  requiredLevel: {
    type: Number,
    default: 1
  },
  
  isOpen: {
    type: Boolean,
    default: true
  },
  
  joinRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Chat/Announcements
  announcements: [{
    title: String,
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  }],
  
  // Perks
  perks: [{
    name: String,
    description: String,
    requiredLevel: Number,
    bonusGold: {
      type: Number,
      default: 0
    },
    bonusXP: {
      type: Number,
      default: 0
    }
  }],
  
  // War Records
  wars: [{
    opponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clan'
    },
    result: {
      type: String,
      enum: ['win', 'loss', 'draw']
    },
    score: {
      our: Number,
      opponent: Number
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  disbandedAt: {
    type: Date,
    default: null
  }
});

// Index for queries
ClanSchema.index({ name: 1 });
ClanSchema.index({ leader: 1 });
ClanSchema.index({ totalPower: -1 });
ClanSchema.index({ 'members.userId': 1 });

// Virtual for member count
ClanSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for average member level
ClanSchema.virtual('averageMemberLevel').get(function() {
  if (this.members.length === 0) return 0;
  return this.members.reduce((sum, member) => sum + (member.level || 1), 0) / this.members.length;
});

// Method to add member
ClanSchema.methods.addMember = function(userId, role = 'Member') {
  if (this.members.length >= this.maxMembers) {
    throw new Error('Clan is full');
  }
  
  this.members.push({
    userId,
    joinedAt: new Date(),
    role
  });
  
  return this;
};

// Method to remove member
ClanSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
  return this;
};

// Method to update member role
ClanSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  if (member) {
    member.role = newRole;
  }
  return this;
};

// Method to add to treasury
ClanSchema.methods.addToTreasury = function(gold = 0, gems = 0) {
  this.treasury.gold += gold;
  this.treasury.gems += gems;
  return this;
};

// Method to withdraw from treasury
ClanSchema.methods.withdrawFromTreasury = function(gold = 0, gems = 0) {
  if (this.treasury.gold < gold || this.treasury.gems < gems) {
    throw new Error('Insufficient treasury funds');
  }
  this.treasury.gold -= gold;
  this.treasury.gems -= gems;
  return this;
};

// Method to check level up
ClanSchema.methods.checkLevelUp = function() {
  const expPerLevel = 1000;
  const newLevel = Math.floor(this.experience / expPerLevel) + 1;
  
  if (newLevel > this.level && newLevel <= 100) {
    this.level = newLevel;
    return true;
  }
  return false;
};

// Method to add war record
ClanSchema.methods.addWarRecord = function(opponentId, result, ourScore, opponentScore) {
  this.wars.push({
    opponent: opponentId,
    result,
    score: {
      our: ourScore,
      opponent: opponentScore
    },
    date: new Date()
  });
  
  if (result === 'win') {
    this.totalWins += 1;
  }
  this.totalBattles += 1;
  
  return this;
};

module.exports = mongoose.model('Clan', ClanSchema);