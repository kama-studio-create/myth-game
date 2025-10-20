const Card = require('../models/Card');
const User = require('../models/User');

class NFTService {
  /**
   * Mint a new NFT card
   */
  async mintNFTCard(cardData, userId) {
    try {
      const nftId = this.generateNFTId();
      
      const card = new Card({
        ...cardData,
        owner: userId,
        nftId,
        mintDate: new Date(),
        blockchain: 'Ethereum'
      });

      card.calculatePower();
      await card.save();

      return card;
    } catch (error) {
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
  }

  /**
   * Upgrade a card
   */
  async upgradeCard(card, cost) {
    try {
      card.upgrade();
      await card.save();
      return card;
    } catch (error) {
      throw new Error(`Failed to upgrade card: ${error.message}`);
    }
  }

  /**
   * Transfer NFT ownership
   */
  async transferNFT(cardId, fromUserId, toUserId, price) {
    try {
      const card = await Card.findById(cardId);
      
      if (!card) {
        throw new Error('Card not found');
      }

      if (card.owner.toString() !== fromUserId.toString()) {
        throw new Error('Not card owner');
      }

      const fromUser = await User.findById(fromUserId);
      const toUser = await User.findById(toUserId);

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      // Transfer tokens
      if (toUser.tokens < price) {
        throw new Error('Insufficient tokens');
      }

      toUser.tokens -= price;
      fromUser.tokens += Math.floor(price * 0.95); // 5% fee

      // Transfer card
      card.owner = toUserId;
      card.forSale = false;

      await fromUser.save();
      await toUser.save();
      await card.save();

      return card;
    } catch (error) {
      throw new Error(`Failed to transfer NFT: ${error.message}`);
    }
  }

  /**
   * Burn NFT card
   */
  async burnNFT(cardId, userId) {
    try {
      const card = await Card.findById(cardId);
      
      if (!card) {
        throw new Error('Card not found');
      }

      if (card.owner.toString() !== userId.toString()) {
        throw new Error('Not card owner');
      }

      const burnValue = Math.floor((card.power || 0) * 0.5);
      
      const user = await User.findById(userId);
      user.tokens += burnValue;
      await user.save();

      await Card.findByIdAndDelete(cardId);

      return {
        burned: true,
        value: burnValue
      };
    } catch (error) {
      throw new Error(`Failed to burn NFT: ${error.message}`);
    }
  }

  /**
   * Get NFT rarity
   */
  getRarityScore(card) {
    const rarityScores = {
      'Common': 1,
      'Rare': 5,
      'Epic': 25,
      'Legendary': 100,
      'Mythic': 500
    };

    return rarityScores[card.rarity] || 0;
  }

  /**
   * Generate unique NFT ID
   */
  generateNFTId() {
    return `MYTHIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Get card valuation
   */
  getCardValuation(card) {
    const baseValue = 100;
    const rarityMultipliers = {
      'Common': 1,
      'Rare': 2,
      'Epic': 4,
      'Legendary': 8,
      'Mythic': 16
    };

    const levelMultiplier = 1 + ((card.level - 1) * 0.1);
    const rarityMultiplier = rarityMultipliers[card.rarity] || 1;
    const powerBonus = (card.power || 0) * 0.01;

    return Math.floor(
      (baseValue * rarityMultiplier * levelMultiplier) + powerBonus
    );
  }

  /**
   * Get market data for card rarity
   */
  async getMarketData(rarity) {
    try {
      const cards = await Card.find({ rarity, forSale: true });
      
      if (cards.length === 0) {
        return {
          rarity,
          floorPrice: 0,
          averagePrice: 0,
          volume: 0
        };
      }

      const prices = cards.map(c => c.salePrice);
      const averagePrice = Math.floor(prices.reduce((a, b) => a + b) / prices.length);
      const floorPrice = Math.min(...prices);
      const volume = cards.length;

      return {
        rarity,
        floorPrice,
        averagePrice,
        volume
      };
    } catch (error) {
      throw new Error(`Failed to get market data: ${error.message}`);
    }
  }

  /**
   * Check if card is rare
   */
  isRareCard(card) {
    return ['Epic', 'Legendary', 'Mythic'].includes(card.rarity);
  }

  /**
   * Get NFT collection value
   */
  async getCollectionValue(userId) {
    try {
      const user = await User.findById(userId).populate('cards');
      
      if (!user) {
        throw new Error('User not found');
      }

      let totalValue = 0;
      user.cards.forEach(card => {
        totalValue += this.getCardValuation(card);
      });

      return {
        userId,
        totalValue,
        cardCount: user.cards.length,
        averageValue: user.cards.length > 0 ? Math.floor(totalValue / user.cards.length) : 0
      };
    } catch (error) {
      throw new Error(`Failed to get collection value: ${error.message}`);
    }
  }

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
        throw new Error('Not card owner');
      }

      card.listForSale(price);
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
        throw new Error('Not card owner');
      }

      card.removeFromSale();
      await card.save();

      return card;
    } catch (error) {
      throw new Error(`Failed to unlist card: ${error.message}`);
    }
  }

  /**
   * Get card history
   */
  async getCardHistory(cardId) {
    try {
      const Transaction = require('../models/Transaction');
      
      const transactions = await Transaction.find({ card: cardId })
        .populate('buyer', 'username')
        .populate('seller', 'username')
        .sort({ completedAt: -1 });

      return transactions;
    } catch (error) {
      throw new Error(`Failed to get card history: ${error.message}`);
    }
  }

  /**
   * Calculate upgrade cost
   */
  calculateUpgradeCost(currentLevel) {
    const baseCost = 100;
    return baseCost * currentLevel;
  }

  /**
   * Get card power breakdown
   */
  getCardPowerBreakdown(card) {
    return {
      attack: card.attack || 0,
      defense: card.defense || 0,
      health: Math.floor((card.health || 0) / 2),
      magic: card.magic || 0,
      speed: card.speed || 0,
      levelBonus: Math.floor((card.level - 1) * 5),
      total: card.power || 0
    };
  }
}

module.exports = new NFTService();