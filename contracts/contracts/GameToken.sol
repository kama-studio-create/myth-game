// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GameToken (MYTHIC)
 * @dev ERC20 token for Mythic Warriors game
 */
contract GameToken is 
    ERC20,
    ERC20Burnable,
    ERC20Snapshot,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    // Maximum supply
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18; // 100 million tokens

    // Minting allowance per address
    mapping(address => bool) public minters;
    mapping(address => uint256) public mintingAllowance;

    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    // Modifiers
    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized to mint");
        _;
    }

    constructor() ERC20("Mythic Warriors Token", "MYTHIC") {
        // Initial mint to owner
        _mint(msg.sender, 10_000_000 * 10 ** 18); // 10 million tokens
    }

    /**
     * @dev Add a minter address
     */
    function addMinter(address minter, uint256 allowance) public onlyOwner {
        require(minter != address(0), "Invalid address");
        minters[minter] = true;
        mintingAllowance[minter] = allowance;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter address
     */
    function removeMinter(address minter) public onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint tokens (only authorized minters)
     */
    function mint(address to, uint256 amount) public onlyMinter nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(amount <= mintingAllowance[msg.sender], "Exceeds minting allowance");

        mintingAllowance[msg.sender] -= amount;
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from address
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Create a snapshot
     */
    function snapshot() public onlyOwner {
        _snapshot();
    }

    /**
     * @dev Airdrop tokens to multiple addresses
     */
    function airdrop(address[] memory recipients, uint256[] memory amounts) 
        public 
        onlyOwner 
        nonReentrant 
    {
        require(recipients.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Get token balance with snapshot
     */
    function balanceOfAt(address account, uint256 snapshotId)
        public
        view
        returns (uint256)
    {
        return super.balanceOfAt(account, snapshotId);
    }

    /**
     * @dev Get total supply at snapshot
     */
    function totalSupplyAt(uint256 snapshotId)
        public
        view
        returns (uint256)
    {
        return super.totalSupplyAt(snapshotId);
    }

    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Snapshot) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20)
    {
        super._burn(account, amount);
    }
}