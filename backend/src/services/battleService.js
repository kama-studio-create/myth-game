const Card = require('../models/Card');
const Battle = require('../models/Battle');

class BattleService {
  /**
   * Calculate card power for battle
   */
  calculateCardPower(card) {
    if (!card) return 0;
    
    const rarityMultipliers = {
      'Common': 1,
      'Rare': 1.5,
      'Epic': 2,
      'Legendary': 3,
      'Mythic': 5
    };

    const baseStats = (card.attack || 0) + (card.defense || 0) + ((card.health || 0) / 2);
    const rarityMultiplier = rarityMultipliers[card.rarity] || 1;
    const levelMultiplier = 1 + ((card.level - 1) * 0.1);

    return Math.floor(baseStats * rarityMultiplier * levelMultiplier);
  }

  /**
   * Calculate deck power
   */
  calculateDeckPower(cards) {
    if (!Array.isArray(cards) || cards.length === 0) return 0;
    
    return cards.reduce((total, card) => {
      return total + this.calculateCardPower(card);
    }, 0);
  }

  /**
   * Simulate battle outcome
   */
  simulateBattle(player1Level, player2Level) {
    try {
      // Base win chance based on level
      const levelDiff = player1Level - player2Level;
      let player1WinChance = 0.5; // 50% base

      // Adjust based on level difference
      if (levelDiff > 0) {
        player1WinChance += (levelDiff * 0.02); // +2% per level
      } else {
        player1WinChance -= (Math.abs(levelDiff) * 0.02); // -2% per level
      }

      // Cap between 10% and 90%
      player1WinChance = Math.max(0.1, Math.min(0.9, player1WinChance));

      // Add randomness (±15%)
      const randomFactor = (Math.random() - 0.5) * 0.3;
      const finalChance = Math.max(0.05, Math.min(0.95, player1WinChance + randomFactor));

      return {
        player1Wins: Math.random() < finalChance,
        player1WinChance: (finalChance * 100).toFixed(2),
        levelAdvantage: levelDiff
      };
    } catch (error) {
      throw new Error(`Failed to simulate battle: ${error.message}`);
    }
  }

  /**
   * Battle two decks
   */
  async battleDecks(deck1, deck2) {
    try {
      const power1 = this.calculateDeckPower(deck1);
      const power2 = this.calculateDeckPower(deck2);

      // Calculate win chance
      const totalPower = power1 + power2;
      let player1WinChance = power1 / totalPower;

      // Add randomness
      const randomFactor = (Math.random() - 0.5) * 0.2;
      const finalChance = Math.max(0.1, Math.min(0.9, player1WinChance + randomFactor));

      return {
        player1Wins: Math.random() < finalChance,
        player1Power: power1,
        player2Power: power2,
        player1WinChance: (finalChance * 100).toFixed(2)
      };
    } catch (error) {
      throw new Error(`Failed to battle decks: ${error.message}`);
    }
  }

  /**
   * Generate battle stats
   */
  generateBattleStats(winner, loser) {
    try {
      const winnerDamage = Math.floor(Math.random() * 100) + 50;
      const loserDamage = Math.floor(Math.random() * 80) + 20;

      return {
        winner: {
          health: Math.max(10, 100 - loserDamage),
          damageDealt: winnerDamage,
          damageTaken: loserDamage,
          cardsUsed: Math.floor(Math.random() * 5) + 1,
          abilities: Math.floor(Math.random() * 3),
          dodges: Math.floor(Math.random() * 2)
        },
        loser: {
          health: 0,
          damageDealt: loserDamage,
          damageTaken: winnerDamage,
          cardsUsed: Math.floor(Math.random() * 5) + 1,
          abilities: Math.floor(Math.random() * 3),
          dodges: Math.floor(Math.random() * 2)
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate battle stats: ${error.message}`);
    }
  }

  /**
   * Validate battle setup
   */
  async validateBattleSetup(player1Id, player2Id, deckId) {
    try {
      const errors = [];

      if (!player1Id || !player2Id) {
        errors.push('Both players are required');
      }

      if (player1Id === player2Id) {
        errors.push('Cannot battle yourself');
      }

      if (!deckId) {
        errors.push('Deck is required');
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      return { valid: true, errors: [] };
    } catch (error) {
      throw new Error(`Failed to validate battle setup: ${error.message}`);
    }
  }

  /**
   * Get battle history for user
   */
  async getBattleHistory(userId, limit = 20) {
    try {
      const battles = await Battle.find({
        $or: [
          { player1: userId },
          { player2: userId }
        ]
      })
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('player1', 'username level rating')
        .populate('player2', 'username level rating')
        .populate('winner', 'username');

      return battles;
    } catch (error) {
      throw new Error(`Failed to get battle history: ${error.message}`);
    }
  }

  /**
   * Calculate win rate
   */
  calculateWinRate(wins, totalBattles) {
    if (totalBattles === 0) return 0;
    return ((wins / totalBattles) * 100).toFixed(2);
  }

  /**
   * Determine battle result
   */
  determineBattleResult(player1Power, player2Power) {
    try {
      const powerDiff = Math.abs(player1Power - player2Power);
      const player1Wins = player1Power > player2Power;

      // Add randomness (30% chance upset)
      const upset = Math.random() < 0.3;
      const finalResult = upset ? !player1Wins : player1Wins;

      return {
        player1Wins: finalResult,
        player2Wins: !finalResult,
        powerAdvantage: player1Wins ? player1Power - player2Power : player2Power - player1Power,
        wasUpset: upset
      };
    } catch (error) {
      throw new Error(`Failed to determine battle result: ${error.message}`);
    }
  }

  /**
   * Check if player has energy for battle
   */
  async checkBattleEnergy(userId, energyRequired = 10) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        hasEnergy: user.energy >= energyRequired,
        currentEnergy: user.energy,
        required: energyRequired
      };
    } catch (error) {
      throw new Error(`Failed to check battle energy: ${error.message}`);
    }
  }

  /**
   * Deduct battle energy
   */
  async deductBattleEnergy(userId, amount = 10) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.energy = Math.max(0, user.energy - amount);
      await user.save();

      return user.energy;
    } catch (error) {
      throw new Error(`Failed to deduct battle energy: ${error.message}`);
    }
  }

  /**
   * Regenerate energy
   */
  async regenerateEnergy(userId, amount = 10) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.energy = Math.min(100, user.energy + amount);
      await user.save();

      return user.energy;
    } catch (error) {
      throw new Error(`Failed to regenerate energy: ${error.message}`);
    }
  }

  /**
   * Get battle statistics
   */
  async getBattleStats(userId) {
    try {
      const battles = await Battle.find({
        $or: [
          { player1: userId },
          { player2: userId }
        ]
      });

      const wins = battles.filter(b => b.winner?.toString() === userId.toString()).length;
      const losses = battles.length - wins;

      return {
        totalBattles: battles.length,
        wins,
        losses,
        winRate: this.calculateWinRate(wins, battles.length)
      };
    } catch (error) {
      throw new Error(`Failed to get battle stats: ${error.message}`);
    }
  }
}

module.exports = new BattleService();