import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import BattleScreen from './screens/BattleScreen';
import DeckBuilderScreen from './screens/DeckBuilderScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import ClanScreen from './screens/ClanScreen';
import TournamentScreen from './screens/TournamentScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import DesignContest from './components/DesignContest';
import NFTMarketplace from './screens/NFTMarketplaceScreen';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useGame();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useGame();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          } 
        />
        
        {/* Protected Game Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout><DashboardScreen /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/battle" 
          element={
            <ProtectedRoute>
              <Layout><BattleScreen /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/deck-builder" 
          element={
            <ProtectedRoute>
              <Layout><DeckBuilderScreen /></Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* NFT Marketplace - NEW */}
        <Route 
          path="/marketplace" 
          element={
            <ProtectedRoute>
              <Layout><NFTMarketplace /></Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Old Marketplace (Optional - keep for card packs) */}
        <Route 
          path="/card-packs" 
          element={
            <ProtectedRoute>
              <Layout><MarketplaceScreen /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/design-contest" 
          element={
            <ProtectedRoute>
              <Layout><DesignContest /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clan" 
          element={
            <ProtectedRoute>
              <Layout><ClanScreen /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tournament" 
          element={
            <ProtectedRoute>
              <Layout><TournamentScreen /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute>
              <Layout><LeaderboardScreen /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <GameProvider>
        <AppRoutes />
      </GameProvider>
    </LanguageProvider>
  );
}

export default App;
