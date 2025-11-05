import React, { useState, useEffect } from 'react';
import { getActiveTournaments, enterTournament } from '../../services/tournament';
import './TournamentLobby.css';

const TournamentLobby = ({ userId, userTickets }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await getActiveTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = async (tournamentId) => {
    try {
      await enterTournament(userId, tournamentId);
      alert('Successfully entered tournament!');
      loadTournaments();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div>Loading tournaments...</div>;

  return (
    <div className="tournament-lobby">
      <div className="lobby-header">
        <h1>Tournament Lobby</h1>
        <div className="ticket-balance">
          <span className="ticket-icon">🎫</span>
          <span>{userTickets} Tickets</span>
        </div>
      </div>

      <div className="tournaments-list">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="tournament-card">
            <div className="tournament-header">
              <h3>{tournament.name}</h3>
              <span className={`status ${tournament.status}`}>
                {tournament.status}
              </span>
            </div>
            
            <div className="tournament-info">
              <div className="info-item">
                <span className="label">Type:</span>
                <span className="value">{tournament.type}</span>
              </div>
              <div className="info-item">
                <span className="label">Reward Pool:</span>
                <span className="value">
                  {tournament.reward_pool.toLocaleString()} Tokens
                </span>
              </div>
              <div className="info-item">
                <span className="label">Start:</span>
                <span className="value">
                  {new Date(tournament.start_date).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <span className="label">End:</span>
                <span className="value">
                  {new Date(tournament.end_date).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              className="enter-btn"
              onClick={() => handleEnter(tournament.id)}
              disabled={tournament.status !== 'active' || userTickets < 1}
            >
              Enter Tournament (1 Ticket)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentLobby;
