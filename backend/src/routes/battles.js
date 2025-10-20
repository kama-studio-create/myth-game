const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Battle = require('../models/Battle');
const User = require('../models/User');
const battleService = require('../services/battleService');
const rewardService = require('../services/rewardService');

// Start a new battle
router.post('/start', auth, async (req, res) => {
  try {
    const { opponentId, deckId, battleType = 'quick' } = req.body;

    // Validate opponent
    const opponent = await User.findById(opponentId);
    if (!opponent) {
      return res.status(404).json({ success: false, error: 'Opponent not found' });
    }

    // Create battle
    const battle = new Battle({
      player1: req.userId,
      player2: opponentId,
      deckId,
      battleType,
      status: 'ongoing',
      startedAt: new Date(),
      player1Deck: [], // Will be populated from user's deck
      player2Deck: [] // Will be populated from opponent's deck
    });

    await battle.save();

    // Populate with actual deck data
    const populatedBattle = await Battle.findById(battle._id)
      .populate('player1', 'username level rating')
      .populate('player2', 'username level rating');

    res.status(201).json({
      success: true,
      data: populatedBattle,
      message: 'Battle started successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get battle by ID
router.get('/:battleId', auth, async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.battleId)
      .populate('player1', 'username level rating')
      .populate('player2', 'username level rating');

    if (!battle) {
      return res.status(404).json({ success: false, error: 'Battle not found' });
    }

    res.json({
      success: true,
      data: battle
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's battle history
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const battles = await Battle.find({
      $or: [
        { player1: req.params.userId },
        { player2: req.params.userId }
      ]
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('player1', 'username level')
      .populate('player2', 'username level');

    const total = await Battle.countDocuments({
      $or: [
        { player1: req.params.userId },
        { player2: req.params.userId }
      ]
    });

    res.json({
      success: true,
      data: battles,
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

// End battle and calculate rewards
router.post('/:battleId/end', auth, async (req, res) => {
  try {
    const { winnerId, loserStats, winnerStats } = req.body;

    const battle = await Battle.findById(req.params.battleId);
    if (!battle) {
      return res.status(404).json({ success: false, error: 'Battle not found' });
    }

    // Update battle status
    battle.status = 'completed';
    battle.winner = winnerId;
    battle.endedAt = new Date();

    // Calculate rewards
    const isPlayer1Winner = winnerId === battle.player1.toString();
    const winner = await User.findById(winnerId);
    const loser = await User.findById(isPlayer1Winner ? battle.player2 : battle.player1);

    if (!winner || !loser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get rewards from service
    const rewards = await rewardService.calculateBattleRewards(
      winner,
      loser,
      battle.battleType
    );

    // Update winner
    winner.gold += rewards.winnerGold;
    winner.tokens += rewards.winnerTokens;
    winner.stats.wins += 1;
    winner.stats.totalBattles += 1;
    winner.stats.winStreak = (winner.stats.winStreak || 0) + 1;
    if (winner.stats.winStreak > winner.stats.bestWinStreak) {
      winner.stats.bestWinStreak = winner.stats.winStreak;
    }
    winner.rating += rewards.ratingChange;

    // Update loser
    loser.gold += rewards.loserGold;
    loser.tokens += rewards.loserTokens;
    loser.stats.losses += 1;
    loser.stats.totalBattles += 1;
    loser.stats.winStreak = 0;
    loser.rating = Math.max(loser.rating + rewards.loserRatingChange, 0);

    await winner.save();
    await loser.save();
    await battle.save();

    res.json({
      success: true,
      data: {
        battle,
        winnerRewards: rewards,
        winner: { username: winner.username, gold: winner.gold, tokens: winner.tokens },
        loser: { username: loser.username, gold: loser.gold, tokens: loser.tokens }
      },
      message: 'Battle ended and rewards distributed'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get battle statistics
router.get('/:userId/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const totalBattles = user.stats.totalBattles || 0;
    const wins = user.stats.wins || 0;
    const losses = user.stats.losses || 0;
    const winRate = totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalBattles,
        wins,
        losses,
        winRate: `${winRate}%`,
        winStreak: user.stats.winStreak || 0,
        bestWinStreak: user.stats.bestWinStreak || 0,
        rating: user.rating,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simulate battle (for testing/quick matches)
router.post('/simulate', auth, async (req, res) => {
  try {
    const { opponentLevel = 10, battleType = 'quick' } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Simulate battle outcome
    const result = battleService.simulateBattle(user.level, opponentLevel);

    // Create battle record
    const battle = new Battle({
      player1: req.userId,
      player2: null, // AI opponent
      battleType,
      status: 'completed',
      winner: result.playerWins ? req.userId : null,
      startedAt: new Date(),
      endedAt: new Date(),
      isSimulation: true
    });

    await battle.save();

    // Award rewards if player won
    if (result.playerWins) {
      const rewards = await rewardService.calculateBattleRewards(user, null, battleType);
      user.gold += rewards.winnerGold;
      user.tokens += rewards.winnerTokens;
      user.stats.wins += 1;
      user.stats.totalBattles += 1;
      user.rating += rewards.ratingChange;
      await user.save();
    } else {
      user.stats.losses += 1;
      user.stats.totalBattles += 1;
      user.stats.winStreak = 0;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        result: result.playerWins ? 'WIN' : 'LOSS',
        rewards: result.playerWins ? await rewardService.calculateBattleRewards(user, null, battleType) : null,
        battle
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;