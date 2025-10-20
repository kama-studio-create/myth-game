const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT token
exports.auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      
      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user || user.isBanned) {
        return res.status(401).json({
          success: false,
          error: 'User not found or banned'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Admin authentication
exports.adminAuth = async (req, res, next) => {
  try {
    // First apply regular auth
    await new Promise((resolve, reject) => {
      exports.auth(req, res, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Check if user is admin (you can use email or role field)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized - Admin access required'
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Optional authentication (doesn't fail if no token)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        
        const user = await User.findById(decoded.id);
        if (user && !user.isBanned) {
          req.user = user;
        }
      } catch (error) {
        // Silently fail - user just won't be authenticated
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Rate limiting for login attempts
const loginAttempts = new Map();

exports.rateLimitLogin = (req, res, next) => {
  const identifier = req.body.email || req.body.username || req.ip;
  const now = Date.now();
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (!loginAttempts.has(identifier)) {
    loginAttempts.set(identifier, []);
  }

  const attempts = loginAttempts.get(identifier);
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  loginAttempts.set(identifier, recentAttempts);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again later.'
    });
  }

  recentAttempts.push(now);
  next();
};

// Verify user ownership
exports.verifyOwnership = (req, res, next) => {
  if (req.userId !== req.params.userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this resource'
    });
  }
  next();
};

// Check user is not banned
exports.checkBanStatus = async (req, res, next) => {
  try {
    if (req.userId) {
      const user = await User.findById(req.userId);
      if (user && user.isBanned) {
        return res.status(403).json({
          success: false,
          error: 'Your account has been banned',
          reason: user.banReason
        });
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = exports;