const User = require('../models/User');

class RewardService {
  /**
   * Calculate battle rewards
   */
  async calculateBattleRewards(winner, loser, battleType = 'quick') {
    try {
      const baseRewards = this.getBaseRewards(battleType);
      
      // Calculate rating difference bonus/penalty
      let ratingChange = baseRewards.ratingWin;
      let winnerTokens = baseRewards.winnerTokens;
      let winnerGold = baseRewards.winnerGold;
      let loserTokens = baseRewards.loserTokens;
      let loserGold = baseRewards.loserGold;
      let loserRatingChange = baseRewards.ratingLoss;

      if (loser) {
        const ratingDiff = winner.rating - loser.rating;
        
        // ELO-like system
        if (ratingDiff > 200) {
          ratingChange = Math.floor(ratingChange * 0.5); // Reduced reward for easy win
        } else if (ratingDiff < -200) {
          ratingChange = Math.floor(ratingChange * 1.5); // Bonus for upset
        }
      }

      // Win streak bonus
      const winStreakBonus = Math.min(winner.stats.winStreak || 0, 10) * 5;
      winnerTokens += winStreakBonus;
      winnerGold += winStreakBonus * 10;

      // Level-based multiplier
      const levelMultiplier = 1 + (winner.level * 0.05);
      winnerTokens = Math.floor(winnerTokens * levelMultiplier);
      winnerGold = Math.floor(winnerGold * levelMultiplier);

      return {
        winnerGold,
        winnerTokens,
        loserGold,
        loserTokens,
        ratingChange,
        loserRatingChange,
        baseRewards,
        bonuses: {
          winStreak: winStreakBonus,
          levelMultiplier
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate rewards: ${error.message}`);
    }
  }

  /**
   * Get base rewards for battle type
   */
  getBaseRewards(battleType) {
    const rewards = {
      quick: {
        winnerTokens: 50,
        winnerGold: 150,
        loserTokens: 10,
        loserGold: 50,
        ratingWin: 15,
        ratingLoss: -10
      },
      ranked: {
        winnerTokens: 100,
        winnerGold: 300,
        loserTokens: 20,
        loserGold: 100,
        ratingWin: 25,
        ratingLoss: -20
      },
      tournament: {
        winnerTokens: 150,
        winnerGold: 500,
        loserTokens: 50,
        loserGold: 200,
        ratingWin: 50,
        ratingLoss: -30
      },
      clan: {
        winnerTokens: 75,
        winnerGold: 200,
        loserTokens: 25,
        loserGold: 75,
        ratingWin: 20,
        ratingLoss: -15
      },
      practice: {
        winnerTokens: 20,
        winnerGold: 50,
        loserTokens: 10,
        loserGold: 25,
        ratingWin: 0,
        ratingLoss: 0
      }
    };

    return rewards[battleType] || rewards.quick;
  }

  /**
   * Calculate daily reward
   */
  async calculateDailyReward(user) {
    try {
      const streak = user.dailyRewardStreak || 0;
      
      const dailyRewards = [
        { day: 1, gold: 100, gems: 0 },
        { day: 2, gold: 150, gems: 5 },
        { day: 3, gold: 200, gems: 0 },
        { day: 4, gold: 300, gems: 10 },
        { day: 5, gold: 400, gems: 0 },
        { day: 6, gold: 500, gems: 25 },
        { day: 7, gold: 1000, gems: 100 }
      ];

      const dayIndex = Math.min(streak % 7, 6);
      const reward = dailyRewards[dayIndex];

      return {
        gold: reward.gold,
        gems: reward.gems,
        day: dayIndex + 1,
        streak: streak + 1
      };
    } catch (error) {
      throw new Error(`Failed to calculate daily reward: ${error.message}`);
    }
  }

  /**
   * Calculate level-up rewards
   */
  async calculateLevelUpReward(newLevel) {
    try {
      const goldReward = newLevel * 500;
      const gemsReward = newLevel >= 20 ? Math.floor(newLevel * 5) : 0;
      const experienceBonus = newLevel * 100;

      return {
        gold: goldReward,
        gems: gemsReward,
        experienceBonus,
        message: `Level Up! +${goldReward} Gold${gemsReward > 0 ? ` +${gemsReward} Gems` : ''}`
      };
    } catch (error) {
      throw new Error(`Failed to calculate level-up reward: ${error.message}`);
    }
  }

  /**
   * Calculate tournament rewards
   */
  calculateTournamentRewards(placement, totalParticipants, prizePool) {
    try {
      const distribution = {
        1: 0.5,  // 50%
        2: 0.3,  // 30%
        3: 0.15, // 15%
        4: 0.05  // 5%
      };

      const percentage = distribution[placement] || 0;
      const reward = Math.floor(prizePool * percentage);

      return {
        placement,
        reward,
        percentage: (percentage * 100).toFixed(0),
        message: `Tournament Placement #${placement}: +${reward} Gold`
      };
    } catch (error) {
      throw new Error(`Failed to calculate tournament reward: ${error.message}`);
    }
  }

  /**
   * Calculate quest rewards
   */
  calculateQuestReward(questDifficulty, questType) {
    try {
      const difficulties = {
        easy: { gold: 100, tokens: 10, xp: 50 },
        normal: { gold: 200, tokens: 25, xp: 100 },
        hard: { gold: 500, tokens: 50, xp: 250 },
        legendary: { gold: 1000, tokens: 100, xp: 500 }
      };

      const multipliers = {
        battle: 1,
        collection: 1.2,
        trading: 1.1,
        social: 1.5
      };

      const base = difficulties[questDifficulty] || difficulties.normal;
      const multiplier = multipliers[questType] || 1;

      return {
        gold: Math.floor(base.gold * multiplier),
        tokens: Math.floor(base.tokens * multiplier),
        experience: Math.floor(base.xp * multiplier),
        difficulty: questDifficulty,
        type: questType
      };
    } catch (error) {
      throw new Error(`Failed to calculate quest reward: ${error.message}`);
    }
  }

  /**
   * Calculate referral bonuses
   */
  calculateReferralBonus(referralsCount) {
    try {
      const bonusPerReferral = 500;
      const bonusGems = Math.floor(referralsCount / 5); // 1 gem per 5 referrals

      return {
        gold: bonusPerReferral * referralsCount,
        gems: bonusGems,
        referralsCount,
        message: `Referral Bonus: +${bonusPerReferral * referralsCount} Gold`
      };
    } catch (error) {
      throw new Error(`Failed to calculate referral bonus: ${error.message}`);
    }
  }

  /**
   * Apply penalty
   */
  async applyPenalty(userId, reason, penaltyAmount) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      user.gold = Math.max(0, user.gold - penaltyAmount);
      await user.save();

      return {
        success: true,
        penalty: penaltyAmount,
        reason,
        newBalance: user.gold
      };
    } catch (error) {
      throw new Error(`Failed to apply penalty: ${error.message}`);
    }
  }

  /**
   * Calculate achievement reward
   */
  calculateAchievementReward(achievementTier) {
    try {
      const achievements = {
        bronze: { gold: 100, gems: 5, tokens: 20 },
        silver: { gold: 300, gems: 15, tokens: 50 },
        gold: { gold: 500, gems: 25, tokens: 100 },
        platinum: { gold: 1000, gems: 50, tokens: 200 }
      };

      return achievements[achievementTier] || achievements.bronze;
    } catch (error) {
      throw new Error(`Failed to calculate achievement reward: ${error.message}`);
    }
  }

  /**
   * Calculate seasonal rewards
   */
  async calculateSeasonalRewards(userId, seasonRank) {
    try {
      const seasonalRewards = {
        1: { gold: 5000, gems: 100, tokens: 500 },
        2: { gold: 3000, gems: 75, tokens: 300 },
        3: { gold: 2000, gems: 50, tokens: 200 },
        4: { gold: 1000, gems: 25, tokens: 100 },
        5: { gold: 500, gems: 10, tokens: 50 }
      };

      const reward = seasonalRewards[Math.min(seasonRank, 5)] || seasonalRewards[5];

      return {
        rank: seasonRank,
        ...reward,
        message: `Season Reward: #${seasonRank} Rank!`
      };
    } catch (error) {
      throw new Error(`Failed to calculate seasonal reward: ${error.message}`);
    }
  }
}

module.exports = new RewardService();