import { CARD_RARITIES } from './constants';

export const calculateCardPower = (card) => {
  const baseStats = (card.attack || 0) + (card.defense || 0) + (card.health || 0) + (card.magic || 0) + (card.speed || 0);
  const rarityMultipliers = {
    'Common': 1,
    'Rare': 1.5,
    'Epic': 2,
    'Legendary': 3,
    'Mythic': 5
  };
  const rarityMultiplier = rarityMultipliers[card.rarity] || 1;
  const levelMultiplier = 1 + (card.level * 0.1);
  return Math.floor(baseStats * rarityMultiplier * levelMultiplier);
};

export const simulateBattle = (playerDeck, opponentDeck) => {
  const playerPower = playerDeck.reduce((sum, card) => sum + calculateCardPower(card), 0);
  const opponentPower = opponentDeck.reduce((sum, card) => sum + calculateCardPower(card), 0);
  
  const playerWinChance = playerPower / (playerPower + opponentPower);
  const randomFactor = Math.random() * 0.3 - 0.15; // ±15% randomness
  const finalChance = Math.max(0.1, Math.min(0.9, playerWinChance + randomFactor));
  
  return Math.random() < finalChance;
};

export const generateReward = (victory, tournamentLevel = 1) => {
  const baseReward = victory ? 100 : 30;
  const multiplier = tournamentLevel * 1.5;
  return Math.floor(baseReward * multiplier);
};

export const generateRandomCard = () => {
  const types = ['Warrior', 'Mage', 'Assassin', 'Tank', 'Support'];
  const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
  const type = types[Math.floor(Math.random() * types.length)];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  
  const names = {
    Warrior: ['Blade Master', 'Knight', 'Berserker', 'Gladiator', 'Samurai'],
    Mage: ['Archmage', 'Sorcerer', 'Warlock', 'Enchanter', 'Wizard'],
    Assassin: ['Shadow', 'Rogue', 'Ninja', 'Reaper', 'Phantom'],
    Tank: ['Guardian', 'Defender', 'Paladin', 'Juggernaut', 'Sentinel'],
    Support: ['Healer', 'Cleric', 'Druid', 'Mystic', 'Shaman']
  };
  
  const typeNames = names[type];
  const name = typeNames[Math.floor(Math.random() * typeNames.length)];
  
  return {
    id: `card_${Date.now()}_${Math.random()}`,
    name: `${name}`,
    type,
    rarity,
    attack: Math.floor(Math.random() * 50) + 30,
    defense: Math.floor(Math.random() * 50) + 30,
    health: Math.floor(Math.random() * 50) + 80,
    magic: Math.floor(Math.random() * 50) + 30,
    speed: Math.floor(Math.random() * 50) + 30,
    level: 1,
    ability: 'Basic Attack',
    // NO image property - will use type icon fallback in Card component
    image: null
  };
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};