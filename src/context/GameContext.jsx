import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userCards, setUserCards] = useState([]);
  const [userDecks, setUserDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mythicWarriorsUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      // Load user cards and decks
      const storedCards = localStorage.getItem(`cards_${parsedUser.username}`);
      const storedDecks = localStorage.getItem(`decks_${parsedUser.username}`);
      
      if (storedCards) {
        setUserCards(JSON.parse(storedCards));
      }
      if (storedDecks) {
        const decks = JSON.parse(storedDecks);
        setUserDecks(decks);
        const active = decks.find(d => d.isActive);
        if (active) setActiveDeck(active);
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('mythicWarriorsUser', JSON.stringify(user));
    }
  }, [user]);

  // Save cards to localStorage
  useEffect(() => {
    if (user && userCards.length > 0) {
      localStorage.setItem(`cards_${user.username}`, JSON.stringify(userCards));
    }
  }, [userCards, user]);

  // Save decks to localStorage
  useEffect(() => {
    if (user && userDecks.length > 0) {
      localStorage.setItem(`decks_${user.username}`, JSON.stringify(userDecks));
    }
  }, [userDecks, user]);

  const register = (username, email, password) => {
    // Check if user already exists
    const existingUser = localStorage.getItem(`user_${username}`);
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      username,
      email,
      avatar: '🎮',
      level: 1,
      experience: 0,
      gold: 1000,
      gems: 100,
      energy: 100,
      rating: 1000,
      rank: 'Bronze',
      stats: {
        totalBattles: 0,
        wins: 0,
        losses: 0,
        winStreak: 0,
        bestWinStreak: 0,
        tournamentsWon: 0,
        totalGoldEarned: 0,
        cardsCollected: 0,
      },
      clan: null,
      clanRole: 'Member',
    };

    // Save user credentials
    localStorage.setItem(`user_${username}`, JSON.stringify({ username, email, password }));

    setUser(newUser);
    setIsAuthenticated(true);
    
    // Generate starter cards
    const starterCards = generateStarterCards();
    setUserCards(starterCards);
    
    // Create starter deck
    const starterDeck = {
      id: Date.now(),
      name: 'Starter Deck',
      cards: starterCards.slice(0, 5),
      isActive: true,
      wins: 0,
      losses: 0,
      totalPower: starterCards.slice(0, 5).reduce((sum, card) => sum + card.attack + card.defense, 0),
    };
    
    setUserDecks([starterDeck]);
    setActiveDeck(starterDeck);
    
    return { success: true, message: 'Registration successful' };
  };

  const login = (username, password) => {
    // Check if user exists
    const storedUserAuth = localStorage.getItem(`user_${username}`);
    
    if (storedUserAuth) {
      const userAuth = JSON.parse(storedUserAuth);
      if (userAuth.password !== password) {
        return false;
      }
    }

    // Get or create user data
    const storedUser = localStorage.getItem('mythicWarriorsUser');
    let userData;

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.username === username) {
        userData = parsed;
      }
    }

    if (!userData) {
      // Create new user data for first-time login
      userData = {
        id: Date.now(),
        username,
        email: `${username}@mythicwarriors.com`,
        avatar: '🎮',
        level: 1,
        experience: 0,
        gold: 1000,
        gems: 100,
        energy: 100,
        rating: 1000,
        rank: 'Bronze',
        stats: {
          totalBattles: 0,
          wins: 0,
          losses: 0,
          winStreak: 0,
          bestWinStreak: 0,
          tournamentsWon: 0,
          totalGoldEarned: 0,
          cardsCollected: 0,
        },
        clan: null,
        clanRole: 'Member',
      };
    }

    setUser(userData);
    setIsAuthenticated(true);
    
    // Load or generate cards
    const storedCards = localStorage.getItem(`cards_${username}`);
    if (storedCards) {
      setUserCards(JSON.parse(storedCards));
    } else {
      const starterCards = generateStarterCards();
      setUserCards(starterCards);
    }
    
    // Load or create decks
    const storedDecks = localStorage.getItem(`decks_${username}`);
    if (storedDecks) {
      const decks = JSON.parse(storedDecks);
      setUserDecks(decks);
      const active = decks.find(d => d.isActive);
      if (active) setActiveDeck(active);
    } else {
      const cards = storedCards ? JSON.parse(storedCards) : generateStarterCards();
      const starterDeck = {
        id: Date.now(),
        name: 'Starter Deck',
        cards: cards.slice(0, 5),
        isActive: true,
        wins: 0,
        losses: 0,
        totalPower: cards.slice(0, 5).reduce((sum, card) => sum + card.attack + card.defense, 0),
      };
      setUserDecks([starterDeck]);
      setActiveDeck(starterDeck);
    }
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setUserCards([]);
    setUserDecks([]);
    setActiveDeck(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mythicWarriorsUser');
    if (user) {
      localStorage.removeItem(`cards_${user.username}`);
      localStorage.removeItem(`decks_${user.username}`);
    }
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateUserStats = (updates) => {
    setUser(prev => ({
      ...prev,
      ...updates,
      stats: { ...prev.stats, ...updates.stats }
    }));
  };

  const addCard = (card) => {
    setUserCards(prev => [...prev, card]);
  };

  const removeCard = (cardId) => {
    setUserCards(prev => prev.filter(c => c.id !== cardId));
  };

  const addDeck = (deck) => {
    setUserDecks(prev => [...prev, deck]);
  };

  const updateDeck = (deckId, updates) => {
    setUserDecks(prev => prev.map(deck => 
      deck.id === deckId ? { ...deck, ...updates } : deck
    ));
    if (activeDeck && activeDeck.id === deckId) {
      setActiveDeck(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteDeck = (deckId) => {
    setUserDecks(prev => prev.filter(d => d.id !== deckId));
    if (activeDeck && activeDeck.id === deckId) {
      setActiveDeck(null);
    }
  };

  const setActiveUserDeck = (deckId) => {
    const deck = userDecks.find(d => d.id === deckId);
    if (deck) {
      setUserDecks(prev => prev.map(d => ({
        ...d,
        isActive: d.id === deckId
      })));
      setActiveDeck(deck);
    }
  };

  const value = {
    user,
    userCards,
    userDecks,
    activeDeck,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
    updateUserStats,
    addCard,
    removeCard,
    addDeck,
    updateDeck,
    deleteDeck,
    setActiveDeck: setActiveUserDeck,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Replace the generateStarterCards function at the bottom of GameContext.jsx
// with this complete version:

function generateStarterCards() {
  const cards = [];
  const types = ['Warrior', 'Mage', 'Assassin', 'Tank', 'Support'];
  const names = {
    Warrior: ['Achilles', 'Hercules', 'Leonidas', 'Spartacus'],
    Mage: ['Merlin', 'Gandalf', 'Morgana', 'Circe'],
    Assassin: ['Loki', 'Artemis', 'Hermes', 'Shadow'],
    Tank: ['Atlas', 'Thor', 'Titan', 'Goliath'],
    Support: ['Athena', 'Freya', 'Iris', 'Hestia']
  };

  // Predefined cards with custom images
  const predefinedCards = [
    {
      id: Date.now() + 1,
      name: 'Zeus',
      type: 'Mage',
      rarity: 'Legendary',
      level: 5,
      attack: 85,
      defense: 60,
      health: 150,
      ability: 'Thunder Strike: Deal massive lightning damage to all enemies',
      image: '/cards/zeus.png',
    },
    {
      id: Date.now() + 2,
      name: 'Odin',
      type: 'Support',
      rarity: 'Epic',
      level: 4,
      attack: 60,
      defense: 80,
      health: 140,
      ability: 'Shield of Wisdom: Increase defense for all allies by 30%',
      image: '/cards/odin.png',
    },
    {
      id: Date.now() + 3,
      name: 'Ares',
      type: 'Warrior',
      rarity: 'Epic',
      level: 4,
      attack: 90,
      defense: 50,
      health: 130,
      ability: 'War Cry: Boost attack power of all allies by 25%',
      image: '/cards/ares.png',
    },
    {
      id: Date.now() + 4,
      name: 'Poseidon',
      type: 'Mage',
      rarity: 'Legendary',
      level: 5,
      attack: 80,
      defense: 65,
      health: 145,
      ability: 'Tsunami: Flood the battlefield dealing water damage',
      image: '/cards/poseidon.png',
    },
    {
      id: Date.now() + 5,
      name: 'Cronus',
      type: 'Warrior',
      rarity: 'Rare',
      level: 3,
      attack: 75,
      defense: 55,
      health: 120,
      ability: 'Titan Strength: Deal double damage for one turn',
      image: '/cards/cronus.png',
    },
    {
      id: Date.now() + 6,
      name: 'Apollo',
      type: 'Support',
      rarity: 'Epic',
      level: 4,
      attack: 60,
      defense: 80,
      health: 140,
      ability: 'Healing Light: Restore health to all allies',
      image: '/cards/apollo.png',
    },
    {
      id: Date.now() + 7,
      name: 'Aphrodite',
      type: 'Support',
      rarity: 'Epic',
      level: 4,
      attack: 55,
      defense: 70,
      health: 135,
      ability: 'Charm: Confuse enemies and reduce their attack',
      image: '/cards/aphrodite.png',
    },
    {
      id: Date.now() + 8,
      name: 'Hera',
      type: 'Support',
      rarity: 'Epic',
      level: 4,
      attack: 65,
      defense: 75,
      health: 138,
      ability: 'Queen\'s Blessing: Protect allies from harm',
      image: '/cards/hera.png',
    },
  ];

  // Add predefined cards
  cards.push(...predefinedCards);
  
  // Generate 5 more random cards WITHOUT any image URLs
  for (let i = 0; i < 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const typeNames = names[type];
    const name = typeNames[Math.floor(Math.random() * typeNames.length)];
    const rarities = ['Common', 'Rare'];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    
    cards.push({
      id: Date.now() + i + 100 + Math.random(),
      name: name,
      type,
      rarity,
      level: 1,
      attack: 30 + Math.floor(Math.random() * 20),
      defense: 30 + Math.floor(Math.random() * 20),
      health: 100 + Math.floor(Math.random() * 50),
      ability: 'Basic Attack',
      // NO image property at all - will use icon fallback
    });
  }
  
  return cards;
}




