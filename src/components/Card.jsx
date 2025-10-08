import React from 'react';

const Card = ({ card, onClick, compact = false, selected = false }) => {
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

  // Calculate power safely
  const calculatePower = () => {
    const attack = card.attack || 0;
    const defense = card.defense || 0;
    const health = card.health || 0;
    return Math.floor(attack + defense + (health / 2));
  };

  const power = calculatePower();

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`relative bg-slate-800 rounded-lg overflow-hidden border-2 ${
          selected ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-slate-700'
        } hover:scale-105 transition-transform cursor-pointer ${glowColor}`}
      >
        {/* Rarity Banner */}
        <div className={`bg-gradient-to-r ${gradientColor} py-1 px-2 text-center`}>
          <span className="text-xs font-bold text-white">{card.rarity}</span>
        </div>

        {/* Card Image */}
        <div className="aspect-square bg-slate-900 flex items-center justify-center p-2">
          {card.image ? (
            <img src={card.image} alt={card.name} className="w-full h-full object-contain" />
          ) : (
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
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative bg-slate-800 rounded-xl overflow-hidden border-2 ${
        selected ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50' : 'border-slate-700'
      } hover:scale-105 transition-all cursor-pointer ${glowColor} w-64`}
    >
      {/* Level Badge */}
      <div className="absolute top-2 right-2 bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center z-10 border-2 border-white">
        <span className="text-white font-bold text-sm">{card.level || 1}</span>
      </div>

      {/* Rarity Banner */}
      <div className={`bg-gradient-to-r ${gradientColor} py-2 px-4 text-center`}>
        <span className="text-sm font-bold text-white uppercase tracking-wider">{card.rarity}</span>
      </div>

      {/* Card Image */}
      <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        {card.image ? (
          <img src={card.image} alt={card.name} className="w-full h-full object-contain" />
        ) : (
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
    </div>
  );
};

export default Card;