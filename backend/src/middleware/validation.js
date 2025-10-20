const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .notEmpty()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

// Card validation
const validateCardCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Card name is required'),
  body('type')
    .notEmpty()
    .isIn(['Warrior', 'Mage', 'Assassin', 'Tank', 'Support'])
    .withMessage('Invalid card type'),
  body('rarity')
    .notEmpty()
    .isIn(['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'])
    .withMessage('Invalid rarity'),
  body('attack')
    .isInt({ min: 0, max: 200 })
    .withMessage('Attack must be between 0 and 200'),
  body('defense')
    .isInt({ min: 0, max: 200 })
    .withMessage('Defense must be between 0 and 200'),
  body('health')
    .isInt({ min: 0, max: 500 })
    .withMessage('Health must be between 0 and 500')
];

// Battle validation
const validateBattleStart = [
  body('opponentId')
    .notEmpty()
    .withMessage('Opponent ID is required')
    .isMongoId()
    .withMessage('Invalid opponent ID'),
  body('deckId')
    .notEmpty()
    .withMessage('Deck ID is required')
    .isMongoId()
    .withMessage('Invalid deck ID'),
  body('battleType')
    .optional()
    .isIn(['quick', 'ranked', 'tournament', 'clan', 'practice'])
    .withMessage('Invalid battle type')
];

// Marketplace validation
const validateMarketplaceList = [
  body('cardId')
    .notEmpty()
    .withMessage('Card ID is required')
    .isMongoId()
    .withMessage('Invalid card ID'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt({ min: 1 })
    .withMessage('Price must be at least 1')
];

// Tournament validation
const validateTournamentCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tournament name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be 3-100 characters'),
  body('entryFee')
    .isInt({ min: 0 })
    .withMessage('Entry fee must be non-negative'),
  body('prizePool')
    .isInt({ min: 0 })
    .withMessage('Prize pool must be non-negative'),
  body('maxParticipants')
    .isInt({ min: 2, max: 512 })
    .withMessage('Max participants must be between 2 and 512'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date'),
  body('format')
    .isIn(['single-elimination', 'double-elimination', 'round-robin', 'best-of-3', 'best-of-5'])
    .withMessage('Invalid tournament format')
];

// Clan validation
const validateClanCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Clan name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be 3-50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Pagination validation
const validatePagination = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be at least 1'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Price validation
const validatePrice = (req, res, next) => {
  const { price } = req.body;
  
  if (price && (price < 0 || !Number.isInteger(price))) {
    return res.status(400).json({
      success: false,
      error: 'Price must be a positive integer'
    });
  }
  
  next();
};

// User level validation
const validateUserLevel = (minLevel) => {
  return (req, res, next) => {
    if (req.user && req.user.level < minLevel) {
      return res.status(403).json({
        success: false,
        error: `Minimum level ${minLevel} required`
      });
    }
    next();
  };
};

// Card ownership validation
const validateCardOwnership = async (req, res, next) => {
  try {
    const Card = require('../models/Card');
    const card = await Card.findById(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }
    
    if (card.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this card'
      });
    }
    
    req.card = card;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Sufficient balance validation
const validateBalance = (currency) => {
  return (req, res, next) => {
    const { amount } = req.body;
    const userBalance = req.user[currency] || 0;
    
    if (userBalance < amount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient ${currency}. You have ${userBalance}, but need ${amount}`
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateLogin,
  validateRegister,
  validateCardCreation,
  validateBattleStart,
  validateMarketplaceList,
  validateTournamentCreation,
  validateClanCreation,
  validatePagination,
  validatePrice,
  validateUserLevel,
  validateCardOwnership,
  validateBalance
};