// backend/src/models/TournamentTicket.js
const mongoose = require('mongoose');

const TournamentTicketSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  earnedFree: {
    type: Number,
    default: 0
  },
  purchasedCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TournamentTicket', TournamentTicketSchema);