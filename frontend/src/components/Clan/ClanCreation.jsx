import React, { useState } from 'react';
import { createClan } from '../../services/clan';
import { useNavigate } from 'react-router-dom';
import { GAME_CONFIG } from '../../config/gameConfig';
import './ClanCreation.css';

const ClanCreation = ({ userId }) => {
  const [clanName, setClanName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!clanName.trim()) {
      alert('Please enter a clan name');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await createClan(userId, clanName, description);
      alert('Clan created successfully!');
      navigate(`/clan/${result.clan.id}`);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clan-creation">
      <h1>Create a Clan</h1>
      
      <div className="creation-info">
        <p>
          Creating a clan costs <strong>{GAME_CONFIG.CLAN.CREATION_COST} TON</strong>
        </p>
        <p>Initial capacity: {GAME_CONFIG.CLAN.INITIAL_CAPACITY} members</p>
      </div>

      <form onSubmit={handleCreate} className="creation-form">
        <div className="form-group">
          <label>Clan Name *</label>
          <input
            type="text"
            value={clanName}
            onChange={(e) => setClanName(e.target.value)}
            maxLength={50}
            placeholder="Enter clan name"
            required
          />
          <small>{clanName.length}/50 characters</small>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="Describe your clan..."
            rows={5}
          />
          <small>{description.length}/500 characters</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/clan')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : `Create Clan (${GAME_CONFIG.CLAN.CREATION_COST} TON)`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClanCreation;
