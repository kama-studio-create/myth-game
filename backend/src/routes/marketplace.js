const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Card = require('../models/Card');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const marketplaceService = require('../services/marketplaceService');

// Get marketplace listings
router.get('/listings', async (req, res) => {
  try {
    const { page = 1, limit = 20, rarity, type, minPrice, maxPrice, sortBy = 'newest' } = req.query;

    const filter = { forSale: true };
    if (rarity) filter.rarity = rarity;
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.salePrice.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      priceHigh: { salePrice: -1 },
      priceLow: { salePrice: 1 },
      power: { power: -1 }
    };

    const listings = await Card.find(filter)
      .populate('owner', 'username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions[sortBy] || sortOptions.newest);

    const total = await Card.countDocuments(filter);

    res.json({
      success: true,
      data: listings,
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

// Get user's listings
router.get('/my-listings/:userId', auth, async (req, res) => {
  try {
    const listings = await Card.find({
      owner: req.params.userId,
      forSale: true
    }).populate('owner', 'username');

    res.json({
      success: true,
      data: listings,
      count: listings.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List card for sale
router.post('/list', auth, async (req, res) => {
  try {
    const { cardId, price } = req.body;

    if (!cardId || !price) {
      return res.status(400).json({ success: false, error: 'Card ID and price are required' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    // Check ownership
    if (card.owner.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'You do not own this card' });
    }

    // Update card
    card.forSale = true;
    card.salePrice = price;
    await card.save();

    // Create transaction record
    const transaction = new Transaction({
      type: 'listing',
      seller: req.userId,
      card: cardId,
      price,
      status: 'pending'
    });

    await transaction.save();

    res.json({
      success: true,
      data: card,
      message: 'Card listed for sale successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buy card from marketplace
router.post('/buy', auth, async (req, res) => {
  try {
    const { cardId } = req.body;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    if (!card.forSale) {
      return res.status(400).json({ success: false, error: 'Card is not for sale' });
    }

    const buyer = await User.findById(req.userId);
    const seller = await User.findById(card.owner);

    if (buyer.gold < card.salePrice) {
      return res.status(400).json({ success: false, error: 'Insufficient gold' });
    }

    // Transfer card and gold
    buyer.gold -= card.salePrice;
    seller.gold += card.salePrice * 0.95; // 5% marketplace fee

    card.owner = req.userId;
    card.forSale = false;
    card.salePrice = 0;

    // Create transaction record
    const transaction = new Transaction({
      type: 'purchase',
      buyer: req.userId,
      seller: card.owner,
      card: cardId,
      price: card.salePrice,
      status: 'completed'
    });

    await buyer.save();
    await seller.save();
    await card.save();
    await transaction.save();

    res.json({
      success: true,
      data: { card, buyer, seller },
      message: 'Card purchased successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove listing
router.delete('/unlist/:cardId', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    if (card.owner.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'You do not own this card' });
    }

    card.forSale = false;
    card.salePrice = 0;
    await card.save();

    res.json({
      success: true,
      data: card,
      message: 'Listing removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get market stats
router.get('/stats/overview', async (req, res) => {
  try {
    const totalListings = await Card.countDocuments({ forSale: true });
    const averagePrice = await Card.aggregate([
      { $match: { forSale: true } },
      { $group: { _id: null, avgPrice: { $avg: '$salePrice' } } }
    ]);

    const top5Expensive = await Card.find({ forSale: true })
      .sort({ salePrice: -1 })
      .limit(5);

    const top5Cheapest = await Card.find({ forSale: true })
      .sort({ salePrice: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalListings,
        averagePrice: averagePrice[0]?.avgPrice || 0,
        top5Expensive,
        top5Cheapest
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction history
router.get('/transactions/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const transactions = await Transaction.find({
      $or: [
        { buyer: req.params.userId },
        { seller: req.params.userId }
      ]
    })
      .populate('buyer', 'username')
      .populate('seller', 'username')
      .populate('card', 'name rarity type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Transaction.countDocuments({
      $or: [
        { buyer: req.params.userId },
        { seller: req.params.userId }
      ]
    });

    res.json({
      success: true,
      data: transactions,
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

// Get card price history
router.get('/price-history/:cardId', async (req, res) => {
  try {
    const transactions = await Transaction.find({
      card: req.params.cardId,
      type: 'purchase'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;