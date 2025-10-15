import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const Navbar = () => {
  const { user, logout } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Battle', path: '/battle', icon: '⚔️' },
    { name: 'Deck Builder', path: '/deck-builder', icon: '🎴' },
    { name: 'Marketplace', path: '/marketplace', icon: '🏪' },
    { name: 'Clan', path: '/clan', icon: '🛡️' },
    { name: 'Tournament', path: '/tournament', icon: '🏆' },
    { name: 'Leaderboard', path: '/leaderboard', icon: '📊' },
    { name: 'Design Contest', path: '/design-contest', icon: '🎨' },
  ];

  // Safety check - don't render if user is not loaded yet
  if (!user) {
    return null;
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-3xl">⚔️</span>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Mythic Warriors
            </span>
          </Link>

          {/* Nav Links - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  location.pathname === item.path
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <div className="text-white font-semibold">{user?.username || 'Player'}</div>
              <div className="text-sm text-yellow-400">💰 {(user?.gold || 0).toLocaleString()}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-3 overflow-x-auto">
          <div className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  location.pathname === item.path
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;