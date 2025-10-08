import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';

const BattleScreen = () => {
  const { user, userCards, activeDeck, updateUserStats } = useGame();
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [battleState, setBattleState] = useState('setup'); // setup, fighting, result
  const [battleLog, setBattleLog] = useState([]);
  const [playerHealth, setPlayerHealth] = useState(1000);
  const [opponentHealth, setOpponentHealth] = useState(1000);
  const [maxPlayerHealth, setMaxPlayerHealth] = useState(1000);
  const [maxOpponentHealth, setMaxOpponentHealth] = useState(1000);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleResult, setBattleResult] = useState(null);
  const [battleAnimation, setBattleAnimation] = useState(null);
  const [selectedPlayerCard, setSelectedPlayerCard] = useState(null);
  const [selectedOpponentCard, setSelectedOpponentCard] = useState(null);

  useEffect(() => {
    // Set active deck on component mount
    if (activeDeck) {
      setSelectedDeck(activeDeck);
    }
  }, [activeDeck]);

  useEffect(() => {
    if (battleState === 'fighting' && !battleAnimation) {
      const timer = setTimeout(() => {
        simulateBattleTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, battleState, isPlayerTurn, battleAnimation]);

  // Generate opponent deck
  const generateOpponentDeck = () => {
    const opponentCards = [];
    const types = ['Warrior', 'Mage', 'Assassin', 'Tank', 'Support'];
    const rarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
    const names = {
      Warrior: ['Blade Master', 'Steel Knight', 'War Chief', 'Battle Lord', 'Iron Warrior'],
      Mage: ['Fire Sorcerer', 'Ice Wizard', 'Storm Mage', 'Arcane Master', 'Mystic Sage'],
      Assassin: ['Shadow Blade', 'Night Stalker', 'Silent Death', 'Phantom Rogue', 'Dark Assassin'],
      Tank: ['Stone Guardian', 'Iron Defender', 'Shield Bearer', 'Fortress Knight', 'Wall Breaker'],
      Support: ['Holy Priest', 'Life Bringer', 'Divine Healer', 'Spirit Shaman', 'Light Keeper']
    };
    
    for (let i = 0; i < 5; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];
      const levelVariance = Math.floor(Math.random() * 3) - 1; // -1 to +1
      const level = Math.max(1, Math.min(user.level + levelVariance, 99));
      
      const rarityMultipliers = {
        Common: 1,
        Rare: 1.5,
        Epic: 2,
        Legendary: 3,
        Mythic: 5
      };
      
      const multiplier = rarityMultipliers[rarity];
      
      opponentCards.push({
        id: `opp-${i}`,
        name: names[type][Math.floor(Math.random() * names[type].length)],
        type: type,
        rarity: rarity,
        level: level,
        attack: Math.floor((50 + Math.floor(Math.random() * 50)) * multiplier),
        defense: Math.floor((40 + Math.floor(Math.random() * 40)) * multiplier),
        health: Math.floor((150 + Math.floor(Math.random() * 100)) * multiplier),
        ability: generateAbility(type),
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=opponent${i}${Date.now()}`,
      });
    }
    
    return opponentCards;
  };

  const generateAbility = (type) => {
    const abilities = {
      Warrior: ['Powerful Strike', 'Shield Bash', 'War Cry', 'Blade Dance', 'Berserk Mode'],
      Mage: ['Fireball', 'Ice Blast', 'Lightning Strike', 'Meteor Shower', 'Arcane Explosion'],
      Assassin: ['Backstab', 'Poison Strike', 'Shadow Step', 'Critical Hit', 'Deadly Combo'],
      Tank: ['Iron Defense', 'Taunt', 'Shield Wall', 'Counter Attack', 'Last Stand'],
      Support: ['Healing Wave', 'Divine Protection', 'Buff Ally', 'Cleanse', 'Resurrection']
    };
    return abilities[type][Math.floor(Math.random() * abilities[type].length)];
  };

  // Start battle
  const startBattle = () => {
    if (!selectedDeck || selectedDeck.cards.length < 5) {
      alert('Please select a deck with at least 5 cards!');
      return;
    }

    if (user.energy < 10) {
      alert('Not enough energy! Wait for energy to regenerate.');
      return;
    }

    // Generate opponent
    const enemyDeck = generateOpponentDeck();
    const enemyName = ['Dark Lord', 'Shadow Master', 'Crimson Warrior', 'Ice King', 'Thunder God'][Math.floor(Math.random() * 5)];
    
    setOpponent({
      name: enemyName,
      level: user.level,
      avatar: '🤖',
      deck: enemyDeck,
    });
    
    // Calculate total health
    const playerTotalHealth = selectedDeck.cards.reduce((sum, card) => sum + card.health, 0);
    const opponentTotalHealth = enemyDeck.reduce((sum, card) => sum + card.health, 0);
    
    setPlayerHealth(playerTotalHealth);
    setMaxPlayerHealth(playerTotalHealth);
    setOpponentHealth(opponentTotalHealth);
    setMaxOpponentHealth(opponentTotalHealth);
    
    setBattleState('fighting');
    setBattleLog([`⚔️ Battle started against ${enemyName}!`, `💪 Your deck power: ${playerTotalHealth}`, `🤖 Enemy deck power: ${opponentTotalHealth}`]);
    setCurrentTurn(1);
    setIsPlayerTurn(true);
  };

  // Simulate battle turn
  const simulateBattleTurn = () => {
    if (battleState !== 'fighting') return;

    if (isPlayerTurn) {
      // Player's turn
      const playerCard = selectedDeck.cards[Math.floor(Math.random() * selectedDeck.cards.length)];
      const opponentCard = opponent.deck[Math.floor(Math.random() * opponent.deck.length)];
      
      setSelectedPlayerCard(playerCard);
      setSelectedOpponentCard(opponentCard);
      
      const damage = calculateDamage(playerCard, opponentCard);
      const isCritical = Math.random() < 0.15;
      const finalDamage = isCritical ? Math.floor(damage * 2) : damage;
      
      const newOpponentHealth = Math.max(0, opponentHealth - finalDamage);
      
      setOpponentHealth(newOpponentHealth);
      
      const logMessage = isCritical 
        ? `💥 CRITICAL! Your ${playerCard.name} deals ${finalDamage} damage!`
        : `⚔️ Your ${playerCard.name} attacks for ${finalDamage} damage!`;
      
      setBattleLog(prev => [...prev, logMessage]);
      setBattleAnimation({ type: 'player-attack', damage: finalDamage, critical: isCritical });
      
      setTimeout(() => {
        setBattleAnimation(null);
        setSelectedPlayerCard(null);
        setSelectedOpponentCard(null);
        
        if (newOpponentHealth <= 0) {
          endBattle(true);
        } else {
          setIsPlayerTurn(false);
        }
      }, 1200);
      
    } else {
      // Opponent's turn
      const opponentCard = opponent.deck[Math.floor(Math.random() * opponent.deck.length)];
      const playerCard = selectedDeck.cards[Math.floor(Math.random() * selectedDeck.cards.length)];
      
      setSelectedPlayerCard(playerCard);
      setSelectedOpponentCard(opponentCard);
      
      const damage = calculateDamage(opponentCard, playerCard);
      const isCritical = Math.random() < 0.15;
      const finalDamage = isCritical ? Math.floor(damage * 2) : damage;
      
      const newPlayerHealth = Math.max(0, playerHealth - finalDamage);
      
      setPlayerHealth(newPlayerHealth);
      
      const logMessage = isCritical
        ? `💥 CRITICAL! Enemy ${opponentCard.name} deals ${finalDamage} damage!`
        : `🗡️ Enemy ${opponentCard.name} attacks for ${finalDamage} damage!`;
      
      setBattleLog(prev => [...prev, logMessage]);
      setBattleAnimation({ type: 'opponent-attack', damage: finalDamage, critical: isCritical });
      
      setTimeout(() => {
        setBattleAnimation(null);
        setSelectedPlayerCard(null);
        setSelectedOpponentCard(null);
        
        if (newPlayerHealth <= 0) {
          endBattle(false);
        } else {
          setIsPlayerTurn(true);
          setCurrentTurn(prev => prev + 1);
        }
      }, 1200);
    }
  };

  // Calculate damage with type advantages
  const calculateDamage = (attackerCard, defenderCard) => {
    const baseAttack = attackerCard.attack;
    const defense = defenderCard.defense;
    
    // Calculate base damage with defense reduction
    const damageReduction = Math.min(defense * 0.4, baseAttack * 0.6);
    let damage = Math.max(baseAttack - damageReduction, baseAttack * 0.25);
    
    // Type advantage multiplier
    const typeBonus = getTypeAdvantage(attackerCard.type, defenderCard.type);
    damage *= typeBonus;
    
    // Random variance (±15%)
    const randomFactor = 0.85 + Math.random() * 0.3;
    damage *= randomFactor;
    
    return Math.floor(damage);
  };

  // Get type advantage
  const getTypeAdvantage = (attackerType, defenderType) => {
    const advantages = {
      Warrior: { Mage: 1.3, Assassin: 0.8, Tank: 0.9, Support: 1.1, Warrior: 1.0 },
      Mage: { Tank: 1.3, Warrior: 0.8, Assassin: 1.1, Support: 0.9, Mage: 1.0 },
      Assassin: { Support: 1.3, Tank: 0.8, Mage: 1.0, Warrior: 1.1, Assassin: 1.0 },
      Tank: { Assassin: 1.3, Support: 1.0, Warrior: 1.1, Mage: 0.8, Tank: 1.0 },
      Support: { Warrior: 1.2, Tank: 1.0, Mage: 1.1, Assassin: 0.7, Support: 1.0 },
    };
    
    return advantages[attackerType]?.[defenderType] || 1.0;
  };

  // End battle
  const endBattle = (playerWon) => {
    setBattleState('result');
    
    const goldReward = playerWon ? 150 : 50;
    const expReward = playerWon ? 100 : 25;
    const ratingChange = playerWon ? 25 : -15;
    
    const result = {
      winner: playerWon,
      rewards: {
        gold: goldReward,
        experience: expReward,
        rating: ratingChange,
      },
    };
    
    setBattleResult(result);
    setBattleLog(prev => [...prev, '', playerWon ? '🎉 VICTORY!' : '💀 DEFEAT!', `💰 +${goldReward} Gold`, `⭐ +${expReward} XP`, `📊 ${ratingChange > 0 ? '+' : ''}${ratingChange} Rating`]);
    
    // Update user stats (in real app, this would call updateUserStats from context)
    if (updateUserStats) {
      updateUserStats({
        gold: user.gold + goldReward,
        experience: user.experience + expReward,
        rating: user.rating + ratingChange,
        energy: user.energy - 10,
        totalBattles: user.stats.totalBattles + 1,
        wins: playerWon ? user.stats.wins + 1 : user.stats.wins,
        losses: playerWon ? user.stats.losses : user.stats.losses + 1,
      });
    }
  };

  // Reset battle
  const resetBattle = () => {
    setBattleState('setup');
    setBattleLog([]);
    setPlayerHealth(1000);
    setOpponentHealth(1000);
    setMaxPlayerHealth(1000);
    setMaxOpponentHealth(1000);
    setCurrentTurn(0);
    setIsPlayerTurn(true);
    setBattleResult(null);
    setOpponent(null);
    setBattleAnimation(null);
    setSelectedPlayerCard(null);
    setSelectedOpponentCard(null);
  };

  // Render battle setup screen
  const renderSetup = () => (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="text-3xl mr-2">📊</span>
          Your Battle Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
            <div className="text-gray-400 text-sm mb-1">Level</div>
            <div className="text-2xl font-bold text-purple-400">{user.level}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-green-500/20">
            <div className="text-gray-400 text-sm mb-1">Energy</div>
            <div className="text-2xl font-bold text-green-400">{user.energy}/100</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-blue-500/20">
            <div className="text-gray-400 text-sm mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-blue-400">
              {user.stats.totalBattles > 0 
                ? ((user.stats.wins / user.stats.totalBattles) * 100).toFixed(1) 
                : 0}%
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-yellow-500/20">
            <div className="text-gray-400 text-sm mb-1">Rating</div>
            <div className="text-2xl font-bold text-yellow-400">{user.rating}</div>
          </div>
        </div>
      </div>

      {/* Selected Deck */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="text-3xl mr-2">🎴</span>
          Your Battle Deck
        </h2>
        {selectedDeck && selectedDeck.cards.length >= 5 ? (
          <>
            <div className="mb-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{selectedDeck.name}</h3>
                  <div className="text-sm text-gray-300">
                    💪 Power: {selectedDeck.cards.reduce((sum, card) => sum + card.attack + card.defense, 0).toLocaleString()} | 
                    🎴 Cards: {selectedDeck.cards.length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Health</div>
                  <div className="text-xl font-bold text-green-400">
                    {selectedDeck.cards.reduce((sum, card) => sum + card.health, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {selectedDeck.cards.map((card) => (
                <div key={card.id} className="transform hover:scale-105 transition-transform">
                  <Card card={card} compact />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-dashed border-purple-500/30">
            <div className="text-6xl mb-4">🎴</div>
            <p className="text-gray-400 mb-4 text-lg">No deck selected or insufficient cards</p>
            <p className="text-gray-500 text-sm mb-6">You need at least 5 cards in your deck to battle</p>
            <button 
              onClick={() => window.location.href = '/deck-builder'}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              Go to Deck Builder
            </button>
          </div>
        )}
      </div>

      {/* Battle Types */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="text-3xl mr-2">⚔️</span>
          Select Battle Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Match */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-500/30 hover:border-green-500/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-green-500/20">
            <div className="text-4xl mb-3">⚔️</div>
            <h3 className="text-xl font-bold text-white mb-2">Quick Match</h3>
            <p className="text-sm text-gray-300 mb-4">Fast battles against AI opponents for quick rewards</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Reward:</span>
                <span className="text-yellow-400 font-semibold">150 Gold</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">XP:</span>
                <span className="text-blue-400 font-semibold">100 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Energy:</span>
                <span className="text-green-400 font-semibold">-10 Energy</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold inline-block">
              AVAILABLE NOW
            </div>
          </div>
          
          {/* Ranked Match */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/20 opacity-60 cursor-not-allowed">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Ranked Match</h3>
            <p className="text-sm text-gray-300 mb-4">Competitive battles with ranking system</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Reward:</span>
                <span className="text-yellow-400 font-semibold">225 Gold</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">XP:</span>
                <span className="text-blue-400 font-semibold">150 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Rating:</span>
                <span className="text-purple-400 font-semibold">±25-50</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded text-xs font-semibold inline-block">
              COMING SOON
            </div>
          </div>
          
          {/* PvP Battle */}
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-lg p-6 border border-red-500/20 opacity-60 cursor-not-allowed">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">PvP Battle</h3>
            <p className="text-sm text-gray-300 mb-4">Real-time battles against other players</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Reward:</span>
                <span className="text-yellow-400 font-semibold">300 Gold</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">XP:</span>
                <span className="text-blue-400 font-semibold">200 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Wager:</span>
                <span className="text-red-400 font-semibold">Optional</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded text-xs font-semibold inline-block">
              COMING SOON
            </div>
          </div>
        </div>
      </div>

      {/* Start Battle Button */}
      <div className="flex justify-center">
        <button
          onClick={startBattle}
          disabled={!selectedDeck || selectedDeck.cards.length < 5 || user.energy < 10}
          className="group relative px-16 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-2xl font-bold rounded-xl shadow-2xl transform hover:scale-105 disabled:hover:scale-100 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <span className="text-3xl">⚔️</span>
            <span>START BATTLE</span>
            <span className="text-3xl">⚔️</span>
          </div>
          {(!selectedDeck || selectedDeck.cards.length < 5) && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-red-400 text-sm whitespace-nowrap">
              Need a deck with 5+ cards
            </div>
          )}
          {user.energy < 10 && selectedDeck && selectedDeck.cards.length >= 5 && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-red-400 text-sm whitespace-nowrap">
              Not enough energy (10 required)
            </div>
          )}
        </button>
      </div>

      {/* Recent Battles */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="text-3xl mr-2">📜</span>
          Recent Battles
        </h2>
        <div className="space-y-2">
          {user.stats.totalBattles > 0 ? (
            <>
              <div className="flex justify-between items-center p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="text-white font-semibold">Victory vs Shadow Master</div>
                    <div className="text-sm text-gray-400">2 hours ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">+150 Gold</div>
                  <div className="text-sm text-blue-400">+100 XP</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <div className="text-white font-semibold">Defeat vs Ice King</div>
                    <div className="text-sm text-gray-400">5 hours ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-semibold">+50 Gold</div>
                  <div className="text-sm text-blue-400">+25 XP</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-5xl mb-3">🎮</div>
              <p>No battles yet. Start your first battle!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render battle in progress
  const renderBattle = () => (
    <div className="space-y-4">
      {/* Battle Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-lg p-6 border-2 border-purple-500 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="text-5xl mb-2">{user.avatar || '🎮'}</div>
            <div className="text-xl font-bold text-white">{user.username}</div>
            <div className="text-sm text-purple-300">Level {user.level}</div>
          </div>
          
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-yellow-400 mb-2 animate-pulse">Turn {currentTurn}</div>
            <div className="text-lg font-semibold">
              {isPlayerTurn ? (
                <span className="text-green-400">⚡ Your Turn</span>
              ) : (
                <span className="text-red-400">🤖 Enemy Turn</span>
              )}
            </div>
          </div>
          
          <div className="text-center flex-1">
            <div className="text-5xl mb-2">{opponent?.avatar || '🤖'}</div>
            <div className="text-xl font-bold text-white">{opponent?.name}</div>
            <div className="text-sm text-pink-300">Level {opponent?.level}</div>
          </div>
        </div>
      </div>

      {/* Health Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Health */}
        <div className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 border-2 transition-all ${
          battleAnimation?.type === 'opponent-attack' ? 'border-red-500 shadow-lg shadow-red-500/50 animate-pulse' : 'border-green-500/30'
        }`}>
          <div className="flex justify-between mb-3">
            <span className="text-white font-bold text-lg">💚 Your Health</span>
            <span className="text-green-400 font-bold text-xl">{playerHealth.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden border-2 border-slate-600">
            <div
              className={`h-8 rounded-full transition-all duration-500 flex items-center justify-center ${
                playerHealth > maxPlayerHealth * 0.5 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                playerHealth > maxPlayerHealth * 0.25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              style={{ width: `${Math.max((playerHealth / maxPlayerHealth) * 100, 5)}%` }}
            >
              {battleAnimation?.type === 'opponent-attack' && (
                <span className="text-white font-bold text-lg animate-bounce">
                  -{battleAnimation.damage}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2 text-right">
            {((playerHealth / maxPlayerHealth) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Opponent Health */}
        <div className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 border-2 transition-all ${
          battleAnimation?.type === 'player-attack' ? 'border-green-500 shadow-lg shadow-green-500/50 animate-pulse' : 'border-red-500/30'
        }`}>
          <div className="flex justify-between mb-3">
            <span className="text-white font-bold text-lg">💔 Enemy Health</span>
            <span className="text-red-400 font-bold text-xl">{opponentHealth.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden border-2 border-slate-600">
            <div
              className={`h-8 rounded-full transition-all duration-500 flex items-center justify-center ${
                opponentHealth > maxOpponentHealth * 0.5 ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                opponentHealth > maxOpponentHealth * 0.25 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                'bg-gradient-to-r from-gray-500 to-gray-700'
              }`}
              style={{ width: `${Math.max((opponentHealth / maxOpponentHealth) * 100, 5)}%` }}
            >
              {battleAnimation?.type === 'player-attack' && (
                <span className="text-white font-bold text-lg animate-bounce">
                  -{battleAnimation.damage}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2 text-right">
            {((opponentHealth / maxOpponentHealth) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Battle Arena - Cards Display */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 min-h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          {/* Player's Active Card */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-green-400 mb-4">Your Fighter</h3>
            {selectedPlayerCard ? (
              <div className={`transform transition-all duration-500 ${
                battleAnimation?.type === 'player-attack' ? 'scale-110 translate-x-8' : 'scale-100'
              }`}>
                <Card card={selectedPlayerCard} />
                {battleAnimation?.type === 'player-attack' && (
                  <div className="text-center mt-3">
                    <span className={`text-2xl font-bold ${battleAnimation.critical ? 'text-yellow-400 animate-bounce' : 'text-green-400'}`}>
                      {battleAnimation.critical && '💥 CRITICAL! '}
                      {battleAnimation.damage} DMG
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-48 h-64 bg-slate-700/50 rounded-lg border-2 border-dashed border-green-500/30 flex items-center justify-center">
                <span className="text-gray-500 text-5xl">🎴</span>
              </div>
            )}
          </div>

          {/* Opponent's Active Card */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-red-400 mb-4">Enemy Fighter</h3>
            {selectedOpponentCard ? (
              <div className={`transform transition-all duration-500 ${
                battleAnimation?.type === 'opponent-attack' ? 'scale-110 -translate-x-8' : 'scale-100'
              }`}>
                <Card card={selectedOpponentCard} />
                {battleAnimation?.type === 'opponent-attack' && (
                  <div className="text-center mt-3">
                    <span className={`text-2xl font-bold ${battleAnimation.critical ? 'text-yellow-400 animate-bounce' : 'text-red-400'}`}>
                      {battleAnimation.critical && '💥 CRITICAL! '}
                      {battleAnimation.damage} DMG
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-48 h-64 bg-slate-700/50 rounded-lg border-2 border-dashed border-red-500/30 flex items-center justify-center">
                <span className="text-gray-500 text-5xl">🎴</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center">
          <span className="text-2xl mr-2">📜</span>
          Battle Log
        </h3>
        <div className="bg-slate-900/50 rounded-lg p-4 h-48 overflow-y-auto space-y-1 custom-scrollbar">
          {battleLog.map((log, index) => (
            <div 
              key={index} 
              className={`text-sm ${
                log.includes('Your') ? 'text-green-400' : 
                log.includes('Enemy') ? 'text-red-400' : 
                log.includes('CRITICAL') ? 'text-yellow-400 font-bold' :
                'text-gray-300'
              } ${index === battleLog.length - 1 ? 'animate-fadeIn' : ''}`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render battle result
  const renderResult = () => (
    <div className="max-w-2xl mx-auto">
      <div className={`bg-gradient-to-br ${
        battleResult?.winner ? 'from-green-900/50 to-emerald-900/50 border-green-500' : 'from-red-900/50 to-pink-900/50 border-red-500'
      } backdrop-blur-sm rounded-lg p-8 border-2 shadow-2xl`}>
        
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce">
            {battleResult?.winner ? '🏆' : '💀'}
          </div>
          <h2 className={`text-5xl font-bold mb-2 ${
            battleResult?.winner ? 'text-green-400' : 'text-red-400'
          }`}>
            {battleResult?.winner ? 'VICTORY!' : 'DEFEAT!'}
          </h2>
          <p className="text-xl text-gray-300">
            {battleResult?.winner 
              ? 'You have defeated your opponent!' 
              : 'You have been defeated...'}
          </p>
        </div>

        {/* Battle Stats */}
        <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Battle Summary</h3>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Your Final Health</div>
              <div className="text-3xl font-bold text-green-400">{playerHealth}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Enemy Final Health</div>
              <div className="text-3xl font-bold text-red-400">{opponentHealth}</div>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-slate-700">
            <div className="text-gray-400 text-sm mb-1">Total Turns</div>
            <div className="text-2xl font-bold text-purple-400">{currentTurn}</div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center">
            <span className="text-2xl mr-2">🎁</span>
            Rewards Earned
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <span className="text-white font-semibold flex items-center">
                <span className="text-2xl mr-2">💰</span>
                Gold
              </span>
              <span className="text-yellow-400 text-2xl font-bold">+{battleResult?.rewards.gold}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <span className="text-white font-semibold flex items-center">
                <span className="text-2xl mr-2">⭐</span>
                Experience
              </span>
              <span className="text-blue-400 text-2xl font-bold">+{battleResult?.rewards.experience}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <span className="text-white font-semibold flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Rating Change
              </span>
              <span className={`text-2xl font-bold ${
                battleResult?.rewards.rating > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {battleResult?.rewards.rating > 0 ? '+' : ''}{battleResult?.rewards.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Battle Log Summary */}
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-white mb-3">Final Battle Log</h3>
          <div className="bg-slate-950/50 rounded p-3 h-32 overflow-y-auto space-y-1 custom-scrollbar">
            {battleLog.slice(-10).map((log, index) => (
              <div key={index} className="text-sm text-gray-300">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={resetBattle}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all"
          >
            ⚔️ Battle Again
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white text-lg font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all"
          >
            🏠 Return Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            Battle Arena
          </h1>
          <p className="text-gray-300">Test your deck against formidable opponents!</p>
        </div>

        {/* Render appropriate screen based on battle state */}
        {battleState === 'setup' && renderSetup()}
        {battleState === 'fighting' && renderBattle()}
        {battleState === 'result' && renderResult()}
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #9333ea, #ec4899);
          border-radius: 10px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BattleScreen;