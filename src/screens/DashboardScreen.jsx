import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { user, userCards = [], activeDeck } = useGame();
  const [showDailyRewards, setShowDailyRewards] = useState(false);

  const quickActions = [
    { name: 'Battle Arena', icon: '⚔️', path: '/battle', color: 'from-green-600 to-emerald-600', description: 'Fight opponents' },
    { name: 'Deck Builder', icon: '🎴', path: '/deck-builder', color: 'from-blue-600 to-cyan-600', description: 'Build your deck' },
    { name: 'Marketplace', icon: '🏪', path: '/marketplace', color: 'from-purple-600 to-pink-600', description: 'Buy card packs' },
    { name: 'Clan Hall', icon: '🛡️', path: '/clan', color: 'from-orange-600 to-red-600', description: 'Join a clan' },
    { name: 'Tournaments', icon: '🏆', path: '/tournament', color: 'from-yellow-600 to-amber-600', description: 'Compete for prizes' },
    { name: 'Leaderboard', icon: '📊', path: '/leaderboard', color: 'from-indigo-600 to-purple-600', description: 'View rankings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'Warrior'}! 👋
          </h1>
          <p className="text-gray-300">Ready for battle?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <div className="text-gray-400 text-sm mb-1">Level</div>
            <div className="text-3xl font-bold text-purple-400">{user?.level || 1}</div>
            <div className="text-xs text-gray-500 mt-1">XP: {user?.experience || 0}/500</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30">
            <div className="text-gray-400 text-sm mb-1">Gold</div>
            <div className="text-3xl font-bold text-yellow-400">{(user?.gold || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">💰 Currency</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-green-500/30">
            <div className="text-gray-400 text-sm mb-1">Win Rate</div>
            <div className="text-3xl font-bold text-green-400">
              {user?.stats?.totalBattles > 0 
                ? ((user.stats.wins / user.stats.totalBattles) * 100).toFixed(0) 
                : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {user?.stats?.wins || 0}W / {user?.stats?.losses || 0}L
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
            <div className="text-gray-400 text-sm mb-1">Rating</div>
            <div className="text-3xl font-bold text-blue-400">{user?.rating || 1000}</div>
            <div className="text-xs text-gray-500 mt-1">Rank: {user?.rank || 'Bronze'}</div>
          </div>
        </div>

        {/* Daily Rewards Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 backdrop-blur-sm rounded-lg p-6 border-2 border-yellow-500/50 shadow-lg hover:shadow-yellow-500/30 transition-all">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="text-6xl animate-bounce">🎁</div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Daily Rewards Available!</h3>
                  <p className="text-yellow-300">Claim your free rewards and share for bonus!</p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all"
              >
                🎁 Claim Now
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className={`bg-gradient-to-r ${action.color} hover:opacity-90 rounded-lg p-6 border border-white/10 shadow-lg transform hover:scale-105 transition-all`}
              >
                <div className="text-5xl mb-3">{action.icon}</div>
                <h3 className="text-xl font-bold text-white mb-1">{action.name}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Active Deck */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Active Deck</h2>
          {activeDeck && activeDeck.cards && activeDeck.cards.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-purple-400">{activeDeck.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {activeDeck.cards.length} cards | Power: {activeDeck.totalPower || 0}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/deck-builder')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                >
                  Edit Deck
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎴</div>
              <p className="text-gray-400 mb-4">No active deck selected</p>
              <button
                onClick={() => navigate('/deck-builder')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
              >
                Create Your First Deck
              </button>
            </div>
          )}
        </div>

        {/* Collection Stats */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Your Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-3xl font-bold text-white">{userCards.length || 0}</div>
              <div className="text-sm text-gray-400">Total Cards</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-3xl font-bold text-gray-400">
                {userCards.filter(c => c.rarity === 'Common').length || 0}
              </div>
              <div className="text-sm text-gray-400">Common</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">
                {userCards.filter(c => c.rarity === 'Rare').length || 0}
              </div>
              <div className="text-sm text-gray-400">Rare</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-3xl font-bold text-purple-400">
                {userCards.filter(c => c.rarity === 'Epic').length || 0}
              </div>
              <div className="text-sm text-gray-400">Epic</div>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-400">
                {userCards.filter(c => c.rarity === 'Legendary').length || 0}
              </div>
              <div className="text-sm text-gray-400">Legendary</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;