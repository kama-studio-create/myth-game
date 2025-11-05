// backend/src/controllers/cardController.js
const GameCard = require('../models/GameCard');
const User = require('../models/EnhancedUser');
const CardSupply = require('../models/CardSupply');
const { GAME_CONFIG } = require('../config/gameConfig');

// Buy Card Packs
exports.buyCardPack = async (req, res) => {
  try {
    const { userId, packType } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get pack details
    const pack = GAME_CONFIG.PACKS[packType];
    if (!pack) {
      return res.status(400).json({ success: false, error: 'Invalid pack type' });
    }

    // Apply VIP discount
    const finalPrice = user.applyVIPDiscount(pack.price);

    // Check if user has enough gold
    if (user.gold < finalPrice) {
      return res.status(400).json({ success: false, error: 'Insufficient gold' });
    }

    // Check daily limit
    await checkAndResetDailyLimit(user);
    
    const dailyLimit = user.isVIPActive() 
      ? GAME_CONFIG.CARDS.DAILY_LIMIT_VIP 
      : GAME_CONFIG.CARDS.DAILY_LIMIT_REGULAR;

    if (user.dailyCardsPurchased + pack.cards > dailyLimit) {
      return res.status(400).json({ 
        success: false, 
        error: `Daily limit exceeded. You can buy ${dailyLimit - user.dailyCardsPurchased} more cards today.` 
      });
    }

    // Check total supply
    const supply = await CardSupply.findOne() || new CardSupply();
    if (supply.totalMinted + pack.cards > GAME_CONFIG.CARDS.TOTAL_SUPPLY) {
      if (!user.isVIPActive()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Card supply depleted. Only VIP members can purchase now.' 
        });
      }
    }

    // Generate cards
    const newCards = [];
    for (let i = 0; i < pack.cards; i++) {
      const cardNumber = getRandomCardNumber(pack.possibleCards);
      const cardStats = GAME_CONFIG.CARDS.STATS.find(c => c.number === cardNumber);
      
      const card = new GameCard({
        cardNumber,
        owner: userId,
        atk: cardStats.atk,
        def: cardStats.def,
        hp: cardStats.hp,
        dailyGoldProduction: cardStats.atk // ATK = daily gold production
      });
      
      await card.save();
      newCards.push(card);
      user.cards.push(card._id);
    }

    // Update user
    user.gold -= finalPrice;
    user.dailyCardsPurchased += pack.cards;
    user.stats.totalGoldSpent += finalPrice;
    await user.save();

    // Update supply
    supply.totalMinted += pack.cards;
    await supply.save();

    res.json({
      success: true,
      cards: newCards,
      goldSpent: finalPrice,
      remainingGold: user.gold,
      message: `Purchased ${pack.name}!`
    });

  } catch (error) {
    console.error('Error buying card pack:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Claim Daily Gold from Cards
exports.claimDailyGold = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId).populate('cards');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let totalGold = 0;
    const now = new Date();

    for (const card of user.cards) {
      const lastClaim = new Date(card.lastGoldClaim);
      const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
      
      if (hoursSinceLastClaim >= 24) {
        const daysElapsed = Math.floor(hoursSinceLastClaim / 24);
        let goldProduced = card.dailyGoldProduction * daysElapsed;
        
        // Apply VIP boost
        if (user.isVIPActive()) {
          goldProduced = Math.floor(goldProduced * 1.2); // 20% boost
        }
        
        totalGold += goldProduced;
        card.lastGoldClaim = now;
        await card.save();
      }
    }

    user.gold += totalGold;
    user.stats.totalGoldEarned += totalGold;
    await user.save();

    res.json({
      success: true,
      goldClaimed: totalGold,
      totalGold: user.gold,
      message: `Claimed ${totalGold} gold!`
    });

  } catch (error) {
    console.error('Error claiming gold:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upgrade Card System
exports.upgradeCard = async (req, res) => {
  try {
    const { userId, card1Id, card2Id } = req.body;
    
    const user = await User.findById(userId);
    const card1 = await GameCard.findById(card1Id);
    const card2 = await GameCard.findById(card2Id);

    if (!user || !card1 || !card2) {
      return res.status(404).json({ success: false, error: 'User or cards not found' });
    }

    // Verify ownership
    if (card1.owner.toString() !== userId || card2.owner.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'You do not own these cards' });
    }

    // Check if cards are identical
    if (card1.cardNumber !== card2.cardNumber) {
      return res.status(400).json({ success: false, error: 'Cards must be identical to merge' });
    }

    // Check if can upgrade further
    if (card1.cardNumber >= 8) {
      return res.status(400).json({ success: false, error: 'Card is already at max level' });
    }

    // Calculate upgrade cost
    const upgradeCost = calculateUpgradeCost(card1.cardNumber);
    const finalCost = user.applyVIPDiscount(upgradeCost);

    if (user.gold < finalCost) {
      return res.status(400).json({ success: false, error: 'Insufficient gold' });
    }

    // Deduct gold
    user.gold -= finalCost;
    user.stats.totalGoldSpent += finalCost;
    user.stats.upgradeAttempts += 1;

    // Award points for attempt
    user.totalPoints += GAME_CONFIG.POINTS.UPGRADE_ATTEMPT;
    user.weeklyPoints += GAME_CONFIG.POINTS.UPGRADE_ATTEMPT;
    user.monthlyPoints += GAME_CONFIG.POINTS.UPGRADE_ATTEMPT;
    user.yearlyPoints += GAME_CONFIG.POINTS.UPGRADE_ATTEMPT;

    // 30% chance to succeed
    const success = Math.random() < GAME_CONFIG.UPGRADE.SUCCESS_CHANCE;

    if (success) {
      // Upgrade successful
      const newCardNumber = card1.cardNumber + 1;
      const newStats = GAME_CONFIG.CARDS.STATS.find(c => c.number === newCardNumber);
      
      card1.cardNumber = newCardNumber;
      card1.atk = newStats.atk;
      card1.def = newStats.def;
      card1.hp = newStats.hp;
      card1.dailyGoldProduction = newStats.atk;
      card1.upgradeAttempts += 1;
      await card1.save();

      // Delete second card
      await GameCard.findByIdAndDelete(card2Id);
      user.cards = user.cards.filter(c => c.toString() !== card2Id.toString());

      // Award success points
      user.totalPoints += GAME_CONFIG.POINTS.UPGRADE_SUCCESS;
      user.weeklyPoints += GAME_CONFIG.POINTS.UPGRADE_SUCCESS;
      user.monthlyPoints += GAME_CONFIG.POINTS.UPGRADE_SUCCESS;
      user.yearlyPoints += GAME_CONFIG.POINTS.UPGRADE_SUCCESS;
      user.stats.successfulUpgrades += 1;

      await user.save();

      res.json({
        success: true,
        upgraded: true,
        newCard: card1,
        goldSpent: finalCost,
        pointsEarned: GAME_CONFIG.POINTS.UPGRADE_ATTEMPT + GAME_CONFIG.POINTS.UPGRADE_SUCCESS,
        message: `Success! Upgraded to Card ${newCardNumber}!`
      });

    } else {
      // Upgrade failed - keep both cards
      card1.upgradeAttempts += 1;
      card2.upgradeAttempts += 1;
      await card1.save();
      await card2.save();
      await user.save();

      res.json({
        success: true,
        upgraded: false,
        goldSpent: finalCost,
        pointsEarned: GAME_CONFIG.POINTS.UPGRADE_ATTEMPT,
        message: 'Upgrade failed. Your cards remain unchanged, but gold is not refunded.'
      });
    }

  } catch (error) {
    console.error('Error upgrading card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper Functions
function getRandomCardNumber(possibleCards) {
  return possibleCards[Math.floor(Math.random() * possibleCards.length)];
}

function calculateUpgradeCost(cardLevel) {
  // Base cost = 100, increases by 20% per level
  return Math.floor(GAME_CONFIG.UPGRADE.BASE_COST * Math.pow(1 + GAME_CONFIG.UPGRADE.COST_INCREASE_PER_LEVEL, cardLevel - 1));
}

async function checkAndResetDailyLimit(user) {
  const now = new Date();
  const lastReset = new Date(user.lastCardPurchaseReset);
  
  // Reset if it's a new day
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    user.dailyCardsPurchased = 0;
    user.lastCardPurchaseReset = now;
    await user.save();
  }
}

module.exports = exports;