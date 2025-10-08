import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Navbar from './components/Navbar';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import BattleScreen from './screens/BattleScreen';
import DeckBuilderScreen from './screens/DeckBuilderScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import ClanScreen from './screens/ClanScreen';
import TournamentScreen from './screens/TournamentScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

const AppContent = () => {
  const { user } = useGame();
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  // Show login screen if no user
  if (!user) {
    return <LoginScreen />;
  }

  // Render the appropriate screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen setCurrentScreen={setCurrentScreen} />;
      case 'battle':
        return <BattleScreen />;
      case 'deck':
        return <DeckBuilderScreen />;
      case 'marketplace':
        return <MarketplaceScreen />;
      case 'clan':
        return <ClanScreen />;
      case 'tournament':
        return <TournamentScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      default:
        return <DashboardScreen setCurrentScreen={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      <div className="min-h-screen">
        {renderScreen()}
      </div>
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;