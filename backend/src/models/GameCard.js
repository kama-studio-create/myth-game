// backend/src/models/GameCard.js
const mongoose = require('mongoose');

const GameCardSchema = new mongoose.Schema({
  cardNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  atk: {
    type: Number,
    required: true
  },
  def: {
    type: Number,
    required: true
  },
  hp: {
    type: Number,
    required: true
  },
  dailyGoldProduction: {
    type: Number,
    required: true
  },
  lastGoldClaim: {
    type: Date,
    default: Date.now
  },
  mintedAt: {
    type: Date,
    default: Date.now
  },
  upgradeAttempts: {
    type: Number,
    default: 0
  }
});

GameCardSchema.index({ owner: 1 });
GameCardSchema.index({ cardNumber: 1 });

module.exports = mongoose.model('GameCard', GameCardSchema);