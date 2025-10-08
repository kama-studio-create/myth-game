import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const LeaderboardScreen = () => {
  const { user } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('rank');

  const leaderboardData = {
    rank: [
      { rank: 1, username: 'ImmortalKing', level: 99, rating: 3500, wins: 1250, losses: 150, clan: 'Shadow Dragons', avatar: '👑' },
      { rank: 2, username: 'PhoenixRider', level: 95, rating: 3450, wins: 1180, losses: 180, clan: 'Phoenix Legion', avatar: '🔥' },
      { rank: 3, username: 'DragonSlayer99', level: 92, rating: 3380, wins: 1100, losses: 200, clan: 'Dragon Hunters', avatar: '⚔️' },
      { rank: 4, username: 'MysticWarrior', level: 90, rating: 3320, wins: 1050, losses: 220, clan: 'Mystic Order', avatar: '🔮' },
      { rank: 5, username: 'ThunderGod', level: 88, rating: 3250, wins: 980, losses: 240, clan: 'Storm Bringers', avatar: '⚡' },
      { rank: 6, username: 'ShadowNinja', level: 85, rating: 3180, wins: 920, losses: 260, clan: 'Shadow Dragons', avatar: '🥷' },
      { rank: 7, username: 'IceQueen', level: 83, rating: 3120, wins: 880, losses: 280, clan: 'Frozen Kingdom', avatar: '❄️' },
      { rank: 8, username: 'DarkKnight', level: 82, rating: 3080, wins: 850, losses: 290, clan: 'Dark Knights', avatar: '🛡️' },
      { rank: 9, username: 'CrimsonBlade', level: 80, rating: 3020, wins: 820, losses: 310, clan: 'Blood Ravens', avatar: '🗡️' },
      { rank: 10, username: 'StormBreaker', level: 78, rating: 2980, wins: 780, losses: 330, clan: 'Storm Bringers', avatar: '🌩️' },
      { rank: 11, username: user.username, level: user.level, rating: 2750, wins: 650, losses: 280, clan: 'Phoenix Legion', avatar: '🎮' },
    ],
    wins: [
      { rank: 1, username: 'ImmortalKing', totalWins: 1250, winRate: '89.3%', streak: 15, avatar: '👑' },
      { rank: 2, username: 'PhoenixRider', totalWins: 1180, winRate: '86.8%', streak: 8, avatar: '🔥' },
      { rank: 3, username: 'DragonSlayer99', totalWins: 1100, winRate: '84.6%', streak: 12, avatar: '⚔️' },
      { rank: 4, username: 'MysticWarrior', totalWins: 1050, winRate: '82.7%', streak: 6, avatar: '🔮' },
      { rank: 5, username: 'ThunderGod', totalWins: 980, winRate: '80.3%', streak: 10, avatar: '⚡' },
    ],
    gold: [
      { rank: 1, username: 'GoldKing', totalGold: 250000, earned: '+15k this week', level: 88, avatar: '💰' },
      { rank: 2, username: 'TreasureHunter', totalGold: 230000, earned: '+12k this week', level: 85, avatar: '🏆' },
      { rank: 3, username: 'ImmortalKing', totalGold: 210000, earned: '+18k this week', level: 99, avatar: '👑' },
      { rank: 4, username: 'RichWarrior', totalGold: 195000, earned: '+9k this week', level: 82, avatar: '💎' },
      { rank: 5, username: 'GoldDigger', totalGold: 180000, earned: '+11k this week', level: 80, avatar: '⛏️' },
    ],
    clan: [
      { rank: 1, clanName: 'Shadow Dragons', members: 50, totalPower: 45000, avgLevel: 75, leader: 'ImmortalKing', badge: '🐉' },
      { rank: 2, clanName: 'Phoenix Legion', members: 48, totalPower: 43500, avgLevel: 73, leader: 'PhoenixRider', badge: '🔥' },
      { rank: 3, clanName: 'Dragon Hunters', members: 45, totalPower: 41000, avgLevel: 71, leader: 'DragonSlayer99', badge: '⚔️' },
      { rank: 4, clanName: 'Storm Bringers', members: 42, totalPower: 38500, avgLevel: 69, leader: 'ThunderGod', badge: '⚡' },
      { rank: 5, clanName: 'Mystic Order', members: 40, totalPower: 36000, avgLevel: 67, leader: 'MysticWarrior', badge: '🔮' },
    ]
  };

  const categories = [
    { id: 'rank', name: 'Top Players', icon: '🏆' },
    { id: 'wins', name: 'Most Wins', icon: '⚔️' },
    { id: 'gold', name: 'Richest', icon: '💰' },
    { id: 'clan', name: 'Top Clans', icon: '🛡️' }
  ];

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const renderLeaderboardContent = () => {
    switch (selectedCategory) {
      case 'rank':
        return (
          <div className="space-y-2">
            {leaderboardData.rank.map((player) => (
              <div
                key={player.rank}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border transition-all hover:scale-[1.02] ${
                  player.username === user.username
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-purple-500/30 hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl font-bold ${getRankColor(player.rank)} min-w-[60px]`}>
                      {getRankBadge(player.rank)}
                    </div>
                    <div className="text-4xl">{player.avatar}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-white">{player.username}</span>
                        {player.username === user.username && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded font-semibold">YOU</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">Level {player.level} • {player.clan}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xl font-bold text-yellow-400">{player.rating}</div>
                    <div className="text-sm text-gray-400">
                      {player.wins}W - {player.losses}L
                    </div>
                    <div className="text-xs text-green-400">
                      {((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}% WR
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'wins':
        return (
          <div className="space-y-2">
            {leaderboardData.wins.map((player) => (
              <div
                key={player.rank}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl font-bold ${getRankColor(player.rank)} min-w-[60px]`}>
                      {getRankBadge(player.rank)}
                    </div>
                    <div className="text-4xl">{player.avatar}</div>
                    <div>
                      <div className="text-lg font-bold text-white">{player.username}</div>
                      <div className="text-sm text-gray-400">Win Rate: {player.winRate}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xl font-bold text-green-400">{player.totalWins} Wins</div>
                    <div className="text-sm text-orange-400">🔥 {player.streak} Win Streak</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'gold':
        return (
          <div className="space-y-2">
            {leaderboardData.gold.map((player) => (
              <div
                key={player.rank}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl font-bold ${getRankColor(player.rank)} min-w-[60px]`}>
                      {getRankBadge(player.rank)}
                    </div>
                    <div className="text-4xl">{player.avatar}</div>
                    <div>
                      <div className="text-lg font-bold text-white">{player.username}</div>
                      <div className="text-sm text-gray-400">Level {player.level}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xl font-bold text-yellow-400">{player.totalGold.toLocaleString()} 💰</div>
                    <div className="text-sm text-green-400">{player.earned}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'clan':
        return (
          <div className="space-y-2">
            {leaderboardData.clan.map((clan) => (
              <div
                key={clan.rank}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl font-bold ${getRankColor(clan.rank)} min-w-[60px]`}>
                      {getRankBadge(clan.rank)}
                    </div>
                    <div className="text-4xl">{clan.badge}</div>
                    <div>
                      <div className="text-lg font-bold text-white">{clan.clanName}</div>
                      <div className="text-sm text-gray-400">Leader: {clan.leader}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xl font-bold text-purple-400">{clan.totalPower.toLocaleString()} Power</div>
                    <div className="text-sm text-gray-400">{clan.members} Members • Avg Lvl {clan.avgLevel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            Global Leaderboard
          </h1>
          <p className="text-gray-300">See where you rank among the greatest warriors!</p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Leaderboard Content */}
        {renderLeaderboardContent()}

        {/* Your Ranking Card */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-lg p-6 border-2 border-purple-500">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">🎮</span>
            Your Current Ranking
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Global Rank</div>
              <div className="text-2xl font-bold text-purple-400">#11</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Rating</div>
              <div className="text-2xl font-bold text-yellow-400">2,750</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-green-400">69.9%</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">To Top 10</div>
              <div className="text-2xl font-bold text-orange-400">230 pts</div>
            </div>
          </div>
        </div>

        {/* Season Info */}
        <div className="mt-6 bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-400">Current Season</div>
              <div className="text-lg font-bold text-white">Season 5: Rise of Legends</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Season Ends In</div>
              <div className="text-lg font-bold text-red-400">12 days 5 hours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;