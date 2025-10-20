const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, level } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (level) filter.requiredLevel = { $lte: parseInt(level) };

    const tournaments = await Tournament.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: -1 })
      .populate('participants', 'username level')
      .populate('winner', 'username');

    const total = await Tournament.countDocuments(filter);

    res.json({
      success: true,
      data: tournaments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active tournaments
router.get('/active/list', async (req, res) => {
  try {
    const activeTournaments = await Tournament.find({
      status: { $in: ['registration', 'ongoing'] }
    })
      .select('name description entryFee prizePool maxParticipants status startDate format')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: activeTournaments,
      count: activeTournaments.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get completed tournaments
router.get('/completed/list', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const completedTournaments = await Tournament.find({
      status: 'completed'
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ endDate: -1 })
      .populate('winner', 'username');

    const total = await Tournament.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      data: completedTournaments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tournament by ID
router.get('/:tournamentId', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('participants', 'username level rating')
      .populate('winner', 'username')
      .populate('matches');

    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new tournament (admin only)
router.post('/create', auth, async (req, res) => {
  try {
    const { name, description, entryFee, prizePool, maxParticipants, startDate, format, requiredLevel } = req.body;

    const tournament = new Tournament({
      name,
      description,
      entryFee,
      prizePool,
      maxParticipants,
      startDate: new Date(startDate),
      format,
      requiredLevel,
      status: 'registration',
      organizer: req.userId,
      participants: [],
      matches: [],
      createdAt: new Date()
    });

    await tournament.save();

    res.status(201).json({
      success: true,
      data: tournament,
      message: 'Tournament created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register for tournament
router.post('/:tournamentId/register', auth, async (req, res) => {
  try {
    const { deckId } = req.body;

    const tournament = await Tournament.findById(req.params.tournamentId);
    const user = await User.findById(req.userId);

    if (!tournament || !user) {
      return res.status(404).json({ success: false, error: 'Tournament or user not found' });
    }

    // Check if registration is open
    if (tournament.status !== 'registration') {
      return res.status(400).json({ success: false, error: 'Registration is closed' });
    }

    // Check max participants
    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ success: false, error: 'Tournament is full' });
    }

    // Check level requirement
    if (user.level < tournament.requiredLevel) {
      return res.status(400).json({ success: false, error: 'Level requirement not met' });
    }

    // Check if already registered
    if (tournament.participants.includes(req.userId)) {
      return res.status(400).json({ success: false, error: 'Already registered' });
    }

    // Check entry fee
    if (user.gold < tournament.entryFee) {
      return res.status(400).json({ success: false, error: 'Insufficient gold' });
    }

    // Deduct entry fee
    user.gold -= tournament.entryFee;
    await user.save();

    // Add participant
    tournament.participants.push(req.userId);
    await tournament.save();

    res.json({
      success: true,
      data: tournament,
      message: `Successfully registered for ${tournament.name}!`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unregister from tournament
router.post('/:tournamentId/unregister', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    // Check if user is registered
    if (!tournament.participants.includes(req.userId)) {
      return res.status(400).json({ success: false, error: 'Not registered for this tournament' });
    }

    // Check if tournament has not started
    if (tournament.status !== 'registration') {
      return res.status(400).json({ success: false, error: 'Cannot unregister after tournament starts' });
    }

    // Refund entry fee
    const user = await User.findById(req.userId);
    user.gold += tournament.entryFee;
    await user.save();

    // Remove participant
    tournament.participants = tournament.participants.filter(p => p.toString() !== req.userId);
    await tournament.save();

    res.json({
      success: true,
      data: tournament,
      message: 'Successfully unregistered'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start tournament
router.post('/:tournamentId/start', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    if (tournament.status !== 'registration') {
      return res.status(400).json({ success: false, error: 'Tournament already started' });
    }

    tournament.status = 'ongoing';
    tournament.startDate = new Date();
    await tournament.save();

    res.json({
      success: true,
      data: tournament,
      message: 'Tournament started'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// End tournament
router.post('/:tournamentId/end', auth, async (req, res) => {
  try {
    const { winnerId, prizeDistribution } = req.body;

    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    if (tournament.status !== 'ongoing') {
      return res.status(400).json({ success: false, error: 'Tournament is not ongoing' });
    }

    tournament.status = 'completed';
    tournament.winner = winnerId;
    tournament.endDate = new Date();

    // Distribute prizes
    if (prizeDistribution && Array.isArray(prizeDistribution)) {
      for (const prize of prizeDistribution) {
        const user = await User.findById(prize.userId);
        if (user) {
          user.gold += prize.gold;
          user.stats.tournamentsWon = (user.stats.tournamentsWon || 0) + (prize.placement === 1 ? 1 : 0);
          await user.save();
        }
      }
    }

    await tournament.save();

    res.json({
      success: true,
      data: tournament,
      message: 'Tournament ended and prizes distributed'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's tournament history
router.get('/user/:userId/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const tournaments = await Tournament.find({
      participants: req.params.userId
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: -1 })
      .populate('winner', 'username');

    const total = await Tournament.countDocuments({
      participants: req.params.userId
    });

    res.json({
      success: true,
      data: tournaments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get tournament leaderboard
router.get('/:tournamentId/leaderboard', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate({
        path: 'participants',
        select: 'username level rating stats'
      });

    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    // Sort participants by rating
    const leaderboard = tournament.participants
      .sort((a, b) => b.rating - a.rating)
      .map((user, index) => ({
        rank: index + 1,
        username: user.username,
        level: user.level,
        rating: user.rating,
        wins: user.stats?.wins || 0
      }));

    res.json({
      success: true,
      data: leaderboard,
      tournament: {
        name: tournament.name,
        status: tournament.status,
        prizePool: tournament.prizePool,
        format: tournament.format
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;