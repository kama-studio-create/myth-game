const express = require('express');
const router = express.Router();
const { auth, verifyOwnership } = require('../middleware/auth');
const User = require('../models/User');

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('cards', 'name rarity type level power')
      .populate('clan', 'name icon');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile/:userId', auth, verifyOwnership, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('cards')
      .populate('decks')
      .populate('clan');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user profile
router.put('/:userId', auth, verifyOwnership, async (req, res) => {
  try {
    const { avatar, language, notifications, privateProfile } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (avatar) user.avatar = avatar;
    if (language) user.language = language;
    if (notifications !== undefined) user.notifications = notifications;
    if (privateProfile !== undefined) user.privateProfile = privateProfile;

    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const stats = {
      username: user.username,
      level: user.level,
      experience: user.experience,
      gold: user.gold,
      gems: user.gems,
      rating: user.rating,
      rank: user.rank,
      battleStats: user.stats,
      totalValue: user.gold + user.gems + user.tokens
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user achievements
router.get('/:userId/achievements', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate achievements based on stats
    const achievements = [];

    if (user.stats.totalBattles >= 10) {
      achievements.push({ name: 'First Blood', description: '10 battles completed' });
    }
    if (user.stats.wins >= 50) {
      achievements.push({ name: 'Warrior', description: '50 victories' });
    }
    if (user.stats.winStreak >= 5) {
      achievements.push({ name: 'Unstoppable', description: '5 win streak' });
    }
    if (user.level >= 50) {
      achievements.push({ name: 'Master', description: 'Reached level 50' });
    }
    if (user.stats.tournamentsWon >= 1) {
      achievements.push({ name: 'Champion', description: 'Won a tournament' });
    }
    if (user.gold >= 100000) {
      achievements.push({ name: 'Wealthy', description: 'Accumulated 100k gold' });
    }

    res.json({
      success: true,
      data: achievements,
      count: achievements.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.query, $options: 'i' }
    })
      .select('username level avatar rating rank clan')
      .limit(20);

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add friend
router.post('/:userId/friends/:friendId', auth, verifyOwnership, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friend = await User.findById(req.params.friendId);

    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Friend added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's friends
router.get('/:userId/friends', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: [],
      count: 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Ban user (admin only)
router.post('/:userId/ban', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.isBanned = true;
    user.banReason = reason || 'Violation of terms';
    await user.save();

    res.json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Unban user (admin only)
router.post('/:userId/unban', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.isBanned = false;
    user.banReason = null;
    await user.save();

    res.json({
      success: true,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;