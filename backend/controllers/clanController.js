const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { GAME_CONFIG } = require('../config/gameConfig');

// Create clan
exports.createClan = async (req, res) => {
  const { userId, clanName, description } = req.body;
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    // Check if user already in a clan
    const existingMembership = await client.query(
      'SELECT * FROM clan_members WHERE user_id = $1',
      [userId]
    );
    
    if (existingMembership.rows.length > 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Already in a clan' });
    }
    
    // Check if clan name already exists
    const existingClan = await client.query(
      'SELECT * FROM clans WHERE name = $1',
      [clanName]
    );
    
    if (existingClan.rows.length > 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Clan name already taken' });
    }
    
    // Create clan
    const clanResult = await client.query(
      'INSERT INTO clans (name, description, founder_id, capacity, member_count) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [clanName, description, userId, GAME_CONFIG.CLAN.INITIAL_CAPACITY, 1]
    );
    
    const clan = clanResult.rows[0];
    
    // Add founder as member
    await client.query(
      'INSERT INTO clan_members (clan_id, user_id, role) VALUES ($1, $2, $3)',
      [clan.id, userId, 'founder']
    );
    
    // Record transaction (TON payment would be handled here)
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, currency, description) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'clan_creation', GAME_CONFIG.CLAN.CREATION_COST, 'TON', `Created clan: ${clanName}`]
    );
    
    await client.query('COMMIT');
    client.release();
    
    res.json({
      success: true,
      clan,
      message: 'Clan created successfully'
    });
    
  } catch (error) {
    console.error('Error creating clan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get clan list
exports.getClanList = async (req, res) => {
  const { limit = 50, offset = 0, search = '' } = req.query;
  
  try {
    let query = `
      SELECT 
        c.*,
        u.username as founder_username,
        COUNT(cm.id) as current_members
      FROM clans c
      JOIN users u ON c.founder_id = u.id
      LEFT JOIN clan_members cm ON c.id = cm.clan_id
      WHERE c.name ILIKE $1
      GROUP BY c.id, u.username
      ORDER BY c.member_count DESC, c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [`%${search}%`, limit, offset]);
    
    res.json({
      clans: result.rows,
      hasMore: result.rows.length === parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error getting clan list:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get clan details
exports.getClanDetails = async (req, res) => {
  const { clanId } = req.params;
  
  try {
    // Get clan info
    const clanResult = await pool.query(
      'SELECT c.*, u.username as founder_username FROM clans c JOIN users u ON c.founder_id = u.id WHERE c.id = $1',
      [clanId]
    );
    
    if (clanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clan not found' });
    }
    
    const clan = clanResult.rows[0];
    
    // Get clan members
    const membersResult = await pool.query(
      `SELECT 
        cm.role,
        cm.joined_at,
        cm.membership_expires_at,
        u.id,
        u.username,
        u.wallet_address,
        u.is_vip,
        u.total_points
      FROM clan_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.clan_id = $1
      ORDER BY cm.role DESC, cm.joined_at ASC`,
      [clanId]
    );
    
    res.json({
      clan,
      members: membersResult.rows
    });
    
  } catch (error) {
    console.error('Error getting clan details:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Join clan
exports.joinClan = async (req, res) => {
  const { userId, clanId, membershipDuration = 1 } = req.body; // duration in months
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    // Check if user already in a clan
    const existingMembership = await client.query(
      'SELECT * FROM clan_members WHERE user_id = $1',
      [userId]
    );
    
    if (existingMembership.rows.length > 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Already in a clan' });
    }
    
    // Get clan
    const clanResult = await client.query(
      'SELECT * FROM clans WHERE id = $1',
      [clanId]
    );
    
    if (clanResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Clan not found' });
    }
    
    const clan = clanResult.rows[0];
    
    // Check if clan is full
    if (clan.member_count >= clan.capacity) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Clan is full' });
    }
    
    // Get user for VIP discount
    const userResult = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    
    // Calculate membership cost
    let monthlyCost = GAME_CONFIG.CLAN.MONTHLY_MEMBERSHIP;
    if (user.is_vip) {
      monthlyCost = monthlyCost * (1 - GAME_CONFIG.VIP.DISCOUNT);
    }
    
    const totalCost = monthlyCost * membershipDuration;
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + membershipDuration);
    
    // Add member
    await client.query(
      'INSERT INTO clan_members (clan_id, user_id, role, membership_expires_at) VALUES ($1, $2, $3, $4)',
      [clanId, userId, 'member', expiresAt]
    );
    
    // Update clan member count
    await client.query(
      'UPDATE clans SET member_count = member_count + 1, treasury_balance = treasury_balance + $1 WHERE id = $2',
      [totalCost, clanId]
    );
    
    // Record transaction
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, currency, description) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'clan_membership', totalCost, 'TON', `Joined clan for ${membershipDuration} months`]
    );
    
    await client.query('COMMIT');
    client.release();
    
    res.json({
      success: true,
      expiresAt,
      cost: totalCost,
      message: 'Successfully joined clan'
    });
    
  } catch (error) {
    console.error('Error joining clan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Leave clan
exports.leaveClan = async (req, res) => {
  const { userId } = req.body;
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    // Get clan membership
    const membershipResult = await client.query(
      'SELECT cm.*, c.founder_id FROM clan_members cm JOIN clans c ON cm.clan_id = c.id WHERE cm.user_id = $1',
      [userId]
    );
    
    if (membershipResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Not in a clan' });
    }
    
    const membership = membershipResult.rows[0];
    
    // Founders cannot leave (must transfer ownership or disband)
    if (membership.role === 'founder') {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Founders cannot leave. Transfer ownership or disband clan.' });
    }
    
    // Remove member
    await client.query(
      'DELETE FROM clan_members WHERE user_id = $1',
      [userId]
    );
    
    // Update clan member count
    await client.query(
      'UPDATE clans SET member_count = member_count - 1 WHERE id = $1',
      [membership.clan_id]
    );
    
    await client.query('COMMIT');
    client.release();
    
    res.json({
      success: true,
      message: 'Successfully left clan'
    });
    
  } catch (error) {
    console.error('Error leaving clan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upgrade clan
exports.upgradeClan = async (req, res) => {
  const { userId, clanId } = req.body;
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    // Check if user is founder
    const membershipResult = await client.query(
      'SELECT * FROM clan_members WHERE clan_id = $1 AND user_id = $2 AND role = $3',
      [clanId, userId, 'founder']
    );
    
    if (membershipResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(403).json({ error: 'Only clan founder can upgrade' });
    }
    
    // Get clan
    const clanResult = await client.query(
      'SELECT * FROM clans WHERE id = $1',
      [clanId]
    );
    const clan = clanResult.rows[0];
    
    // Upgrade clan
    const newLevel = clan.level + 1;
    const newCapacity = clan.capacity + GAME_CONFIG.CLAN.CAPACITY_INCREASE;
    const upgradeCost = GAME_CONFIG.CLAN.UPGRADE_COST;
    
    await client.query(
      'UPDATE clans SET level = $1, capacity = $2 WHERE id = $3',
      [newLevel, newCapacity, clanId]
    );
    
    // Record transaction
    await client.query(
      'INSERT INTO transactions (user_id, type, amount, currency, description) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'clan_upgrade', upgradeCost, 'TON', `Upgraded clan to level ${newLevel}`]
    );
    
    await client.query('COMMIT');
    client.release();
    
    res.json({
      success: true,
      newLevel,
      newCapacity,
      cost: upgradeCost,
      message: 'Clan upgraded successfully'
    });
    
  } catch (error) {
    console.error('Error upgrading clan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add free member
exports.addFreeMember = async (req, res) => {
  const { founderId, targetUserId, clanId } = req.body;
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    // Check if user is founder
    const membershipResult = await client.query(
      'SELECT * FROM clan_members WHERE clan_id = $1 AND user_id = $2 AND role = $3',
      [clanId, founderId, 'founder']
    );
    
    if (membershipResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(403).json({ error: 'Only clan founder can add free members' });
    }
    
    // Check monthly free member limit (would need tracking table)
    // For simplicity, skipping this check in this example
    
    // Add member with extended expiration
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    await client.query(
      'INSERT INTO clan_members (clan_id, user_id, role, membership_expires_at) VALUES ($1, $2, $3, $4)',
      [clanId, targetUserId, 'member', expiresAt]
    );
    
    // Update clan member count
    await client.query(
      'UPDATE clans SET member_count = member_count + 1 WHERE id = $1',
      [clanId]
    );
    
    await client.query('COMMIT');
    client.release();
    
    res.json({
      success: true,
      message: 'Free member added successfully'
    });
    
  } catch (error) {
    console.error('Error adding free member:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
