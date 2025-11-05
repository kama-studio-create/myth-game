import React, { useState, useEffect } from 'react';
import { getClanDetails, joinClan, leaveClan, upgradeClan } from '../../services/clan';
import { GAME_CONFIG } from '../../config/gameConfig';
import './ClanDetails.css';

const ClanDetails = ({ clanId, userId, userRole }) => {
  const [clan, setClan] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClanDetails();
  }, [clanId]);

  const loadClanDetails = async () => {
    try {
      const data = await getClanDetails(clanId);
      setClan(data.clan);
      setMembers(data.members);
    } catch (error) {
      console.error('Error loading clan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await joinClan(userId, clanId);
      alert('Successfully joined clan!');
      loadClanDetails();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this clan?')) return;
    
    try {
      await leaveClan(userId);
      alert('Left clan successfully');
      loadClanDetails();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpgrade = async () => {
    if (!confirm(`Upgrade clan for ${GAME_CONFIG.CLAN.UPGRADE_COST} TON?`)) return;
    
    try {
      await upgradeClan(userId, clanId);
      alert('Clan upgraded successfully!');
      loadClanDetails();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!clan) return <div>Clan not found</div>;

  const isFounder = userRole === 'founder';
  const isMember = members.some(m => m.id === userId);

  return (
    <div className="clan-details">
      <div className="clan-banner">
        <div className="clan-info">
          <h1>{clan.name}</h1>
          <span className="clan-level">Level {clan.level}</span>
        </div>
        
        <div className="clan-actions">
          {!isMember && (
            <button className="join-btn" onClick={handleJoin}>
              Join Clan ({GAME_CONFIG.CLAN.MONTHLY_MEMBERSHIP} TON/month)
            </button>
          )}
          {isMember && !isFounder && (
            <button className="leave-btn" onClick={handleLeave}>
              Leave Clan
            </button>
          )}
          {isFounder && (
            <button className="upgrade-btn" onClick={handleUpgrade}>
              Upgrade Clan ({GAME_CONFIG.CLAN.UPGRADE_COST} TON)
            </button>
          )}
        </div>
      </div>

      <div className="clan-content">
        <div className="clan-description">
          <h3>Description</h3>
          <p>{clan.description || 'No description provided'}</p>
        </div>

        <div className="clan-stats-grid">
          <div className="stat-card">
            <span className="stat-label">Members</span>
            <span className="stat-value">{clan.member_count}/{clan.capacity}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Level</span>
            <span className="stat-value">{clan.level}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Treasury</span>
            <span className="stat-value">{clan.treasury_balance} TON</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Founded</span>
            <span className="stat-value">
              {new Date(clan.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="clan-benefits">
          <h3>Clan Benefits</h3>
          <ul>
            <li>🎫 {isFounder ? GAME_CONFIG.CLAN.FOUNDER_TICKETS : GAME_CONFIG.CLAN.MEMBER_TICKETS} free battle tickets monthly</li>
            <li>⬆️ {isFounder ? (GAME_CONFIG.CLAN.LEADER_REWARD_BOOST * 100) : (GAME_CONFIG.CLAN.MEMBER_REWARD_BOOST * 100)}% tournament reward boost</li>
            <li>👥 Exclusive clan chat and events</li>
          </ul>
        </div>

        <div className="clan-members">
          <h3>Members ({members.length})</h3>
          <div className="members-table">
            <div className="table-header">
              <span>Player</span>
              <span>Role</span>
              <span>Points</span>
              <span>Joined</span>
            </div>
            {members.map(member => (
              <div key={member.id} className="member-row">
                <span className="member-name">
                  {member.username || `${member.wallet_address.slice(0, 8)}...`}
                  {member.is_vip && <span className="vip-badge">VIP</span>}
                </span>
                <span className={`member-role ${member.role}`}>
                  {member.role === 'founder' ? '👑 Founder' : '👤 Member'}
                </span>
                <span>{member.total_points.toLocaleString()}</span>
                <span>{new Date(member.joined_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClanDetails;
