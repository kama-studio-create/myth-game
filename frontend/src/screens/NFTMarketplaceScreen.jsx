import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';

const NFTMarketplace = () => {
  const { user, userCards, tokenBalance, mintNFTCard, tradeNFTCard, upgradeCard } = useGame();
  const [selectedTab, setSelectedTab] = useState('market');
  const [selectedCard, setSelectedCard] = useState(null);
  const [mintingCard, setMintingCard] = useState(false);

  // Market listings (simulated)
  const marketListings = [
    { id: 1, seller: 'DragonMaster', price: 500, card: { name: 'Fire Drake', type: 'Warrior', rarity: 'Epic', level: 6, attack: 95, defense: 60, health: 140 } },
    { id: 2, seller: 'MageKing', price: 800, card: { name: 'Frost Wizard', type: 'Mage', rarity: 'Legendary', level: 7, attack: 100, defense: 70, health: 150 } },
    { id: 3, seller: 'ShadowNinja', price: 350, card: { name: 'Silent Blade', type: 'Assassin', rarity: 'Rare', level: 4, attack: 80, defense: 45, health: 110 } },
    { id: 4, seller: 'TankCommander', price: 600, card: { name: 'Iron Colossus', type: 'Tank', rarity: 'Epic', level: 5, attack: 70, defense: 100, health: 180 } },
  ];

  const handleMintCard = () => {
    setMintingCard(true);
    setTimeout(() => {
      const newCard = {
        name: `Mythic ${['Warrior', 'Mage', 'Assassin'][Math.floor(Math.random() * 3)]}`,
        type: ['Warrior', 'Mage', 'Assassin', 'Tank', 'Support'][Math.floor(Math.random() * 5)],
        rarity: ['Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 3)],
        level: Math.floor(Math.random() * 3) + 3,
        attack: 60 + Math.floor(Math.random() * 40),
        defense: 50 + Math.floor(Math.random() * 40),
        health: 120 + Math.floor(Math.random() * 60),
        ability: 'Special Attack',
      };
      
      mintNFTCard(newCard);
      setMintingCard(false);
      alert('🎉 NFT Card Minted Successfully!');
    }, 2000);
  };

  const handleBuyCard = (listing) => {
    if (tokenBalance < listing.price) {
      alert('❌ Insufficient tokens!');
      return;
    }
    
    const result = tradeNFTCard(listing.id, user?.username, listing.price);
    if (result.success) {
      alert(`✅ Purchased ${listing.card.name} for ${listing.price} tokens!`);
    }
  };

  const handleUpgradeCard = (card) => {
    const upgradeCost = 100 * (card.level || 1);
    const result = upgradeCard(card.id, upgradeCost);
    
    if (result.success) {
      alert(`⬆️ ${card.name} upgraded to Level ${(card.level || 1) + 1}!`);
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            🏪 NFT Marketplace
          </h1>
          <p className="text-gray-300">Buy, Sell & Trade Warrior NFTs</p>
        </div>

        {/* Token Balance */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 mb-8 border-2 border-yellow-500/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-300 mb-1">Your Token Balance</div>
              <div className="text-4xl font-bold text-yellow-400">💎 {tokenBalance}</div>
            </div>
            <button
              onClick={handleMintCard}
              disabled={mintingCard || tokenBalance < 200}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {mintingCard ? '⏳ Minting...' : '🎨 Mint New NFT (200 💎)'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setSelectedTab('market')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              selectedTab === 'market'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏪 Market
          </button>
          <button
            onClick={() => setSelectedTab('my-nfts')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              selectedTab === 'my-nfts'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎴 My NFTs ({userCards?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab('upgrade')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              selectedTab === 'upgrade'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⬆️ Upgrade
          </button>
        </div>

        {/* Market Tab */}
        {selectedTab === 'market' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">🔥 Featured Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {marketListings.map((listing) => (
                <div key={listing.id} className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30">
                  <div className="mb-3">
                    <div className="text-6xl text-center mb-2">
                      {listing.card.type === 'Warrior' ? '⚔️' : 
                       listing.card.type === 'Mage' ? '🔮' : 
                       listing.card.type === 'Assassin' ? '🗡️' : 
                       listing.card.type === 'Tank' ? '🛡️' : '💚'}
                    </div>
                    <h3 className="text-white font-bold text-lg text-center">{listing.card.name}</h3>
                    <p className="text-gray-400 text-sm text-center">{listing.card.rarity} • Lv.{listing.card.level}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-900/50 rounded p-2 text-center">
                      <div className="text-red-400 font-bold text-sm">{listing.card.attack}</div>
                      <div className="text-gray-500 text-xs">ATK</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 text-center">
                      <div className="text-blue-400 font-bold text-sm">{listing.card.defense}</div>
                      <div className="text-gray-500 text-xs">DEF</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 text-center">
                      <div className="text-green-400 font-bold text-sm">{listing.card.health}</div>
                      <div className="text-gray-500 text-xs">HP</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-2 mb-3">
                    <div className="text-gray-400 text-xs">Seller</div>
                    <div className="text-white font-semibold text-sm">{listing.seller}</div>
                  </div>

                  <div className="bg-yellow-500/20 rounded-lg p-3 mb-3 text-center">
                    <div className="text-yellow-400 font-bold text-xl">💎 {listing.price}</div>
                  </div>

                  <button
                    onClick={() => handleBuyCard(listing)}
                    disabled={tokenBalance < listing.price}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-all"
                  >
                    {tokenBalance >= listing.price ? 'Buy Now' : 'Insufficient Tokens'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My NFTs Tab */}
        {selectedTab === 'my-nfts' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">🎴 Your NFT Collection</h2>
            {userCards && userCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userCards.map((card) => (
                  <Card key={card.id} card={card} compact showNFTBadge={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-400 text-lg">No NFT cards yet</p>
                <p className="text-gray-500 text-sm mt-2">Start battling to earn rewards and mint cards!</p>
              </div>
            )}
          </div>
        )}

        {/* Upgrade Tab */}
        {selectedTab === 'upgrade' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">⬆️ Upgrade Your Cards</h2>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="text-3xl">💡</div>
                <div>
                  <h3 className="text-yellow-400 font-bold mb-1">How Upgrades Work</h3>
                  <p className="text-gray-300 text-sm">
                    Spend tokens to upgrade your cards and increase their stats. Higher level cards cost more to upgrade.
                  </p>
                  <p className="text-yellow-400 text-sm mt-2">
                    Upgrade Cost = 100 × Card Level
                  </p>
                </div>
              </div>
            </div>

            {userCards && userCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCards.map((card) => {
                  const upgradeCost = 100 * (card.level || 1);
                  return (
                    <div key={card.id} className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30">
                      <div className="mb-3">
                        <div className="text-6xl text-center mb-2">
                          {card.type === 'Warrior' ? '⚔️' : 
                           card.type === 'Mage' ? '🔮' : 
                           card.type === 'Assassin' ? '🗡️' : 
                           card.type === 'Tank' ? '🛡️' : '💚'}
                        </div>
                        <h3 className="text-white font-bold text-lg text-center">{card.name}</h3>
                        <p className="text-gray-400 text-sm text-center">{card.rarity} • Lv.{card.level || 1}</p>
                        <div className="text-center mt-2">
                          <span className="bg-purple-600/30 px-3 py-1 rounded-full text-purple-400 text-xs font-bold">
                            NFT {card.nftId}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-slate-900/50 rounded p-2 text-center">
                          <div className="text-red-400 font-bold">{card.attack || 0}</div>
                          <div className="text-gray-500 text-xs">ATK</div>
                          <div className="text-green-400 text-xs">+5</div>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2 text-center">
                          <div className="text-blue-400 font-bold">{card.defense || 0}</div>
                          <div className="text-gray-500 text-xs">DEF</div>
                          <div className="text-green-400 text-xs">+5</div>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2 text-center">
                          <div className="text-green-400 font-bold">{card.health || 0}</div>
                          <div className="text-gray-500 text-xs">HP</div>
                          <div className="text-green-400 text-xs">+10</div>
                        </div>
                      </div>

                      <div className="bg-yellow-500/20 rounded-lg p-3 mb-3 text-center">
                        <div className="text-gray-400 text-xs mb-1">Upgrade Cost</div>
                        <div className="text-yellow-400 font-bold text-xl">💎 {upgradeCost}</div>
                      </div>

                      <button
                        onClick={() => handleUpgradeCard(card)}
                        disabled={tokenBalance < upgradeCost}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-all"
                      >
                        {tokenBalance >= upgradeCost ? `⬆️ Upgrade to Lv.${(card.level || 1) + 1}` : 'Insufficient Tokens'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-400 text-lg">No cards to upgrade</p>
              </div>
            )}
          </div>
        )}

        {/* NFT Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">🎮 Play to Earn</h3>
              <p className="text-gray-300 mb-1">Win battles to earn tokens and mint exclusive NFT cards</p>
              <p className="text-purple-400 text-sm">• Trade on the marketplace • Upgrade your collection • Dominate the arena</p>
            </div>
            <div className="text-6xl">🏆</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketplace;