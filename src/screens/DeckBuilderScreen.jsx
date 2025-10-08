import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';

const DeckBuilderScreen = () => {
  const { user, userCards = [], userDecks = [], activeDeck, addDeck, updateDeck, deleteDeck, setActiveDeck } = useGame();
  const [selectedDeck, setSelectedDeck] = useState(activeDeck);
  const [deckName, setDeckName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterRarity, setFilterRarity] = useState('All');

  const handleCreateDeck = () => {
    if (deckName.trim().length < 3) {
      alert('Deck name must be at least 3 characters!');
      return;
    }

    if (userDecks.length >= 3) {
      alert('Maximum 3 decks allowed!');
      return;
    }

    const newDeck = {
      id: Date.now(),
      name: deckName,
      cards: [],
      isActive: false,
      wins: 0,
      losses: 0,
      totalPower: 0,
    };

    addDeck(newDeck);
    setDeckName('');
    setShowCreateModal(false);
    setSelectedDeck(newDeck);
  };

  const handleAddCardToDeck = (card) => {
    if (!selectedDeck) {
      alert('Please select a deck first!');
      return;
    }

    if (!selectedDeck.cards) {
      selectedDeck.cards = [];
    }

    if (selectedDeck.cards.length >= 10) {
      alert('Deck is full! Maximum 10 cards allowed.');
      return;
    }

    if (selectedDeck.cards.find(c => c.id === card.id)) {
      alert('Card already in deck!');
      return;
    }

    const updatedCards = [...selectedDeck.cards, card];
    const updatedDeck = {
      ...selectedDeck,
      cards: updatedCards,
      totalPower: updatedCards.reduce((sum, c) => (sum + (c.attack || 0) + (c.defense || 0)), 0),
    };

    updateDeck(selectedDeck.id, updatedDeck);
    setSelectedDeck(updatedDeck);
  };

  const handleRemoveCardFromDeck = (cardId) => {
    if (!selectedDeck || !selectedDeck.cards) return;

    const updatedCards = selectedDeck.cards.filter(c => c.id !== cardId);
    const updatedDeck = {
      ...selectedDeck,
      cards: updatedCards,
      totalPower: updatedCards.reduce((sum, c) => (sum + (c.attack || 0) + (c.defense || 0)), 0),
    };

    updateDeck(selectedDeck.id, updatedDeck);
    setSelectedDeck(updatedDeck);
  };

  const handleSetActiveDeck = (deck) => {
    if (!deck.cards || deck.cards.length < 5) {
      alert('Deck must have at least 5 cards to be set as active!');
      return;
    }
    setActiveDeck(deck.id);
    setSelectedDeck(deck);
  };

  const handleDeleteDeck = (deckId) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      deleteDeck(deckId);
      if (selectedDeck && selectedDeck.id === deckId) {
        setSelectedDeck(userDecks.find(d => d.id !== deckId) || null);
      }
    }
  };

  const filteredCards = userCards.filter(card => {
    const typeMatch = filterType === 'All' || card.type === filterType;
    const rarityMatch = filterRarity === 'All' || card.rarity === filterRarity;
    return typeMatch && rarityMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            Deck Builder
          </h1>
          <p className="text-gray-300">Create and manage your battle decks!</p>
        </div>

        {/* Deck Tabs */}
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
          {userDecks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => setSelectedDeck(deck)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedDeck?.id === deck.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
              }`}
            >
              {deck.name} ({(deck.cards || []).length}/10)
              {deck.isActive && <span className="ml-2">✓</span>}
            </button>
          ))}
          {userDecks.length < 3 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
            >
              + New Deck
            </button>
          )}
        </div>

        {/* Selected Deck Display */}
        {selectedDeck && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedDeck.name}</h2>
                <div className="text-sm text-gray-400">
                  Cards: {(selectedDeck.cards || []).length}/10 | Power: {selectedDeck.totalPower || 0}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSetActiveDeck(selectedDeck)}
                  disabled={selectedDeck.isActive || (selectedDeck.cards || []).length < 5}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                >
                  {selectedDeck.isActive ? '✓ Active' : 'Set Active'}
                </button>
                <button
                  onClick={() => handleDeleteDeck(selectedDeck.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {(selectedDeck.cards || []).map((card) => (
                <div key={card.id} className="relative">
                  <Card card={card} compact />
                  <button
                    onClick={() => handleRemoveCardFromDeck(card.id)}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
              {(selectedDeck.cards || []).length === 0 && (
                <div className="col-span-5 text-center py-8 text-gray-400">
                  No cards in deck. Add cards from your collection below.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-white font-semibold mb-2 block">Filter by Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-purple-500/30"
              >
                <option>All</option>
                <option>Warrior</option>
                <option>Mage</option>
                <option>Assassin</option>
                <option>Tank</option>
                <option>Support</option>
              </select>
            </div>
            <div>
              <label className="text-white font-semibold mb-2 block">Filter by Rarity:</label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-purple-500/30"
              >
                <option>All</option>
                <option>Common</option>
                <option>Rare</option>
                <option>Epic</option>
                <option>Legendary</option>
                <option>Mythic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card Collection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Your Collection ({filteredCards.length} cards)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleAddCardToDeck(card)}
                disabled={!selectedDeck || (selectedDeck.cards || []).find(c => c.id === card.id)}
                className="disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
              >
                <Card card={card} compact />
              </button>
            ))}
          </div>
        </div>

        {/* Create Deck Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-purple-500/50">
              <h2 className="text-2xl font-bold text-white mb-4">Create New Deck</h2>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Enter deck name"
                className="w-full bg-slate-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
                maxLength={30}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateDeck}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setDeckName('');
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

export default DeckBuilderScreen;