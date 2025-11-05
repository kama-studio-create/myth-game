// backend/src/models/CardSupply.js
const mongoose = require('mongoose');

const CardSupplySchema = new mongoose.Schema({
  totalMinted: {
    type: Number,
    default: 0,
    max: 1000000
  },
  dailyMintsByUser: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: Number,
    date: Date
  }],
  lastResetDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CardSupply', CardSupplySchema);