const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { GAME_CONFIG } = require('../config/gameConfig');

// Enter tournament
exports.enterTournament = async (req, res) => {
  const { userId, tournamentId, ticketsUsed = 1 } = req.body;
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    // Get user
    const userResult = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    
    // Get tournament
    const tournamentResult = await client.query(
      'SELECT * FROM tournaments WHERE id = $1 AND status = $2',
      [tournamentId, 'active']
    );
    
    if (tournamentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Tournament not active' });
    }
    
    // Check if already entered
    const existingEntry = await client.query(
      'SELECT * FROM tournament_entries WHERE tournament_id = $1 AND user_id = $2',
      [tournamentId, userId]
    );
    
    if (existingEntry.rows.length > 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ error: 'Already entered this tournament' });
    }
    
    // Check tickets (this would be checked against a tickets balance table)
    // For now, assuming tickets are valid
    
    // Create entry
    await client.query(
      'INSERT INTO tournament_entries (tournament_id, user_id, tickets_used) VALUES ($1, $2, $3)',
      [tournamentId, userId, ticketsUsed]
    );
    
    // Award entry points
    const basePoints = GAME_CONFIG.TOURNAMENT.POINTS_PER_ENTRY * ticketsUsed;
    let actualPoints = basePoints;
    
    // Apply VIP boost
    if (user.is_vip) {
      actualPoints = Math.floor(basePoints * (1 + GAME_CONFIG.VIP.POINTS_BOOST));
    }
    
    // Apply clan boost
    const clanResult = await client.query(
      'SELECT cm.role, c.* FROM clan_members cm JOIN clans c ON cm.clan_id = c.id WHERE cm.user_id = $1',
      [userId]
    );
    
    if (clanResult.rows.length > 0) {
      const clanMember = clanResult.rows[0];
      const boost = clanMember.role === 'founder' ? 
        GAME_CONFIG.CLAN.LEADER_REWARD_BOOST : 
        GAME_CONFIG.CLAN.MEMBER_REWARD_BOOST;
      actualPoints = Math.floor(actualPoints * (1 + boost));
    }
    
    // Update user points
    await client.query(
      'UPDATE users SET total_points = total_points + $1, weekly_points = weekly_points + $1, monthly_points = monthly_points + $1, yearly_points = yearly_points + $1 WHERE id = $2',
      [actualPoints, userId]
    );
    
    await client.query('COMMIT');
    client.release();
    
    res.json({
      success: true,
      pointsEarned: actualPoints,
      message: 'Successfully entered tournament'
    });
    
  } catch (error) {
    console.error('Error entering tournament:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  const { type } = req.params; // 'weekly', 'monthly', 'yearly'
  const { limit = 100 } = req.query;
  
  try {
    const pointsColumn = `${type}_points`;
    
    const result = await pool.query(
      `SELECT 
        u.id,
        u.username,
        u.wallet_address,
        u.${pointsColumn} as points,
        u.is_vip,
        cm.clan_id,
        c.name as clan_name,
        ROW_NUMBER() OVER (ORDER BY u.${pointsColumn} DESC) as rank
      FROM users u
      LEFT JOIN clan_members cm ON u.id = cm.user_id
      LEFT JOIN clans c ON cm.clan_id = c.id
      WHERE u.${pointsColumn} > 0
      ORDER BY u.${pointsColumn} DESC
      LIMIT $1`,
      [limit]
    );
    
    res.json({
      leaderboard: result.rows,
      type,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Record match result
exports.recordMatchResult = async (req, res) => {
  const { userId, tournamentId, won } = req.body;
  
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    // Update tournament entry
    const updateField = won ? 'wins' : 'losses';
    await client.query(
      `UPDATE tournament_entries SET ${updateField} = ${updateField} + 1 WHERE tournament_id = $1 AND user_id = $2`,
      [tournamentId, userId]
    );
    
    await client.query('COMMIT');
    client.release();
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error recording match result:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Finalize weekly tournament
exports.finalizeWeeklyTournament = async () => {
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    
    // Get current week's active tournament
    const tournamentResult = await client.query(
      "SELECT * FROM tournaments WHERE type = 'weekly' AND status = 'active' ORDER BY start_date DESC LIMIT 1"
    );
    
    if (tournamentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return;
    }
    
    const tournament = tournamentResult.rows[0];
    
    // Get total weekly points
    const totalPointsResult = await client.query(
      'SELECT SUM(weekly_points) as total FROM users WHERE weekly_points > 0'
    );
    const totalPoints = totalPointsResult.rows[0].total || 0;
    
    if (totalPoints === 0) {
      await client.query('ROLLBACK');
      client.release();
      return;
    }
    
    // Calculate token value per point
    const rewardPool = GAME_CONFIG.TOKENS.WEEKLY_REWARDS;
    let tokenPerPoint = rewardPool / totalPoints;
    
    // Ensure token value is within min/max range
    tokenPerPoint = Math.max(
      GAME_CONFIG.TOKENS.MIN_TOKEN_VALUE,
      Math.min(GAME_CONFIG.TOKENS.MAX_TOKEN_VALUE, tokenPerPoint)
    );
    
    // Distribute rewards
    const usersResult = await client.query(
      'SELECT id, weekly_points FROM users WHERE weekly_points > 0'
    );
    
    for (const user of usersResult.rows) {
      const tokensAwarded = Math.floor(user.weekly_points * tokenPerPoint);
      
      await client.query(
        'UPDATE users SET tokens = tokens + $1 WHERE id = $2',
        [tokensAwarded, user.id]
      );
      
      await client.query(
        'INSERT INTO reward_distributions (tournament_id, user_id, points_earned, tokens_awarded) VALUES ($1, $2, $3, $4)',
        [tournament.id, user.id, user.weekly_points, tokensAwarded]
      );
    }
    
    // Reset weekly points
    await client.query('UPDATE users SET weekly_points = 0');
    
    // Mark tournament as completed
    await client.query(
      'UPDATE tournaments SET status = $1 WHERE id = $2',
      ['completed', tournament.id]
    );
    
    await client.query('COMMIT');
    client.release();
    
    console.log('Weekly tournament finalized successfully');
    
  } catch (error) {
    console.error('Error finalizing weekly tournament:', error);
  }
};

// Similar functions for monthly and yearly tournaments...
exports.finalizeMonthlyTournament = async () => {
  // Similar logic to weekly but using monthly_points
};

exports.finalizeYearlyTournament = async () => {
  // Similar logic but using yearly_points
};
