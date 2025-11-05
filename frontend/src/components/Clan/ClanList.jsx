import React, { useState, useEffect } from 'react';
import { getClanList } from '../../services/clan';
import { useNavigate } from 'react-router-dom';
import './ClanList.css';

const ClanList = () => {
  const [clans, setClans] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClans();
  }, [search]);

  const loadClans = async () => {
    setLoading(true);
    try {
      const data = await getClanList(search);
      setClans(data.clans);
    } catch (error) {
      console.error('Error loading clans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clan-list">
      <div className="clan-list-header">
        <h1>Clans</h1>
        <button
          className="create-clan-btn"
          onClick={() => navigate('/clan/create')}
        >
          Create Clan
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search clans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading clans...</div>
      ) : (
        <div className="clans-grid">
          {clans.map(clan => (
            <div
              key={clan.id}
              className="clan-card"
              onClick={() => navigate(`/clan/${clan.id}`)}
            >
              <div className="clan-header">
                <h3>{clan.name}</h3>
                <span className="clan-level">Lvl {clan.level}</span>
              </div>
              
              <p className="clan-description">
                {clan.description || 'No description'}
              </p>
              
              <div className="clan-stats">
                <div className="stat">
                  <span className="label">Members</span>
                  <span className="value">
                    {clan.member_count}/{clan.capacity}
                  </span>
                </div>
                <div className="stat">
                  <span className="label">Founder</span>
                  <span className="value">{clan.founder_username}</span>
                </div>
              </div>
              
              <div className="clan-footer">
                <span className="created-date">
                  Created {new Date(clan.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClanList;
