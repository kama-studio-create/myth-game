
const express = require('express');
const router = express.Router();
const clanController = require('../controllers/clanController');
const { authenticate } = require('../middleware/auth');

// Create clan
router.post('/create', authenticate, clanController.createClan);

// Get all clans
router.get('/list', clanController.getClanList);

// Get clan details
router.get('/:clanId', clanController.getClanDetails);

// Join clan
router.post('/join', authenticate, clanController.joinClan);

// Leave clan
router.post('/leave', authenticate, clanController.leaveClan);

// Upgrade clan
router.post('/upgrade', authenticate, clanController.upgradeClan);

// Add free member
router.post('/add-free-member', authenticate, clanController.addFreeMember);

module.exports = router;

