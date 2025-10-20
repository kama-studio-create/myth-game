// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title GameStaking
 * @dev Staking contract for MYTHIC tokens and NFT cards
 */
contract GameStaking is ReentrancyGuard, Pausable, Ownable {
    using SafeMath for uint256;

    IERC20 public stakingToken;
    IERC721 public nftToken;

    // Staking data structure
    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 rewardsEarned;
    }

    struct NFTStakingInfo {
        uint256 stakedAt;
        uint256 lastClaimTime;
        uint256 rewardsEarned;
    }

    // APY (Annual Percentage Yield) in basis points (10000 = 100%)
    uint256 public tokenAPY = 2000; // 20% APY
    uint256 public nftAPY = 5000; // 50% APY

    // Minimum staking amounts
    uint256 public minTokenStake = 1000 * 10 ** 18; // 1000 tokens
    uint256 public minStakingPeriod = 7 days;

    // Mappings
    mapping(address => StakingInfo) public tokenStakers;
    mapping(address => mapping(uint256 => NFTStakingInfo)) public nftStakers;
    mapping(address => uint256[]) public stakedNFTs;
    mapping(uint256 => address) public nftOwner;

    // Total staked amounts
    uint256 public totalTokensStaked;
    uint256 public totalNFTsStaked;

    // Events
    event TokenStaked(address indexed staker, uint256 amount);
    event TokenUnstaked(address indexed staker, uint256 amount);
    event RewardsClaimed(address indexed staker, uint256 amount);
    event NFTStaked(address indexed staker, uint256[] tokenIds);
    event NFTUnstaked(address indexed staker, uint256[] tokenIds);
    event APYUpdated(uint256 tokenAPY, uint256 nftAPY);

    constructor(address _stakingToken, address _nftToken) {
        stakingToken = IERC20(_stakingToken);
        nftToken = IERC721(_nftToken);
    }

    /**
     * @dev Stake tokens
     */
    function stakeTokens(uint256 amount) public nonReentrant whenNotPaused {
        require(amount >= minTokenStake, "Amount below minimum");
        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        StakingInfo storage info = tokenStakers[msg.sender];

        // Claim any pending rewards
        if (info.amount > 0) {
            uint256 rewards = calculateTokenRewards(msg.sender);
            if (rewards > 0) {
                info.rewardsEarned += rewards;
            }
        }

        info.amount += amount;
        info.startTime = block.timestamp;
        info.lastClaimTime = block.timestamp;
        totalTokensStaked += amount;

        emit TokenStaked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     */
    function unstakeTokens(uint256 amount) public nonReentrant {
        StakingInfo storage info = tokenStakers[msg.sender];

        require(info.amount >= amount, "Insufficient staked amount");
        require(
            block.timestamp >= info.startTime + minStakingPeriod,
            "Minimum staking period not met"
        );

        // Claim pending rewards
        uint256 rewards = calculateTokenRewards(msg.sender);
        if (rewards > 0) {
            info.rewardsEarned += rewards;
        }

        info.amount -= amount;
        info.lastClaimTime = block.timestamp;
        totalTokensStaked -= amount;

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");

        emit TokenUnstaked(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimTokenRewards() public nonReentrant {
        StakingInfo storage info = tokenStakers[msg.sender];
        require(info.amount > 0, "No tokens staked");

        uint256 rewards = calculateTokenRewards(msg.sender);
        require(rewards > 0, "No rewards available");

        info.rewardsEarned += rewards;
        info.lastClaimTime = block.timestamp;

        uint256 totalRewards = info.rewardsEarned;
        info.rewardsEarned = 0;

        require(stakingToken.transfer(msg.sender, totalRewards), "Transfer failed");

        emit RewardsClaimed(msg.sender, totalRewards);
    }

    /**
     * @dev Calculate token rewards
     */
    function calculateTokenRewards(address staker) public view returns (uint256) {
        StakingInfo memory info = tokenStakers[staker];
        if (info.amount == 0) {
            return 0;
        }

        uint256 timeDifference = block.timestamp - info.lastClaimTime;
        uint256 reward = (info.amount * tokenAPY * timeDifference) / (365 days * 10000);

        return reward;
    }

    /**
     * @dev Stake NFTs
     */
    function stakeNFTs(uint256[] memory tokenIds) public nonReentrant whenNotPaused {
        require(tokenIds.length > 0, "No NFTs to stake");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(nftToken.ownerOf(tokenId) == msg.sender, "Not NFT owner");

            nftToken.transferFrom(msg.sender, address(this), tokenId);

            NFTStakingInfo storage nftInfo = nftStakers[msg.sender][tokenId];
            nftInfo.stakedAt = block.timestamp;
            nftInfo.lastClaimTime = block.timestamp;

            stakedNFTs[msg.sender].push(tokenId);
            nftOwner[tokenId] = msg.sender;
        }

        totalNFTsStaked += tokenIds.length;
        emit NFTStaked(msg.sender, tokenIds);
    }

    /**
     * @dev Unstake NFTs
     */
    function unstakeNFTs(uint256[] memory tokenIds) public nonReentrant {
        require(tokenIds.length > 0, "No NFTs to unstake");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(nftOwner[tokenId] == msg.sender, "Not NFT staker");

            // Claim NFT rewards
            uint256 rewards = calculateNFTRewards(msg.sender, tokenId);
            if (rewards > 0) {
                nftStakers[msg.sender][tokenId].rewardsEarned += rewards;
            }

            nftToken.transferFrom(address(this), msg.sender, tokenId);
            delete nftOwner[tokenId];
            delete nftStakers[msg.sender][tokenId];

            // Remove from stakedNFTs array
            uint256[] storage nfts = stakedNFTs[msg.sender];
            for (uint256 j = 0; j < nfts.length; j++) {
                if (nfts[j] == tokenId) {
                    nfts[j] = nfts[nfts.length - 1];
                    nfts.pop();
                    break;
                }
            }
        }

        totalNFTsStaked -= tokenIds.length;
        emit NFTUnstaked(msg.sender, tokenIds);
    }

    /**
     * @dev Claim NFT rewards
     */
    function claimNFTRewards(uint256[] memory tokenIds) public nonReentrant {
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(nftOwner[tokenId] == msg.sender, "Not NFT staker");

            uint256 rewards = calculateNFTRewards(msg.sender, tokenId);
            NFTStakingInfo storage nftInfo = nftStakers[msg.sender][tokenId];

            totalRewards += rewards + nftInfo.rewardsEarned;
            nftInfo.rewardsEarned = 0;
            nftInfo.lastClaimTime = block.timestamp;
        }

        require(totalRewards > 0, "No rewards available");
        require(stakingToken.transfer(msg.sender, totalRewards), "Transfer failed");

        emit RewardsClaimed(msg.sender, totalRewards);
    }

    /**
     * @dev Calculate NFT rewards
     */
    function calculateNFTRewards(address staker, uint256 tokenId) 
        public 
        view 
        returns (uint256) 
    {
        NFTStakingInfo memory nftInfo = nftStakers[staker][tokenId];
        if (nftInfo.stakedAt == 0) {
            return 0;
        }

        uint256 timeDifference = block.timestamp - nftInfo.lastClaimTime;
        // Base reward: 1 token per NFT per day
        uint256 baseReward = (1 * 10 ** 18 * timeDifference) / 1 days;

        // Apply APY multiplier
        uint256 reward = (baseReward * nftAPY) / 10000;

        return reward;
    }

    /**
     * @dev Get staker's info
     */
    function getStakerInfo(address staker) 
        public 
        view 
        returns (uint256 stakedAmount, uint256 rewards, uint256 nftCount) 
    {
        StakingInfo memory info = tokenStakers[staker];
        uint256 pendingRewards = calculateTokenRewards(staker) + info.rewardsEarned;
        return (info.amount, pendingRewards, stakedNFTs[staker].length);
    }

    /**
     * @dev Get staked NFTs by address
     */
    function getStakedNFTs(address staker) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return stakedNFTs[staker];
    }

    /**
     * @dev Update APY rates
     */
    function updateAPY(uint256 _tokenAPY, uint256 _nftAPY) public onlyOwner {
        require(_tokenAPY <= 10000, "Invalid token APY"); // Max 100%
        require(_nftAPY <= 10000, "Invalid NFT APY"); // Max 100%

        tokenAPY = _tokenAPY;
        nftAPY = _nftAPY;

        emit APYUpdated(_tokenAPY, _nftAPY);
    }

    /**
     * @dev Pause staking
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause staking
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        require(stakingToken.transfer(owner(), balance), "Transfer failed");
    }
}