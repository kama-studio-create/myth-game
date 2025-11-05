import React, { useState } from 'react';
import CardDisplay from '../Cards/CardDisplay';
import './TournamentBattle.css';

const TournamentBattle = ({ userCards, onBattleComplete }) => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [battleResult, setBattleResult] = useState(null);

  const handleCardSelect = (card) => {
    if (selectedCards.length < 3) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const startBattle = async () => {
    if (selectedCards.length !== 3) {
      alert('Please select 3 cards');
      return;
    }

    setBattleInProgress(true);

    // Simulate battle (replace with actual battle logic)
    const totalPower = selectedCards.reduce((sum, card) => sum + card.atk + card.def + card.hp, 0);
    const opponentPower = Math.random() * 500 + 200;
    
    const won = totalPower > opponentPower;

    setTimeout(() => {
      setBattleResult({ won, totalPower, opponentPower });
      setBattleInProgress(false);
      onBattleComplete(won);
    }, 3000);
  };

  return (
    <div className="tournament-battle">
      <h2>Select Your Battle Team</h2>
      
      <div className="selected-cards">
        <h3>Your Team ({selectedCards.length}/3)</h3>
        <div className="cards-grid">
          {selectedCards.map((card, index) => (
            <CardDisplay key={index} card={card} />
          ))}
        </div>
      </div>

      <div className="available-cards">
        <h3>Available Cards</h3>
        <div className="cards-grid">
          {userCards
            .filter(card => !selectedCards.includes(card))
            .map(card => (
              <CardDisplay
                key={card.id}
                card={card}
                onClick={() => handleCardSelect(card)}
                selectable
              />
            ))}
        </div>
      </div>

      <button
        className="battle-btn"
        onClick={startBattle}
        disabled={selectedCards.length !== 3 || battleInProgress}
      >
        {battleInProgress ? 'Battle in Progress...' : 'Start Battle'}
      </button>

      {battleResult && (
        <div className={`battle-result ${battleResult.won ? 'victory' : 'defeat'}`}>
          <h2>{battleResult.won ? '🎉 VICTORY!' : '😔 DEFEAT'}</h2>
          <p>Your Power: {battleResult.totalPower}</p>
          <p>Opponent Power: {battleResult.opponentPower}</p>
        </div>
      )}
    </div>
  );
};

export default TournamentBattle;
