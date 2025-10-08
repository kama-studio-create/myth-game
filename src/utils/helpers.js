import { CARD_RARITIES } from './constants';

export const calculateCardPower = (card) => {
  const baseStats = card.attack + card.defense + card.health + card.magic + card.speed;
  const rarityMultiplier = CARD_RARITIES[card.rarity].multiplier;
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
  const types = Object.keys(CARD_RARITIES);
  const rarity = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: `card_${Date.now()}_${Math.random()}`,
    name: `${rarity} ${['Warrior', 'Mage', 'Tank'][Math.floor(Math.random() * 3)]}`,
    type: ['WARRIOR', 'MAGE', 'TANK', 'ASSASSIN', 'HEALER'][Math.floor(Math.random() * 5)],
    rarity,
    attack: Math.floor(Math.random() * 50) + 50,
    defense: Math.floor(Math.random() * 50) + 50,
    health: Math.floor(Math.random() * 50) + 50,
    magic: Math.floor(Math.random() * 50) + 50,
    speed: Math.floor(Math.random() * 50) + 50,
    level: 1,
    image: ['⚔️', '🔮', '🛡️', '🗡️', '💚'][Math.floor(Math.random() * 5)]
  };
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};