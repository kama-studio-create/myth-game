import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { user, logout } = useGame();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: '🏠' },
    { name: t('battle'), path: '/battle', icon: '⚔️' },
    { name: t('deckBuilder'), path: '/deck-builder', icon: '🎴' },
    { name: t('marketplace'), path: '/marketplace', icon: '🏪' },
    { name: t('clan'), path: '/clan', icon: '🛡️' },
    { name: t('tournament'), path: '/tournament', icon: '🏆' },
    { name: t('leaderboard'), path: '/leaderboard', icon: '📊' },
    { name: t('designContest'), path: '/design-contest', icon: '🎨' },
  ];

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

          {/* User Info & Language Selector */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                <span className="text-xl">{currentLanguage?.flag}</span>
                <span className="hidden md:inline text-white text-sm font-semibold">
                  {currentLanguage?.code.toUpperCase()}
                </span>
                <span className="text-white">▼</span>
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-purple-500/30 overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 transition-all ${
                        language === lang.code ? 'bg-purple-600/30' : ''
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-white font-semibold">{lang.name}</span>
                      {language === lang.code && (
                        <span className="ml-auto text-green-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="hidden md:block text-right">
              <div className="text-white font-semibold">{user?.username || 'Player'}</div>
              <div className="text-sm text-yellow-400">💰 {(user?.gold || 0).toLocaleString()}</div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
            >
              {t('logout')}
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

      {/* Click outside to close language menu */}
      {showLanguageMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;