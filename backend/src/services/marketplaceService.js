const Card = require('../models/Card');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

class MarketplaceService {
  /**
   * List card for sale
   */
  async listCard(cardId, price, userId) {
    try {
      const card = await Card.findById(cardId);

      if (!card) {
        throw new Error('Card not found');
      }

      if (card.owner.toString() !== userId.toString()) {
        throw new Error('You do not own this card');
      }

      if (price < 1) {
        throw new Error('Price must be at least 1 gold');
      }

      card.forSale = true;
      card.salePrice = price;
      await card.save();

      return card;
    } catch (error) {
      throw new Error(`Failed to list card: ${error.message}`);
    }
  }

  /**
   * Unlist card from sale
   */
  async unlistCard(cardId, userId) {
    try {
      const card = await Card.findById(cardId);

      if (!card) {
        throw new Error('Card not found');
      }

      if (card.owner.toString() !== userId.toString()) {
        throw new Error('You do not own this card');
      }

      card.forSale = false;
      card.salePrice = 0;
      await card.save();

      return card;
    } catch (error) {
      throw new Error(`Failed to unlist card: ${error.message}`);
    }
  }

  /**
   * Purchase card
   */
  async purchaseCard(cardId, buyerId) {
    try {
      const card = await Card.findById(cardId);
      const buyer = await User.findById(buyerId);
      const seller = await User.findById(card.owner);

      if (!card || !buyer || !seller) {
        throw new Error('Card, buyer, or seller not found');
      }

      if (!card.forSale) {
        throw new Error('Card is not for sale');
      }

      if (buyer.gold < card.salePrice) {
        throw new Error('Insufficient gold');
      }

      // Calculate platform fee (5%)
      const platformFee = Math.floor(card.salePrice * 0.05);
      const sellerGain = card.salePrice - platformFee;

      // Transfer gold
      buyer.gold -= card.salePrice;
      seller.gold += sellerGain;

      // Transfer card
      card.owner = buyerId;
      card.forSale = false;
      card.salePrice = 0;

      // Create transaction record
      const transaction = new Transaction({
        type: 'purchase',
        buyer: buyerId,
        seller: seller._id,
        card: cardId,
        price: card.salePrice,
        currency: 'gold',
        platformFee,
        status: 'completed'
      });

      await buyer.save();
      await seller.save();
      await card.save();
      await transaction.save();

      return {
        card,
        transaction,
        buyer: { username: buyer.username, gold: buyer.gold },
        seller: { username: seller.username, gold: seller.gold }
      };
    } catch (error) {
      throw new Error(`Failed to purchase card: ${error.message}`);
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats() {
    try {
      const totalListings = await Card.countDocuments({ forSale: true });
      
      const priceStats = await Card.aggregate([
        { $match: { forSale: true } },
        {
          $group: {
            _id: null,
            avgPrice: { $avg: '$salePrice' },
            minPrice: { $min: '$salePrice' },
            maxPrice: { $max: '$salePrice' }
          }
        }
      ]);

      const stats = priceStats[0] || {
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0
      };

      const totalTransactions = await Transaction.countDocuments({
        type: 'purchase',
        status: 'completed'
      });

      const volume = await Transaction.aggregate([
        { $match: { type: 'purchase', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]);

      return {
        totalListings,
        totalTransactions,
        volume: volume[0]?.total || 0,
        averagePrice: Math.floor(stats.avgPrice),
        floorPrice: stats.minPrice,
        ceilingPrice: stats.maxPrice
      };
    } catch (error) {
      throw new Error(`Failed to get marketplace stats: ${error.message}`);
    }
  }

  /**
   * Get price trends
   */
  async getPriceTrends(rarity, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Transaction.aggregate([
        {
          $match: {
            type: 'purchase',
            status: 'completed',
            completedAt: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'cards',
            localField: 'card',
            foreignField: '_id',
            as: 'cardData'
          }
        },
        {
          $match: {
            'cardData.rarity': rarity
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$completedAt'
              }
            },
            avgPrice: { $avg: '$price' },
            volume: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      return trends;
    } catch (error) {
      throw new Error(`Failed to get price trends: ${error.message}`);
    }
  }

  /**
   * Get recommended price for card
   */
  async getRecommendedPrice(cardId) {
    try {
      const card = await Card.findById(cardId);

      if (!card) {
        throw new Error('Card not found');
      }

      // Get average price for similar cards
      const similarCards = await Card.find({
        rarity: card.rarity,
        type: card.type,
        level: card.level,
        forSale: true
      });

      if (similarCards.length === 0) {
        // Fallback to rarity-based pricing
        return this.getDefaultPrice(card.rarity, card.level, card.power);
      }

      const prices = similarCards.map(c => c.salePrice);
      const avgPrice = Math.floor(prices.reduce((a, b) => a + b) / prices.length);

      return {
        recommended: avgPrice,
        min: Math.min(...prices),
        max: Math.max(...prices),
        similarListings: similarCards.length
      };
    } catch (error) {
      throw new Error(`Failed to get recommended price: ${error.message}`);
    }
  }

  /**
   * Get default price based on rarity and level
   */
  getDefaultPrice(rarity, level, power) {
    const rarityMultipliers = {
      'Common': 100,
      'Rare': 300,
      'Epic': 800,
      'Legendary': 2000,
      'Mythic': 5000
    };

    const basePrice = rarityMultipliers[rarity] || 100;
    const levelMultiplier = 1 + ((level - 1) * 0.1);
    const powerBonus = (power || 0) * 0.5;

    return Math.floor(basePrice * levelMultiplier + powerBonus);
  }

  /**
   * Get trending cards
   */
  async getTrendingCards(limit = 10) {
    try {
      const trendingCards = await Card.aggregate([
        {
          $match: { forSale: true }
        },
        {
          $lookup: {
            from: 'transactions',
            localField: '_id',
            foreignField: 'card',
            as: 'transactions'
          }
        },
        {
          $addFields: {
            salesVolume: { $size: '$transactions' }
          }
        },
        {
          $sort: { salesVolume: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            name: 1,
            rarity: 1,
            type: 1,
            level: 1,
            salePrice: 1,
            salesVolume: 1,
            power: 1
          }
        }
      ]);

      return trendingCards;
    } catch (error) {
      throw new Error(`Failed to get trending cards: ${error.message}`);
    }
  }

  /**
   * Get user's sales history
   */
  async getUserSalesHistory(userId, limit = 20) {
    try {
      const sales = await Transaction.find({
        seller: userId,
        type: 'purchase',
        status: 'completed'
      })
        .populate('buyer', 'username')
        .populate('card', 'name rarity type level')
        .sort({ completedAt: -1 })
        .limit(limit);

      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.price * 0.95), 0);

      return {
        sales,
        totalSales: sales.length,
        totalRevenue: Math.floor(totalRevenue)
      };
    } catch (error) {
      throw new Error(`Failed to get sales history: ${error.message}`);
    }
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchaseHistory(userId, limit = 20) {
    try {
      const purchases = await Transaction.find({
        buyer: userId,
        type: 'purchase',
        status: 'completed'
      })
        .populate('seller', 'username')
        .populate('card', 'name rarity type level')
        .sort({ completedAt: -1 })
        .limit(limit);

      const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.price, 0);

      return {
        purchases,
        totalPurchases: purchases.length,
        totalSpent
      };
    } catch (error) {
      throw new Error(`Failed to get purchase history: ${error.message}`);
    }
  }

  /**
   * Calculate transaction fee
   */
  calculateTransactionFee(amount) {
    const platformFeePercentage = 0.05; // 5%
    return Math.floor(amount * platformFeePercentage);
  }

  /**
   * Validate transaction
   */
  async validateTransaction(buyerId, cardId) {
    try {
      const errors = [];

      const buyer = await User.findById(buyerId);
      const card = await Card.findById(cardId);

      if (!buyer) {
        errors.push('Buyer not found');
      }

      if (!card) {
        errors.push('Card not found');
      }

      if (!card.forSale) {
        errors.push('Card is not for sale');
      }

      if (buyer && card && buyer.gold < card.salePrice) {
        errors.push('Insufficient gold');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      throw new Error(`Failed to validate transaction: ${error.message}`);
    }
  }

  /**
   * Get market analysis
   */
  async getMarketAnalysis() {
    try {
      const stats = await this.getMarketplaceStats();

      const rarityStats = await Card.aggregate([
        {
          $group: {
            _id: '$rarity',
            count: { $sum: 1 },
            avgPrice: { $avg: '$salePrice' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const typeStats = await Card.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgPrice: { $avg: '$salePrice' }
          }
        }
      ]);

      return {
        overall: stats,
        byRarity: rarityStats,
        byType: typeStats
      };
    } catch (error) {
      throw new Error(`Failed to get market analysis: ${error.message}`);
    }
  }
}

module.exports = new MarketplaceService();