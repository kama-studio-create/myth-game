const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Card = require('../models/Card');
const User = require('../models/User');

// Get all cards (with pagination and filtering)
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, rarity, type, level } = req.query;
    
    const filter = {};
    if (rarity) filter.rarity = rarity;
    if (type) filter.type = type;
    if (level) filter.level = { $gte: parseInt(level) };

    const cards = await Card.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Card.countDocuments(filter);

    res.json({
      success: true,
      data: cards,
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

// Get user's cards
router.get('/my-cards', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cards');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: user.cards
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get card by ID
router.get('/:cardId', async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create card (admin only)
router.post('/create', auth, validate, async (req, res) => {
  try {
    const { name, type, rarity, attack, defense, health, ability, image, level } = req.body;

    const newCard = new Card({
      name,
      type,
      rarity,
      attack,
      defense,
      health,
      ability,
      image,
      level,
      createdBy: req.userId,
      power: attack + defense + (health / 2)
    });

    await newCard.save();

    res.status(201).json({
      success: true,
      data: newCard,
      message: 'Card created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update card
router.put('/:cardId', auth, async (req, res) => {
  try {
    const { name, type, rarity, attack, defense, health, ability, image, level } = req.body;

    const card = await Card.findById(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    // Update fields
    if (name) card.name = name;
    if (type) card.type = type;
    if (rarity) card.rarity = rarity;
    if (attack !== undefined) card.attack = attack;
    if (defense !== undefined) card.defense = defense;
    if (health !== undefined) card.health = health;
    if (ability) card.ability = ability;
    if (image) card.image = image;
    if (level) card.level = level;

    // Recalculate power
    card.power = card.attack + card.defense + (card.health / 2);

    await card.save();

    res.json({
      success: true,
      data: card,
      message: 'Card updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete card
router.delete('/:cardId', auth, async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    res.json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get card stats
router.get('/:cardId/stats', async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    res.json({
      success: true,
      data: {
        power: card.power,
        attack: card.attack,
        defense: card.defense,
        health: card.health,
        level: card.level,
        rarity: card.rarity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cards by rarity
router.get('/rarity/:rarity', async (req, res) => {
  try {
    const cards = await Card.find({ rarity: req.params.rarity });

    res.json({
      success: true,
      data: cards,
      count: cards.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cards by type
router.get('/type/:type', async (req, res) => {
  try {
    const cards = await Card.find({ type: req.params.type });

    res.json({
      success: true,
      data: cards,
      count: cards.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search cards
router.get('/search/:query', async (req, res) => {
  try {
    const cards = await Card.find({
      $or: [
        { name: { $regex: req.params.query, $options: 'i' } },
        { ability: { $regex: req.params.query, $options: 'i' } },
        { type: { $regex: req.params.query, $options: 'i' } }
      ]
    });

    res.json({
      success: true,
      data: cards,
      count: cards.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;