import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useGame();

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!username || username.trim().length < 3) {
      alert('Username must be at least 3 characters!');
      return;
    }
    
    if (!password || password.trim().length < 3) {
      alert('Password must be at least 3 characters!');
      return;
    }

    console.log('Attempting login...', username);

    // Perform login
    const result = login(username.trim(), password.trim());
    
    console.log('Login result:', result);
    
    if (result) {
      console.log('Login successful, navigating to dashboard...');
      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Game Title */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">⚔️</div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">
            Mythic Warriors
          </h1>
          <p className="text-gray-300 text-lg">Enter the Battle Arena</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-8 border-2 border-purple-500/50 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome, Warrior!</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="username" className="text-white font-semibold mb-2 block">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full bg-slate-900/70 border-2 border-purple-500/30 focus:border-purple-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-white font-semibold mb-2 block">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full bg-slate-900/70 border-2 border-purple-500/30 focus:border-purple-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-lg shadow-lg transform hover:scale-105 active:scale-95 transition-all"
            >
              <span className="mr-2">⚔️</span>
              Enter Arena
              <span className="ml-2">⚔️</span>
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-900/30 border-2 border-blue-500/40 rounded-lg">
            <p className="text-blue-300 text-sm text-center font-semibold">
              🎮 Demo Mode Active
            </p>
            <p className="text-blue-400 text-xs text-center mt-2">
              Use any username & password (min 3 characters each)
            </p>
            <div className="mt-3 text-center">
              <code className="bg-slate-900/70 px-3 py-1.5 rounded text-green-400 text-sm">
                Try: demo / 123456
              </code>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30 text-center hover:border-purple-500/60 transition-all">
            <div className="text-4xl mb-2">🎴</div>
            <div className="text-white text-sm font-semibold">Collect</div>
            <div className="text-white text-sm font-semibold">Cards</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30 text-center hover:border-purple-500/60 transition-all">
            <div className="text-4xl mb-2">⚔️</div>
            <div className="text-white text-sm font-semibold">Epic</div>
            <div className="text-white text-sm font-semibold">Battles</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30 text-center hover:border-purple-500/60 transition-all">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-white text-sm font-semibold">Win</div>
            <div className="text-white text-sm font-semibold">Glory</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;