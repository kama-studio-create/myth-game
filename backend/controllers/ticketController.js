// backend/src/controllers/ticketController.js
const User = require('../models/EnhancedUser');
const { GAME_CONFIG } = require('../config/gameConfig');

// Buy Tournament Tickets
exports.buyTickets = async (req, res) => {
  try {
    const { userId, ticketPackage } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const ticketPack = GAME_CONFIG.TICKETS[ticketPackage];
    if (!ticketPack) {
      return res.status(400).json({ success: false, error: 'Invalid ticket package' });
    }

    // Apply VIP discount
    const finalPrice = user.applyVIPDiscount(ticketPack.price);

    // Check if user has enough tokens
    if (user.tokens < finalPrice) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient tokens',
        required: finalPrice,
        available: user.tokens
      });
    }

    // Deduct tokens and add tickets
    user.tokens -= finalPrice;
    user.tournamentTickets += ticketPack.quantity;
    await user.save();

    res.json({
      success: true,
      ticketsPurchased: ticketPack.quantity,
      tokensSpent: finalPrice,
      totalTickets: user.tournamentTickets,
      remainingTokens: user.tokens,
      message: `Purchased ${ticketPack.quantity} tickets!`
    });

  } catch (error) {
    console.error('Error buying tickets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get User Ticket Balance
exports.getTicketBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      tickets: user.tournamentTickets,
      tokens: user.tokens,
      isVIP: user.isVIPActive()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;