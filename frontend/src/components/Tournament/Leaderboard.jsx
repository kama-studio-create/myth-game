import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/tournament';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [type, setType] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(type);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      
      <div className="leaderboard-tabs">
        <button
          className={type === 'weekly' ? 'active' : ''}
          onClick={() => setType('weekly')}
        >
          Weekly
        </button>
        <button
          className={type === 'monthly' ? 'active' : ''}
          onClick={() => setType('monthly')}
        >
          Monthly
        </button>
        <button
          className={type === 'yearly' ? 'active' : ''}
          onClick={() => setType('yearly')}
        >
          Yearly
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="leaderboard-table">
          <div className="table-header">
            <span className="rank-col">Rank</span>
            <span className="player-col">Player</span>
            <span className="clan-col">Clan</span>
            <span className="points-col">Points</span>
          </div>
          
          {leaderboard.map(entry => (
            <div key={entry.id} className={`table-row ${getRankColor(entry.rank)}`}>
              <span className="rank-col">
                {entry.rank <= 3 ? (
                  <span className="medal">{['🥇', '🥈', '🥉'][entry.rank - 1]}</span>
                ) : (
                  entry.rank
                )}
              </span>
              <span className="player-col">
                {entry.username || `${entry.wallet_address.slice(0, 6)}...`}
                {entry.is_vip && <span className="vip-badge">VIP</span>}
              </span>
              <span className="clan-col">
                {entry.clan_name || '-'}
              </span>
              <span className="points-col">
                {entry.points.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
