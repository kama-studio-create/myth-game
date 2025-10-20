const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Card = require('../models/Card');
const Transaction = require('../models/Transaction');
const nftService = require('../services/nftService');

// Mint new NFT card
router.post('/mint', auth, async (req, res) => {
  try {
    const { cardData, cost = 200 } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check token balance
    if (user.tokens < cost) {
      return res.status(400).json({ success: false, error: 'Insufficient tokens' });
    }

    // Create NFT card
    const nftCard = await nftService.mintNFTCard(cardData, req.userId);

    // Deduct tokens
    user.tokens -= cost;
    user.stats.cardsCollected = (user.stats.cardsCollected || 0) + 1;
    await user.save();

    // Add card to user's collection
    await User.findByIdAndUpdate(req.userId, {
      $push: { cards: nftCard._id }
    });

    res.status(201).json({
      success: true,
      data: nftCard,
      message: `NFT Card minted successfully! (Cost: ${cost} tokens)`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's NFT collection
router.get('/collection/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(req.params.userId).populate({
      path: 'cards',
      options: {
        limit: limit * 1,
        skip: (page - 1) * limit,
        sort: { createdAt: -1 }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const total = user.cards.length;

    res.json({
      success: true,
      data: user.cards,
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

// Get NFT by token ID
router.get('/:nftId', async (req, res) => {
  try {
    const nft = await Card.findOne({ nftId: req.params.nftId });

    if (!nft) {
      return res.status(404).json({ success: false, error: 'NFT not found' });
    }

    // Get transaction history
    const transactions = await Transaction.find({ card: nft._id })
      .populate('buyer', 'username')
      .populate('seller', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        nft,
        transactionHistory: transactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upgrade NFT card
router.post('/:cardId/upgrade', auth, async (req, res) => {
  try {
    const { upgradeCost = 100 } = req.body;

    const user = await User.findById(req.userId);
    const card = await Card.findById(req.params.cardId);

    if (!user || !card) {
      return res.status(404).json({ success: false, error: 'User or card not found' });
    }

    // Check ownership
    if (card.owner.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'You do not own this card' });
    }

    // Calculate actual upgrade cost based on level
    const actualCost = upgradeCost * (card.level || 1);

    if (user.tokens < actualCost) {
      return res.status(400).json({ success: false, error: 'Insufficient tokens for upgrade' });
    }

    // Upgrade card stats
    const upgradedCard = await nftService.upgradeCard(card, actualCost);

    // Deduct tokens
    user.tokens -= actualCost;
    await user.save();

    res.json({
      success: true,
      data: upgradedCard,
      message: `Card upgraded to Level ${upgradedCard.level}! (Cost: ${actualCost} tokens)`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trade NFT card
router.post('/trade/:cardId', auth, async (req, res) => {
  try {
    const { buyerId, price } = req.body;

    const card = await Card.findById(req.params.cardId);
    const seller = await User.findById(req.userId);
    const buyer = await User.findById(buyerId);

    if (!card || !seller || !buyer) {
      return res.status(404).json({ success: false, error: 'Card or user not found' });
    }

    // Verify ownership
    if (card.owner.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'You do not own this card' });
    }

    // Check buyer's tokens
    if (buyer.tokens < price) {
      return res.status(400).json({ success: false, error: 'Buyer has insufficient tokens' });
    }

    // Transfer tokens and card
    buyer.tokens -= price;
    seller.tokens += price * 0.95; // 5% platform fee

    card.owner = buyerId;
    card.forSale = false;

    // Create transaction record
    const transaction = new Transaction({
      type: 'nft_trade',
      buyer: buyerId,
      seller: req.userId,
      card: req.params.cardId,
      price,
      status: 'completed'
    });

    await seller.save();
    await buyer.save();
    await card.save();
    await transaction.save();

    res.json({
      success: true,
      data: {
        card,
        transaction,
        seller: { username: seller.username, tokens: seller.tokens },
        buyer: { username: buyer.username, tokens: buyer.tokens }
      },
      message: 'NFT traded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Burn NFT card (remove from circulation)
router.post('/:cardId/burn', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    if (card.owner.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'You do not own this card' });
    }

    // Calculate burn value (50% of card value)
    const burnValue = Math.floor((card.power || 0) * 0.5);

    const user = await User.findById(req.userId);
    user.tokens += burnValue;
    await user.save();

    // Delete card
    await Card.findByIdAndDelete(req.params.cardId);

    // Remove from user's cards
    await User.findByIdAndUpdate(req.userId, {
      $pull: { cards: req.params.cardId }
    });

    res.json({
      success: true,
      data: { burnValue, userTokens: user.tokens },
      message: `Card burned! You received ${burnValue} tokens`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get NFT marketplace stats
router.get('/market/stats', async (req, res) => {
  try {
    const totalNFTs = await Card.countDocuments({ nftId: { $exists: true } });
    const totalForSale = await Card.countDocuments({ forSale: true, nftId: { $exists: true } });
    const avgPrice = await Card.aggregate([
      { $match: { forSale: true, nftId: { $exists: true } } },
      { $group: { _id: null, avgPrice: { $avg: '$salePrice' } } }
    ]);

    const floorPrice = await Card.findOne({ forSale: true, nftId: { $exists: true } })
      .sort({ salePrice: 1 });

    res.json({
      success: true,
      data: {
        totalNFTs,
        totalForSale,
        averagePrice: avgPrice[0]?.avgPrice || 0,
        floorPrice: floorPrice?.salePrice || 0,
        circulation: totalNFTs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get rarest NFTs
router.get('/rare/list', async (req, res) => {
  try {
    const rareCards = await Card.find({ nftId: { $exists: true } })
      .sort({ rarity: -1, power: -1 })
      .limit(50)
      .populate('owner', 'username');

    res.json({
      success: true,
      data: rareCards,
      count: rareCards.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;