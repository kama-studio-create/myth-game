// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MythicWarriorsNFT
 * @dev NFT contract for Mythic Warriors game cards
 */
contract MythicWarriorsNFT is 
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;

    // Token counter
    Counters.Counter private _tokenIdCounter;

    // Minting price in wei
    uint256 public mintPrice = 0.1 ether;

    // Card data structure
    struct CardData {
        string name;
        string cardType; // Warrior, Mage, Assassin, Tank, Support
        string rarity; // Common, Rare, Epic, Legendary, Mythic
        uint256 attack;
        uint256 defense;
        uint256 health;
        uint256 level;
        uint256 power;
        uint256 mintedAt;
        bool isLocked; // Locked cards can't be transferred
    }

    // Mapping from token ID to card data
    mapping(uint256 => CardData) public cardData;

    // Mapping for royalty information
    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) public royaltyPercentages;

    // Events
    event CardMinted(
        uint256 indexed tokenId,
        address indexed to,
        string name,
        string rarity,
        uint256 power
    );
    
    event CardBurned(uint256 indexed tokenId);
    
    event CardLocked(uint256 indexed tokenId);
    
    event CardUnlocked(uint256 indexed tokenId);
    
    event MintPriceUpdated(uint256 newPrice);
    
    event RoyaltySet(uint256 indexed tokenId, address creator, uint256 percentage);

    // Modifiers
    modifier cardExists(uint256 tokenId) {
        require(_exists(tokenId), "Card does not exist");
        _;
    }

    modifier cardNotLocked(uint256 tokenId) {
        require(!cardData[tokenId].isLocked, "Card is locked");
        _;
    }

    constructor() ERC721("Mythic Warriors", "MYTHIC") {}

    /**
     * @dev Mint a new NFT card
     */
    function mintCard(
        address to,
        string memory name,
        string memory cardType,
        string memory rarity,
        uint256 attack,
        uint256 defense,
        uint256 health,
        string memory uri
    ) public payable nonReentrant returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(bytes(name).length > 0, "Name cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Calculate power
        uint256 power = _calculatePower(attack, defense, health, rarity);

        // Store card data
        cardData[tokenId] = CardData({
            name: name,
            cardType: cardType,
            rarity: rarity,
            attack: attack,
            defense: defense,
            health: health,
            level: 1,
            power: power,
            mintedAt: block.timestamp,
            isLocked: false
        });

        // Store creator info
        creators[tokenId] = msg.sender;
        royaltyPercentages[tokenId] = 5; // 5% royalty by default

        // Mint token
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit CardMinted(tokenId, to, name, rarity, power);

        return tokenId;
    }

    /**
     * @dev Upgrade card level and stats
     */
    function upgradeCard(uint256 tokenId) public cardExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not card owner");
        require(cardData[tokenId].level < 50, "Max level reached");

        CardData storage card = cardData[tokenId];
        
        card.level += 1;
        card.attack = (card.attack * 105) / 100; // 5% increase
        card.defense = (card.defense * 105) / 100;
        card.health = (card.health * 105) / 100;
        card.power = _calculatePower(card.attack, card.defense, card.health, card.rarity);
    }

    /**
     * @dev Lock a card (prevent transfers)
     */
    function lockCard(uint256 tokenId) public cardExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not card owner");
        cardData[tokenId].isLocked = true;
        emit CardLocked(tokenId);
    }

    /**
     * @dev Unlock a card (allow transfers)
     */
    function unlockCard(uint256 tokenId) public cardExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not card owner");
        cardData[tokenId].isLocked = false;
        emit CardUnlocked(tokenId);
    }

    /**
     * @dev Set mint price
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    /**
     * @dev Set royalty for a card
     */
    function setRoyalty(
        uint256 tokenId,
        address creator,
        uint256 percentage
    ) public onlyOwner cardExists(tokenId) {
        require(percentage <= 100, "Invalid percentage");
        creators[tokenId] = creator;
        royaltyPercentages[tokenId] = percentage;
        emit RoyaltySet(tokenId, creator, percentage);
    }

    /**
     * @dev Get card data
     */
    function getCardData(uint256 tokenId) 
        public 
        view 
        cardExists(tokenId) 
        returns (CardData memory) 
    {
        return cardData[tokenId];
    }

    /**
     * @dev Get cards by owner
     */
    function getCardsByOwner(address owner) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 balance = balanceOf(owner);
        uint256[] memory cards = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            cards[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return cards;
    }

    /**
     * @dev Calculate card power
     */
    function _calculatePower(
        uint256 attack,
        uint256 defense,
        uint256 health,
        string memory rarity
    ) internal pure returns (uint256) {
        uint256 baseStats = attack + defense + (health / 2);
        
        uint256 rarityMultiplier;
        if (keccak256(bytes(rarity)) == keccak256(bytes("Common"))) {
            rarityMultiplier = 100;
        } else if (keccak256(bytes(rarity)) == keccak256(bytes("Rare"))) {
            rarityMultiplier = 150;
        } else if (keccak256(bytes(rarity)) == keccak256(bytes("Epic"))) {
            rarityMultiplier = 200;
        } else if (keccak256(bytes(rarity)) == keccak256(bytes("Legendary"))) {
            rarityMultiplier = 300;
        } else if (keccak256(bytes(rarity)) == keccak256(bytes("Mythic"))) {
            rarityMultiplier = 500;
        } else {
            rarityMultiplier = 100;
        }
        
        return (baseStats * rarityMultiplier) / 100;
    }

    /**
     * @dev Override transfer to prevent locked card transfers
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        if (from != address(0)) {
            require(!cardData[tokenId].isLocked, "Card is locked");
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Withdraw contract funds
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Required overrides
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
        emit CardBurned(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }
}