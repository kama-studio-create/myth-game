const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Battle = require('../models/Battle');
const Clan = require('../models/Clan');

// Get global leaderboard by rating
router.get('/rating', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const leaderboard = await User.find()
      .select('username level rating stats avatar clan')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1 })
      .lean();

    // Add rank to each user
    const rankedUsers = leaderboard.map((user, index) => ({
      ...user,
      rank: (page - 1) * limit + index + 1
    }));

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: rankedUsers,
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

// Get leaderboard by wins
router.get('/wins', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const leaderboard = await User.find()
      .select('username level stats avatar clan')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'stats.wins': -1 })
      .lean();

    const rankedUsers = leaderboard.map((user, index) => ({
      ...user,
      rank: (page - 1) * limit + index + 1,
      winRate: user.stats.totalBattles > 0 
        ? ((user.stats.wins / user.stats.totalBattles) * 100).toFixed(2)
        : 0
    }));

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: rankedUsers,
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

// Get leaderboard by gold
router.get('/wealth', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const leaderboard = await User.find()
      .select('username level gold avatar clan')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ gold: -1 })
      .lean();

    const rankedUsers = leaderboard.map((user, index) => ({
      ...user,
      rank: (page - 1) * limit + index + 1
    }));

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: rankedUsers,
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

// Get leaderboard by level
router.get('/level', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const leaderboard = await User.find()
      .select('username level experience avatar clan')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ level: -1, experience: -1 })
      .lean();

    const rankedUsers = leaderboard.map((user, index) => ({
      ...user,
      rank: (page - 1) * limit + index + 1
    }));

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: rankedUsers,
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

// Get user's rank across different categories
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get ranks
    const ratingRank = await User.countDocuments({ rating: { $gt: user.rating } });
    const winsRank = await User.countDocuments({ 'stats.wins': { $gt: user.stats.wins } });
    const goldRank = await User.countDocuments({ gold: { $gt: user.gold } });
    const levelRank = await User.countDocuments({ 
      $or: [
        { level: { $gt: user.level } },
        { level: user.level, experience: { $gt: user.experience } }
      ]
    });

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          level: user.level,
          rating: user.rating,
          gold: user.gold,
          stats: user.stats
        },
        ranks: {
          byRating: ratingRank + 1,
          byWins: winsRank + 1,
          byWealth: goldRank + 1,
          byLevel: levelRank + 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get top clans
router.get('/clans/top', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const topClans = await Clan.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ totalPower: -1 })
      .populate('leader', 'username')
      .lean();

    const rankedClans = topClans.map((clan, index) => ({
      ...clan,
      rank: (page - 1) * limit + index + 1
    }));

    const total = await Clan.countDocuments();

    res.json({
      success: true,
      data: rankedClans,
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

// Get seasonal leaderboard
router.get('/season/:season', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const { season } = req.params;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const leaderboard = await User.find({
      'stats.updatedAt': { $gte: startDate }
    })
      .select('username level rating stats avatar clan')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1 })
      .lean();

    const rankedUsers = leaderboard.map((user, index) => ({
      ...user,
      rank: (page - 1) * limit + index + 1,
      seasonSeason: season
    }));

    const total = await User.countDocuments({
      'stats.updatedAt': { $gte: startDate }
    });

    res.json({
      success: true,
      data: rankedUsers,
      season,
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

// Get leaderboard stats overview
router.get('/stats/overview', async (req, res) => {
  try {
    const totalPlayers = await User.countDocuments();
    const totalBattles = await Battle.countDocuments();
    
    const topPlayer = await User.findOne()
      .select('username rating level')
      .sort({ rating: -1 })
      .lean();

    const highestLevel = await User.findOne()
      .select('username level')
      .sort({ level: -1 })
      .lean();

    const richestPlayer = await User.findOne()
      .select('username gold')
      .sort({ gold: -1 })
      .lean();

    const avgLevel = await User.aggregate([
      { $group: { _id: null, avgLevel: { $avg: '$level' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalPlayers,
        totalBattles,
        topPlayer,
        highestLevel,
        richestPlayer,
        averageLevel: avgLevel[0]?.avgLevel || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search leaderboard by username
router.get('/search/:username', async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.username, $options: 'i' }
    })
      .select('username level rating gold avatar clan stats')
      .limit(20)
      .lean();

    // Get ranks for each found user
    const usersWithRanks = await Promise.all(
      users.map(async (user) => {
        const ratingRank = await User.countDocuments({ rating: { $gt: user.rating } });
        return {
          ...user,
          rank: ratingRank + 1
        };
      })
    );

    res.json({
      success: true,
      data: usersWithRanks,
      count: usersWithRanks.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;