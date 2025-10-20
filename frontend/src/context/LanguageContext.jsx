import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    battle: 'Battle',
    deckBuilder: 'Deck Builder',
    marketplace: 'Marketplace',
    clan: 'Clan',
    tournament: 'Tournament',
    leaderboard: 'Leaderboard',
    designContest: 'Design Contest',
    logout: 'Logout',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    readyForBattle: 'Ready for battle?',
    level: 'Level',
    gold: 'Gold',
    winRate: 'Win Rate',
    rating: 'Rating',
    rank: 'Rank',
    dailyRewards: 'Daily Rewards Available!',
    claimRewards: 'Claim your free rewards and share for bonus!',
    claimNow: 'Claim Now',
    quickActions: 'Quick Actions',
    activeDeck: 'Active Deck',
    yourCollection: 'Your Collection',
    totalCards: 'Total Cards',
    
    // Battle
    battleArena: 'Battle Arena',
    testYourDeck: 'Test your deck against formidable opponents!',
    yourBattleStats: 'Your Battle Stats',
    energy: 'Energy',
    yourBattleDeck: 'Your Battle Deck',
    startBattle: 'START BATTLE',
    quickMatch: 'Quick Match',
    rankedMatch: 'Ranked Match',
    pvpBattle: 'PvP Battle',
    victory: 'VICTORY!',
    defeat: 'DEFEAT!',
    
    // Deck Builder
    createAndManage: 'Create and manage your battle decks!',
    newDeck: 'New Deck',
    setActive: 'Set Active',
    active: 'Active',
    deleteDeck: 'Delete',
    cards: 'Cards',
    power: 'Power',
    
    // Marketplace
    buyAndSell: 'Buy and sell cards to strengthen your collection',
    buyCards: 'Buy Cards',
    sellCards: 'Sell Cards',
    cardPacks: 'Card Packs',
    availableCards: 'Available Cards',
    price: 'Price',
    buyNow: 'Buy Now',
    
    // Card Details
    attack: 'Attack',
    defense: 'Defense',
    health: 'Health',
    ability: 'Ability',
    cardType: 'Type',
    rarity: 'Rarity',
    
    // Common
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
  },
  es: {
    // Navigation
    dashboard: 'Tablero',
    battle: 'Batalla',
    deckBuilder: 'Constructor de Mazos',
    marketplace: 'Mercado',
    clan: 'Clan',
    tournament: 'Torneo',
    leaderboard: 'Clasificación',
    designContest: 'Concurso de Diseño',
    logout: 'Cerrar Sesión',
    
    // Dashboard
    welcomeBack: 'Bienvenido de nuevo',
    readyForBattle: '¿Listo para la batalla?',
    level: 'Nivel',
    gold: 'Oro',
    winRate: 'Tasa de Victoria',
    rating: 'Puntuación',
    rank: 'Rango',
    dailyRewards: '¡Recompensas Diarias Disponibles!',
    claimRewards: '¡Reclama tus recompensas gratis y comparte para bonificación!',
    claimNow: 'Reclamar Ahora',
    quickActions: 'Acciones Rápidas',
    activeDeck: 'Mazo Activo',
    yourCollection: 'Tu Colección',
    totalCards: 'Cartas Totales',
    
    // Battle
    battleArena: 'Arena de Batalla',
    testYourDeck: '¡Prueba tu mazo contra oponentes formidables!',
    yourBattleStats: 'Tus Estadísticas de Batalla',
    energy: 'Energía',
    yourBattleDeck: 'Tu Mazo de Batalla',
    startBattle: 'COMENZAR BATALLA',
    quickMatch: 'Partida Rápida',
    rankedMatch: 'Partida Clasificatoria',
    pvpBattle: 'Batalla JcJ',
    victory: '¡VICTORIA!',
    defeat: '¡DERROTA!',
    
    // Deck Builder
    createAndManage: '¡Crea y gestiona tus mazos de batalla!',
    newDeck: 'Nuevo Mazo',
    setActive: 'Activar',
    active: 'Activo',
    deleteDeck: 'Eliminar',
    cards: 'Cartas',
    power: 'Poder',
    
    // Marketplace
    buyAndSell: 'Compra y vende cartas para fortalecer tu colección',
    buyCards: 'Comprar Cartas',
    sellCards: 'Vender Cartas',
    cardPacks: 'Paquetes de Cartas',
    availableCards: 'Cartas Disponibles',
    price: 'Precio',
    buyNow: 'Comprar Ahora',
    
    // Card Details
    attack: 'Ataque',
    defense: 'Defensa',
    health: 'Salud',
    ability: 'Habilidad',
    cardType: 'Tipo',
    rarity: 'Rareza',
    
    // Common
    close: 'Cerrar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    battle: 'Bataille',
    deckBuilder: 'Constructeur de Deck',
    marketplace: 'Marché',
    clan: 'Clan',
    tournament: 'Tournoi',
    leaderboard: 'Classement',
    designContest: 'Concours de Design',
    logout: 'Déconnexion',
    
    // Dashboard
    welcomeBack: 'Bon retour',
    readyForBattle: 'Prêt pour la bataille?',
    level: 'Niveau',
    gold: 'Or',
    winRate: 'Taux de Victoire',
    rating: 'Évaluation',
    rank: 'Rang',
    dailyRewards: 'Récompenses Quotidiennes Disponibles!',
    claimRewards: 'Réclamez vos récompenses gratuites et partagez pour un bonus!',
    claimNow: 'Réclamer Maintenant',
    quickActions: 'Actions Rapides',
    activeDeck: 'Deck Actif',
    yourCollection: 'Votre Collection',
    totalCards: 'Cartes Totales',
    
    // Battle
    battleArena: 'Arène de Bataille',
    testYourDeck: 'Testez votre deck contre des adversaires redoutables!',
    yourBattleStats: 'Vos Statistiques de Bataille',
    energy: 'Énergie',
    yourBattleDeck: 'Votre Deck de Bataille',
    startBattle: 'COMMENCER LA BATAILLE',
    quickMatch: 'Match Rapide',
    rankedMatch: 'Match Classé',
    pvpBattle: 'Bataille JcJ',
    victory: 'VICTOIRE!',
    defeat: 'DÉFAITE!',
    
    // Deck Builder
    createAndManage: 'Créez et gérez vos decks de bataille!',
    newDeck: 'Nouveau Deck',
    setActive: 'Activer',
    active: 'Actif',
    deleteDeck: 'Supprimer',
    cards: 'Cartes',
    power: 'Puissance',
    
    // Marketplace
    buyAndSell: 'Achetez et vendez des cartes pour renforcer votre collection',
    buyCards: 'Acheter des Cartes',
    sellCards: 'Vendre des Cartes',
    cardPacks: 'Paquets de Cartes',
    availableCards: 'Cartes Disponibles',
    price: 'Prix',
    buyNow: 'Acheter Maintenant',
    
    // Card Details
    attack: 'Attaque',
    defense: 'Défense',
    health: 'Santé',
    ability: 'Capacité',
    cardType: 'Type',
    rarity: 'Rareté',
    
    // Common
    close: 'Fermer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Sauvegarder',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
  },
  de: {
    // Navigation
    dashboard: 'Dashboard',
    battle: 'Kampf',
    deckBuilder: 'Deck-Builder',
    marketplace: 'Marktplatz',
    clan: 'Clan',
    tournament: 'Turnier',
    leaderboard: 'Bestenliste',
    designContest: 'Design-Wettbewerb',
    logout: 'Abmelden',
    
    // Dashboard
    welcomeBack: 'Willkommen zurück',
    readyForBattle: 'Bereit für den Kampf?',
    level: 'Level',
    gold: 'Gold',
    winRate: 'Siegesrate',
    rating: 'Bewertung',
    rank: 'Rang',
    dailyRewards: 'Tägliche Belohnungen Verfügbar!',
    claimRewards: 'Holen Sie sich Ihre kostenlosen Belohnungen und teilen Sie für Bonus!',
    claimNow: 'Jetzt Beanspruchen',
    quickActions: 'Schnellaktionen',
    activeDeck: 'Aktives Deck',
    yourCollection: 'Ihre Sammlung',
    totalCards: 'Karten Gesamt',
    
    // Battle
    battleArena: 'Kampfarena',
    testYourDeck: 'Teste dein Deck gegen beeindruckende Gegner!',
    yourBattleStats: 'Ihre Kampfstatistiken',
    energy: 'Energie',
    yourBattleDeck: 'Ihr Kampfdeck',
    startBattle: 'KAMPF STARTEN',
    quickMatch: 'Schnelles Match',
    rankedMatch: 'Gewertetes Match',
    pvpBattle: 'PvP-Kampf',
    victory: 'SIEG!',
    defeat: 'NIEDERLAGE!',
    
    // Deck Builder
    createAndManage: 'Erstellen und verwalten Sie Ihre Kampfdecks!',
    newDeck: 'Neues Deck',
    setActive: 'Aktivieren',
    active: 'Aktiv',
    deleteDeck: 'Löschen',
    cards: 'Karten',
    power: 'Kraft',
    
    // Marketplace
    buyAndSell: 'Kaufen und verkaufen Sie Karten, um Ihre Sammlung zu stärken',
    buyCards: 'Karten Kaufen',
    sellCards: 'Karten Verkaufen',
    cardPacks: 'Kartenpakete',
    availableCards: 'Verfügbare Karten',
    price: 'Preis',
    buyNow: 'Jetzt Kaufen',
    
    // Card Details
    attack: 'Angriff',
    defense: 'Verteidigung',
    health: 'Gesundheit',
    ability: 'Fähigkeit',
    cardType: 'Typ',
    rarity: 'Seltenheit',
    
    // Common
    close: 'Schließen',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    create: 'Erstellen',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gameLanguage') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gameLanguage', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const value = {
    language,
    changeLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};