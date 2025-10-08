import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';
import { generateRandomCard } from '../utils/helpers';

const MarketplaceScreen = () => {
  const { cards, gold, gems, buyCard, sellCard, addNotification } = useGame();
  const [selectedTab, setSelectedTab] = useState('buy'); // buy, sell, packs
  const [availableCards] = useState(() => Array.from({ length: 6 }, () => generateRandomCard()));

  const cardPacks = [
    {
      id: 1,
      name: 'Starter Pack',
      cost: 500,
      currency: 'gold',
      cards: 3,
      rarity: 'Common-Rare',
      icon: '📦'
    },
    {
      id: 2,
      name: 'Premium Pack',
      cost: 1500,
      currency: 'gold',
      cards: 5,
      rarity: 'Rare-Epic',
      icon: '🎁'
    },
    {
      id: 3,
      name: 'Elite Pack',
      cost: 50,
      currency: 'gems',
      cards: 5,
      rarity: 'Epic-Legendary',
      icon: '💎'
    },
    {
      id: 4,
      name: 'Mythic Pack',
      cost: 150,
      currency: 'gems',
      cards: 10,
      rarity: 'Legendary-Mythic',
      icon: '👑'
    }
  ];

  const handleBuyCard = (cost) => {
    if (buyCard(cost)) {
      addNotification('Card purchased successfully!', 'success');
    }
  };

  const handleBuyPack = (pack) => {
    if (pack.currency === 'gold') {
      if (gold >= pack.cost) {
        handleBuyCard(pack.cost);
        addNotification(`Opened ${pack.name}!`, 'success');
      } else {
        addNotification('Not enough gold!', 'error');
      }
    } else {
      if (gems >= pack.cost) {
        // In a real app, deduct gems here
        addNotification(`Opened ${pack.name}!`, 'success');
      } else {
        addNotification('Not enough gems!', 'error');
      }
    }
  };

  const calculateSellPrice = (card) => {
    const baseValue = 100;
    const rarityMultipliers = { COMMON: 1, RARE: 2, EPIC: 4, LEGENDARY: 8, MYTHIC: 16 };
    return Math.floor((baseValue * (rarityMultipliers[card.rarity] || 1) * card.level) * 0.5);
  };

  return (
    <Layout
      title="Marketplace"
      subtitle="Buy and sell cards to strengthen your collection"
    >
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setSelectedTab('buy')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            selectedTab === 'buy'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart size={20} />
          <span>Buy Cards</span>
        </button>
        <button
          onClick={() => setSelectedTab('sell')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            selectedTab === 'sell'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign size={20} />
          <span>Sell Cards</span>
        </button>
        <button
          onClick={() => setSelectedTab('packs')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            selectedTab === 'packs'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Package size={20} />
          <span>Card Packs</span>
        </button>
      </div>

      {/* Buy Tab */}
      {selectedTab === 'buy' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Available Cards</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
                <span className="text-xl">💰</span>
                <span className="font-bold text-yellow-400">{gold}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCards.map((card, index) => {
              const price = Math.floor(Math.random() * 500) + 200;
              return (
                <div key={index} className="relative">
                  <Card card={card} showStats={true} />
                  <div className="mt-4 bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-xl font-bold text-yellow-400">💰 {price}</span>
                    </div>
                    <button
                      onClick={() => handleBuyCard(price)}
                      disabled={gold < price}
                      className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 ${
                        gold >= price
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {gold >= price ? 'Buy Now' : 'Not Enough Gold'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sell Tab */}
      {selectedTab === 'sell' && (
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Your Collection</h3>
            <p className="text-gray-400">Sell cards you don't need for 50% of their value</p>
          </div>

          {cards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                const sellPrice = calculateSellPrice(card);
                return (
                  <div key={card.id} className="relative">
                    <Card card={card} showStats={true} />
                    <div className="mt-4 bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400">Sell for:</span>
                        <span className="text-xl font-bold text-green-400">💰 {sellPrice}</span>
                      </div>
                      <button
                        onClick={() => sellCard(card.id)}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-2 rounded-lg font-semibold transition-all duration-300"
                      >
                        Sell Card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No cards to sell</p>
              <p className="text-gray-500 text-sm mt-2">Buy some cards first!</p>
            </div>
          )}
        </div>
      )}

      {/* Packs Tab */}
      {selectedTab === 'packs' && (
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Card Packs</h3>
            <p className="text-gray-400">Get multiple cards at once with special pack deals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardPacks.map((pack) => (
              <div
                key={pack.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-purple-500/30 card-hover"
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{pack.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{pack.name}</h4>
                  <p className="text-sm text-gray-400 mb-4">{pack.cards} Cards</p>
                  <div className="inline-block bg-purple-600/30 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                    {pack.rarity}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-400">Price:</span>
                    <span className="font-bold text-xl">
                      {pack.currency === 'gold' ? '💰' : '💎'} {pack.cost}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuyPack(pack)}
                    disabled={
                      (pack.currency === 'gold' && gold < pack.cost) ||
                      (pack.currency === 'gems' && gems < pack.cost)
                    }
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      (pack.currency === 'gold' && gold >= pack.cost) ||
                      (pack.currency === 'gems' && gems >= pack.cost)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Buy Pack
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Special Offers */}
          <div className="mt-8 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 border border-yellow-500">
            <div className="flex items-center space-x-4">
              <TrendingUp size={48} className="text-white" />
              <div className="flex-1">
                <h4 className="text-2xl font-bold mb-1">Daily Deal!</h4>
                <p className="text-yellow-100">Premium Pack - 30% OFF for the next 24 hours</p>
              </div>
              <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-yellow-50 transition-colors">
                Claim Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MarketplaceScreen;