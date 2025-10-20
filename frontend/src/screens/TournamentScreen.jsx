import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';

const TournamentScreen = () => {
  const { user, userCards } = useGame();
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [registeredDeck, setRegisteredDeck] = useState([]);

  const tournaments = [
    {
      id: 1,
      name: 'Weekly Champion Cup',
      entryFee: 500,
      prize: 5000,
      participants: 128,
      maxParticipants: 256,
      status: 'open',
      startTime: '2025-10-10 18:00',
      format: 'Best of 3',
      level: 'All Levels'
    },
    {
      id: 2,
      name: 'Legendary Masters',
      entryFee: 2000,
      prize: 25000,
      participants: 45,
      maxParticipants: 64,
      status: 'open',
      startTime: '2025-10-12 20:00',
      format: 'Best of 5',
      level: 'Legendary+'
    },
    {
      id: 3,
      name: 'Rookie Tournament',
      entryFee: 100,
      prize: 1000,
      participants: 200,
      maxParticipants: 256,
      status: 'in-progress',
      startTime: '2025-10-05 15:00',
      format: 'Best of 3',
      level: 'Bronze-Silver'
    },
    {
      id: 4,
      name: 'Clan Wars Championship',
      entryFee: 1000,
      prize: 15000,
      participants: 256,
      maxParticipants: 256,
      status: 'full',
      startTime: '2025-10-08 19:00',
      format: 'Best of 5',
      level: 'Gold+'
    }
  ];

  const upcomingMatches = [
    {
      id: 1,
      round: 'Quarter Finals',
      opponent: 'DragonSlayer99',
      opponentRank: 'Diamond III',
      scheduledTime: '2025-10-06 16:00',
      status: 'upcoming'
    },
    {
      id: 2,
      round: 'Round of 16',
      opponent: 'PhoenixRider',
      opponentRank: 'Platinum I',
      scheduledTime: '2025-10-07 18:30',
      status: 'upcoming'
    }
  ];

  const pastResults = [
    {
      id: 1,
      tournament: 'Weekly Champion Cup',
      placement: '3rd',
      prize: 1000,
      date: '2025-09-28'
    },
    {
      id: 2,
      tournament: 'Legendary Masters',
      placement: '8th',
      prize: 500,
      date: '2025-09-20'
    },
    {
      id: 3,
      tournament: 'Rookie Tournament',
      placement: '1st',
      prize: 1000,
      date: '2025-09-15'
    }
  ];

  const handleRegister = (tournament) => {
    if (user.gold >= tournament.entryFee) {
      setSelectedTournament(tournament);
    } else {
      alert('Insufficient gold to register!');
    }
  };

  const handleDeckSelection = (card) => {
    if (registeredDeck.length < 5 && !registeredDeck.find(c => c.id === card.id)) {
      setRegisteredDeck([...registeredDeck, card]);
    }
  };

  const handleRemoveFromDeck = (cardId) => {
    setRegisteredDeck(registeredDeck.filter(c => c.id !== cardId));
  };

  const handleConfirmRegistration = () => {
    if (registeredDeck.length === 5) {
      alert(`Successfully registered for ${selectedTournament.name}!`);
      setSelectedTournament(null);
      setRegisteredDeck([]);
    } else {
      alert('Please select exactly 5 cards for your tournament deck!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-green-400';
      case 'in-progress': return 'text-yellow-400';
      case 'full': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'full': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            Tournament Arena
          </h1>
          <p className="text-gray-300">Compete in tournaments and claim glory!</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <div className="text-gray-400 text-sm mb-1">Gold Balance</div>
            <div className="text-2xl font-bold text-yellow-400">{user.gold.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <div className="text-gray-400 text-sm mb-1">Tournaments Won</div>
            <div className="text-2xl font-bold text-green-400">12</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <div className="text-gray-400 text-sm mb-1">Total Winnings</div>
            <div className="text-2xl font-bold text-purple-400">45,000</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
            <div className="text-gray-400 text-sm mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-blue-400">68%</div>
          </div>
        </div>

        {/* Available Tournaments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="text-3xl mr-2">🏆</span>
            Available Tournaments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusBadge(tournament.status)}`}>
                      {tournament.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-lg">{tournament.prize.toLocaleString()} 💰</div>
                    <div className="text-gray-400 text-sm">Prize Pool</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Entry Fee:</span>
                    <span className="text-white font-semibold">{tournament.entryFee.toLocaleString()} Gold</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Participants:</span>
                    <span className="text-white">{tournament.participants}/{tournament.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Format:</span>
                    <span className="text-white">{tournament.format}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-purple-400">{tournament.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Starts:</span>
                    <span className="text-white">{tournament.startTime}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => handleRegister(tournament)}
                  disabled={tournament.status !== 'open'}
                  className={`w-full py-2 rounded-lg font-semibold transition-all ${
                    tournament.status === 'open'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {tournament.status === 'open' ? 'Register Now' : tournament.status === 'full' ? 'Full' : 'In Progress'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="text-3xl mr-2">⚔️</span>
            Upcoming Matches
          </h2>
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">⚔️</div>
                    <div>
                      <div className="text-sm text-gray-400">{match.round}</div>
                      <div className="text-lg font-bold text-white">VS {match.opponent}</div>
                      <div className="text-sm text-purple-400">{match.opponentRank}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{match.scheduledTime}</div>
                    <button className="mt-2 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all">
                      Join Match
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Results */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="text-3xl mr-2">📜</span>
            Past Results
          </h2>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-purple-500/30 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tournament</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Placement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prize</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {pastResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-700/30 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap text-white">{result.tournament}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm font-semibold">
                        {result.placement}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-yellow-400 font-semibold">
                      {result.prize.toLocaleString()} 💰
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">{result.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registration Modal */}
        {selectedTournament && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full border border-purple-500/50 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                Register for {selectedTournament.name}
              </h2>
              
              <div className="mb-6 p-4 bg-slate-900/50 rounded-lg">
                <div className="text-yellow-400 font-semibold mb-2">
                  Entry Fee: {selectedTournament.entryFee.toLocaleString()} Gold
                </div>
                <div className="text-gray-300 text-sm">
                  Select exactly 5 cards for your tournament deck
                </div>
              </div>

              {/* Selected Deck */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Your Tournament Deck ({registeredDeck.length}/5)</h3>
                <div className="grid grid-cols-5 gap-3 mb-4 min-h-[120px]">
                  {registeredDeck.map((card) => (
                    <div key={card.id} className="relative">
                      <Card card={card} compact />
                      <button
                        onClick={() => handleRemoveFromDeck(card.id)}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Cards */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Your Cards</h3>
                <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto">
                  {userCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleDeckSelection(card)}
                      disabled={registeredDeck.length >= 5 || registeredDeck.find(c => c.id === card.id)}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Card card={card} compact />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmRegistration}
                  disabled={registeredDeck.length !== 5}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Confirm Registration
                </button>
                <button
                  onClick={() => {
                    setSelectedTournament(null);
                    setRegisteredDeck([]);
                  }}
                  className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentScreen;