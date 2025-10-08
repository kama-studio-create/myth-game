import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Layout from '../components/Layout';
import { Users, Crown, Shield, TrendingUp, LogOut, LogIn } from 'lucide-react';

const ClanScreen = () => {
  const { clan, joinClan, leaveClan, user } = useGame();
  const [searchTerm, setSearchTerm] = useState('');

  const availableClans = [
    {
      id: 1,
      name: 'Dragon Knights',
      icon: '🐉',
      members: 45,
      level: 12,
      description: 'Elite warriors seeking glory',
      color: 'from-red-600 to-orange-600'
    },
    {
      id: 2,
      name: 'Shadow Assassins',
      icon: '🗡️',
      members: 38,
      level: 10,
      description: 'Strike from the shadows',
      color: 'from-gray-700 to-gray-900'
    },
    {
      id: 3,
      name: 'Mystic Mages',
      icon: '🔮',
      members: 52,
      level: 15,
      description: 'Masters of arcane arts',
      color: 'from-purple-600 to-blue-600'
    },
    {
      id: 4,
      name: 'Iron Legion',
      icon: '🛡️',
      members: 67,
      level: 18,
      description: 'Unbreakable defense',
      color: 'from-slate-600 to-slate-800'
    },
    {
      id: 5,
      name: 'Phoenix Rising',
      icon: '🔥',
      members: 41,
      level: 14,
      description: 'Rise from the ashes',
      color: 'from-orange-600 to-red-600'
    },
    {
      id: 6,
      name: 'Storm Bringers',
      icon: '⚡',
      members: 33,
      level: 11,
      description: 'Unleash the tempest',
      color: 'from-blue-600 to-cyan-600'
    }
  ];

  const filteredClans = availableClans.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      title="Clans"
      subtitle="Join forces with other warriors and conquer together"
    >
      {clan ? (
        /* Current Clan View */
        <div>
          {/* Clan Header */}
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-8 mb-8 border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-6xl">🛡️</div>
                <div>
                  <h2 className="text-3xl font-bold">{clan.name}</h2>
                  <p className="text-gray-300">Member since {new Date(clan.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={leaveClan}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span>Leave Clan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <Users className="mx-auto mb-2 text-purple-400" size={32} />
                <p className="text-2xl font-bold">45</p>
                <p className="text-sm text-gray-400">Members</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <Crown className="mx-auto mb-2 text-yellow-400" size={32} />
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-400">Clan Level</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <Shield className="mx-auto mb-2 text-blue-400" size={32} />
                <p className="text-2xl font-bold">1,245</p>
                <p className="text-sm text-gray-400">Trophies</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <TrendingUp className="mx-auto mb-2 text-green-400" size={32} />
                <p className="text-2xl font-bold">#15</p>
                <p className="text-sm text-gray-400">Ranking</p>
              </div>
            </div>
          </div>

          {/* Clan Members */}
          <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Clan Members</h3>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-xl">
                      {index === 0 ? '👑' : '⚔️'}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {index === 0 ? user?.username : `Player${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {index === 0 ? 'Leader' : index < 3 ? 'Elder' : 'Member'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-400">{Math.floor(Math.random() * 500) + 100}</p>
                    <p className="text-xs text-gray-400">Trophies</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clan Chat */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Clan Chat</h3>
            <div className="space-y-3 mb-4 h-64 overflow-y-auto">
              {[
                { user: 'Leader', message: 'Welcome to the clan!', time: '10:30 AM' },
                { user: user?.username, message: 'Thanks for having me!', time: '10:32 AM' },
                { user: 'Player2', message: 'Anyone up for a battle?', time: '10:35 AM' },
                { user: 'Player3', message: 'Let\'s win this tournament!', time: '10:40 AM' }
              ].map((msg, index) => (
                <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-purple-400">{msg.user}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              />
              <button className="btn-primary">Send</button>
            </div>
          </div>
        </div>
      ) : (
        /* Clan Browser */
        <div>
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search clans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Available Clans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClans.map((clanItem) => (
              <div
                key={clanItem.id}
                className={`bg-gradient-to-br ${clanItem.color} rounded-xl p-6 border border-white/10 card-hover`}
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{clanItem.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{clanItem.name}</h3>
                  <p className="text-sm text-gray-200 mb-4">{clanItem.description}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                    <span className="text-sm text-gray-200">Members:</span>
                    <span className="font-bold">{clanItem.members}/50</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                    <span className="text-sm text-gray-200">Clan Level:</span>
                    <span className="font-bold">{clanItem.level}</span>
                  </div>
                </div>

                <button
                  onClick={() => joinClan(clanItem.name)}
                  className="w-full bg-white text-slate-900 hover:bg-gray-100 py-3 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2"
                >
                  <LogIn size={20} />
                  <span>Join Clan</span>
                </button>
              </div>
            ))}
          </div>

          {filteredClans.length === 0 && (
            <div className="text-center py-20">
              <Users size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No clans found</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default ClanScreen;