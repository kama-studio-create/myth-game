const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { authenticate } = require('../middleware/auth');

// Enter tournament
router.post('/enter', authenticate, tournamentController.enterTournament);

// Get current tournaments
router.get('/active', tournamentController.getActiveTournaments);

// Get leaderboard
router.get('/leaderboard/:type', tournamentController.getLeaderboard);

// Get user tournament stats
router.get('/stats/:userId', authenticate, tournamentController.getUserStats);

// Record match result
router.post('/match-result', authenticate, tournamentController.recordMatchResult);

module.exports = router;
