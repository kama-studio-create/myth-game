import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const Card = ({ card, onClick, compact = false, selected = false, showNFTBadge = true }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  
  if (!card) {
    return null;
  }

  const rarityColors = {
    Common: 'from-gray-500 to-gray-600',
    Rare: 'from-blue-500 to-blue-600',
    Epic: 'from-purple-500 to-purple-600',
    Legendary: 'from-yellow-500 to-orange-600',
    Mythic: 'from-pink-500 to-red-600',
  };

  const rarityGlow = {
    Common: 'shadow-gray-500/50',
    Rare: 'shadow-blue-500/50',
    Epic: 'shadow-purple-500/50',
    Legendary: 'shadow-yellow-500/50',
    Mythic: 'shadow-pink-500/50',
  };

  const typeIcons = {
    Warrior: '⚔️',
    Mage: '🔮',
    Assassin: '🗡️',
    Tank: '🛡️',
    Support: '💚',
  };

  const gradientColor = rarityColors[card.rarity] || rarityColors.Common;
  const glowColor = rarityGlow[card.rarity] || rarityGlow.Common;
  const typeIcon = typeIcons[card.type] || '⚔️';

  // Calculate power and token value
  const calculatePower = () => {
    const attack = card.attack || 0;
    const defense = card.defense || 0;
    const health = card.health || 0;
    return Math.floor(attack + defense + (health / 2));
  };

  const calculateTokenValue = () => {
    const power = calculatePower();
    const rarityMultiplier = {
      Common: 1,
      Rare: 2,
      Epic: 4,
      Legendary: 8,
      Mythic: 16
    };
    return Math.floor(power * (rarityMultiplier[card.rarity] || 1) * (card.level || 1) * 0.5);
  };

  const power = calculatePower();
  const tokenValue = calculateTokenValue();
  const nftId = card.nftId || `$${String(card.id).slice(-6)}`;

  const shouldShowImage = card.image && !imageError && imageLoaded;
  const shouldTryImage = card.image && !imageError;

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  // Card Detail Modal - Responsive
  const CardDetailModal = () => (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={() => setShowModal(false)}
    >
      <div 
        className="bg-slate-900 rounded-xl w-full max-w-md sm:max-w-xl md:max-w-3xl border-2 border-purple-500 shadow-2xl flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradientColor} py-3 sm:py-4 px-3 sm:px-6 flex justify-between items-start sm:items-center gap-2`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1 flex-wrap gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{card.name}</h2>
              {showNFTBadge && (
                <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-bold border border-white/40 flex-shrink-0">
                  NFT {nftId}
                </span>
              )}
            </div>
            <div className="text-white/90 text-xs sm:text-sm flex items-center space-x-2 flex-wrap">
              <span>{typeIcon} {card.type}</span>
              <span>•</span>
              <span>{card.rarity}</span>
              <span>•</span>
              <span>Level {card.level || 1}</span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-white hover:text-gray-300 text-2xl sm:text-3xl font-bold leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Card Image Section */}
            <div className="flex flex-col items-center order-2 md:order-1">
              <div className="relative w-40 h-56 bg-gradient-to-br from-slate-700 via-purple-900 to-slate-800 rounded-lg flex items-center justify-center border-3 border-yellow-600 overflow-hidden p-2">
                {shouldTryImage ? (
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className={`w-full h-full object-contain rounded transition-opacity ${shouldShowImage ? 'opacity-100' : 'opacity-0 absolute'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      console.log('Image failed to load:', card.image);
                      setImageError(true);
                    }}
                    crossOrigin="anonymous"
                  />
                ) : null}
                {(!shouldTryImage || !shouldShowImage) && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-5xl mb-2">{typeIcon}</div>
                    <div className="text-xs text-gray-300 text-center">{card.name}</div>
                  </div>
                )}
              </div>
              
              {/* Token Value */}
              <div className="mt-3 sm:mt-4 w-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg px-3 sm:px-6 py-2 sm:py-3 border border-yellow-500/30">
                <div className="text-center">
                  <div className="text-yellow-400 text-xs sm:text-sm font-semibold mb-1">NFT Value</div>
                  <div className="text-yellow-400 font-bold text-lg sm:text-2xl">💎 {tokenValue} Tokens</div>
                </div>
              </div>
            </div>

            {/* Card Stats Section */}
            <div className="space-y-3 sm:space-y-4 order-1 md:order-2">
              {/* Type & Rarity */}
              <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-purple-500/30">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="text-gray-400 text-xs sm:text-sm mb-1">{t('cardType')}</div>
                    <div className="text-white font-semibold text-sm sm:text-base flex items-center">
                      <span className="mr-2 text-xl sm:text-2xl">{typeIcon}</span>
                      {card.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs sm:text-sm mb-1">{t('rarity')}</div>
                    <div className={`font-semibold bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent text-sm sm:text-base`}>
                      {card.rarity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl mb-1">⚔️</div>
                  <div className="text-red-400 font-bold text-lg sm:text-2xl">{card.attack || 0}</div>
                  <div className="text-gray-400 text-xs uppercase">{t('attack')}</div>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl mb-1">🛡️</div>
                  <div className="text-blue-400 font-bold text-lg sm:text-2xl">{card.defense || 0}</div>
                  <div className="text-gray-400 text-xs uppercase">{t('defense')}</div>
                </div>
                <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-2 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl mb-1">💚</div>
                  <div className="text-green-400 font-bold text-lg sm:text-2xl">{card.health || 0}</div>
                  <div className="text-gray-400 text-xs uppercase">{t('health')}</div>
                </div>
              </div>

              {/* Total Power */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-semibold text-sm sm:text-base">{t('power')}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    {power}
                  </span>
                </div>
              </div>

              {/* Ability */}
              {card.ability && (
                <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-yellow-500/30">
                  <div className="flex items-center mb-2">
                    <span className="text-lg sm:text-xl mr-2">⚡</span>
                    <span className="text-yellow-400 font-semibold text-sm sm:text-base">{t('ability')}</span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{card.ability}</p>
                </div>
              )}

              {/* NFT Ownership Info */}
              <div className="bg-purple-900/30 rounded-lg p-3 sm:p-4 border border-purple-500/30">
                <h3 className="text-purple-300 font-semibold mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <span className="mr-2">🔐</span>
                  NFT Details
                </h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Token ID:</span>
                    <span className="text-purple-400 font-mono font-bold truncate">{nftId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Owner:</span>
                    <span className="text-purple-400 font-semibold">{card.owner || 'You'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Minted:</span>
                    <span className="text-purple-400">{card.mintDate || new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 px-3 sm:px-6 py-3 sm:py-4 border-t border-purple-500/30">
          <button
            onClick={() => setShowModal(false)}
            className="w-full py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all text-sm sm:text-base"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <>
        <div
          onClick={handleCardClick}
          className={`relative bg-slate-800 rounded-lg overflow-hidden border-2 ${
            selected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-slate-700'
          } hover:scale-105 transition-transform cursor-pointer ${glowColor}`}
        >
          {/* NFT Badge */}
          {showNFTBadge && (
            <div className="absolute top-1 left-1 bg-purple-600/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold z-10">
              NFT {nftId}
            </div>
          )}

          {/* Rarity Banner */}
          <div className={`bg-gradient-to-r ${gradientColor} py-1 px-2 text-center`}>
            <span className="text-xs font-bold text-white">{card.rarity}</span>
          </div>

          {/* Card Image */}
          <div className="aspect-square bg-slate-900 flex items-center justify-center p-2">
            {shouldTryImage && (
              <img 
                src={card.image} 
                alt={card.name} 
                className={`w-full h-full object-contain ${shouldShowImage ? '' : 'hidden'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
            {(!shouldTryImage || !shouldShowImage) && (
              <span className="text-6xl">{typeIcon}</span>
            )}
          </div>

          {/* Card Info */}
          <div className="p-2 bg-slate-900/50">
            <h3 className="text-white font-bold text-sm truncate">{card.name}</h3>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">{card.type}</span>
              <span className="text-xs text-purple-400">Lv.{card.level || 1}</span>
            </div>
            {/* Token Value */}
            <div className="mt-1 flex items-center justify-center bg-yellow-500/20 rounded px-2 py-0.5">
              <span className="text-yellow-400 font-bold text-xs">💎 {tokenValue}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-slate-900/70 text-xs">
            <div className="text-center">
              <div className="text-red-400 font-bold">{card.attack || 0}</div>
              <div className="text-gray-500">ATK</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">{card.defense || 0}</div>
              <div className="text-gray-500">DEF</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold">{card.health || 0}</div>
              <div className="text-gray-500">HP</div>
            </div>
          </div>
        </div>
        {showModal && <CardDetailModal />}
      </>
    );
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`relative bg-slate-800 rounded-xl overflow-hidden border-2 ${
          selected ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50' : 'border-slate-700'
        } hover:scale-105 transition-all cursor-pointer ${glowColor} w-64`}
      >
        {/* NFT Badge */}
        {showNFTBadge && (
          <div className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold z-10 border border-purple-400">
            NFT {nftId}
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute top-2 right-2 bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center z-10 border-2 border-white">
          <span className="text-white font-bold text-sm">{card.level || 1}</span>
        </div>

        {/* Rarity Banner */}
        <div className={`bg-gradient-to-r ${gradientColor} py-2 px-4 text-center`}>
          <span className="text-sm font-bold text-white uppercase tracking-wider">{card.rarity}</span>
        </div>

        {/* Card Image - Improved sizing */}
        <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-2 min-h-[320px]">
          {shouldTryImage && (
            <img 
              src={card.image} 
              alt={card.name} 
              className={`max-w-[95%] max-h-[320px] w-auto h-auto object-contain ${shouldShowImage ? '' : 'hidden'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          {(!shouldTryImage || !shouldShowImage) && (
            <span className="text-9xl">{typeIcon}</span>
          )}
        </div>

        {/* Card Name & Type */}
        <div className="bg-slate-900/80 p-4">
          <h3 className="text-white font-bold text-xl mb-1 truncate">{card.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center">
              <span className="mr-1">{typeIcon}</span>
              {card.type}
            </span>
            <span className="text-sm font-semibold text-purple-400">Power: {power}</span>
          </div>
          {/* Token Value Display */}
          <div className="mt-2 flex items-center justify-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg px-3 py-1.5 border border-yellow-500/30">
            <span className="text-yellow-400 font-bold text-sm">💎 {tokenValue} Tokens</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-900">
          <div className="text-center bg-slate-800 rounded-lg p-2">
            <div className="text-red-400 font-bold text-lg">{card.attack || 0}</div>
            <div className="text-gray-500 text-xs">Attack</div>
          </div>
          <div className="text-center bg-slate-800 rounded-lg p-2">
            <div className="text-blue-400 font-bold text-lg">{card.defense || 0}</div>
            <div className="text-gray-500 text-xs">Defense</div>
          </div>
          <div className="text-center bg-slate-800 rounded-lg p-2">
            <div className="text-green-400 font-bold text-lg">{card.health || 0}</div>
            <div className="text-gray-500 text-xs">Health</div>
          </div>
        </div>

        {/* Ability */}
        {card.ability && (
          <div className="bg-slate-900/90 p-3 border-t border-slate-700">
            <div className="text-yellow-400 text-xs font-semibold mb-1">⚡ Ability</div>
            <p className="text-gray-300 text-xs leading-relaxed">{card.ability}</p>
          </div>
        )}

        {/* NFT Ownership Info */}
        <div className="bg-purple-900/30 p-3 border-t border-purple-500/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-300">Owner:</span>
            <span className="text-purple-400 font-mono truncate">{card.owner || 'You'}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-purple-300">Minted:</span>
            <span className="text-purple-400">{card.mintDate || new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      {showModal && <CardDetailModal />}
    </>
  );
};

export default Card;