// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title BattleRewards
 * @dev Manages battle rewards distribution for the Mythic Warriors game
 */
contract BattleRewards is AccessControl, ReentrancyGuard {
    using SafeMath for uint256;

    IERC20 public rewardToken;

    bytes32 public constant BATTLE_MANAGER_ROLE = keccak256("BATTLE_MANAGER");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE");

    // Reward structures
    struct BattleReward {
        uint256 winnerTokens;
        uint256 winnerGold;
        uint256 loserTokens;
        uint256 loserGold;
        uint256 ratingChange;
        uint256 timestamp;
    }

    struct PlayerStats {
        uint256 totalBattles;
        uint256 wins;
        uint256 losses;
        uint256 totalTokensEarned;
        uint256 totalGoldEarned;
        uint256 rating;
    }

    struct RewardPool {
        uint256 available;
        uint256 distributed;
        uint256 locked;
    }

    // Battle types
    enum BattleType { QUICK, RANKED, TOURNAMENT, CLAN, PRACTICE }

    // Mappings
    mapping(address => PlayerStats) public playerStats;
    mapping(bytes32 => BattleReward) public battleRewards;
    mapping(address => uint256) public pendingRewards;
    mapping(BattleType => RewardPool) public rewardPools;
    mapping(BattleType => BattleReward) public battleTypeRewards;

    // Constants
    uint256 public constant INITIAL_RATING = 1000;
    uint256 public constant MAX_RATING = 10000;

    // State variables
    uint256 public totalRewardsDistributed;
    uint256 public totalRewardsClaimed;
    uint256 public seasonEndTime;
    bool public paused;

    // Events
    event BattleCompleted(
        bytes32 indexed battleId,
        address indexed winner,
        address indexed loser,
        uint256 winnerReward,
        uint256 loserReward
    );

    event RewardsClaimed(address indexed player, uint256 amount);
    event PlayerStatsUpdated(address indexed player, uint256 newRating, uint256 wins);
    event RewardPoolUpdated(BattleType battleType, uint256 available);
    event SeasonEnded(uint256 seasonRewards);

    // Modifiers
    modifier onlyBattleManager() {
        require(hasRole(BATTLE_MANAGER_ROLE, msg.sender), "Not battle manager");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor(address _rewardToken) {
        rewardToken = IERC20(_rewardToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        seasonEndTime = block.timestamp + 90 days;
        
        // Initialize reward pools
        initializeRewardPools();
    }

    /**
     * @dev Initialize reward pools for each battle type
     */
    function initializeRewardPools() internal {
        battleTypeRewards[BattleType.QUICK] = BattleReward({
            winnerTokens: 50,
            winnerGold: 150,
            loserTokens: 10,
            loserGold: 50,
            ratingChange: 15,
            timestamp: block.timestamp
        });

        battleTypeRewards[BattleType.RANKED] = BattleReward({
            winnerTokens: 100,
            winnerGold: 300,
            loserTokens: 20,
            loserGold: 100,
            ratingChange: 25,
            timestamp: block.timestamp
        });

        battleTypeRewards[BattleType.TOURNAMENT] = BattleReward({
            winnerTokens: 150,
            winnerGold: 500,
            loserTokens: 50,
            loserGold: 200,
            ratingChange: 50,
            timestamp: block.timestamp
        });

        battleTypeRewards[BattleType.CLAN] = BattleReward({
            winnerTokens: 75,
            winnerGold: 200,
            loserTokens: 25,
            loserGold: 75,
            ratingChange: 20,
            timestamp: block.timestamp
        });

        battleTypeRewards[BattleType.PRACTICE] = BattleReward({
            winnerTokens: 20,
            winnerGold: 50,
            loserTokens: 10,
            loserGold: 25,
            ratingChange: 0,
            timestamp: block.timestamp
        });
    }

    /**
     * @dev Record battle completion and distribute rewards
     */
    function recordBattleCompletion(
        bytes32 battleId,
        address winner,
        address loser,
        uint8 battleTypeIdx,
        uint256 ratingDifference
    ) public onlyBattleManager whenNotPaused nonReentrant {
        require(winner != address(0), "Invalid winner");
        require(loser != address(0), "Invalid loser");

        BattleType battleType = BattleType(battleTypeIdx);
        BattleReward memory reward = battleTypeRewards[battleType];

        // Adjust rewards based on rating difference
        uint256 winnerReward = adjustReward(reward.winnerTokens, ratingDifference, true);
        uint256 loserReward = reward.loserTokens;

        // Update player stats
        PlayerStats storage winnerStats = playerStats[winner];
        PlayerStats storage loserStats = playerStats[loser];

        winnerStats.totalBattles += 1;
        winnerStats.wins += 1;
        winnerStats.totalTokensEarned += winnerReward;
        winnerStats.totalGoldEarned += reward.winnerGold;
        winnerStats.rating = calculateNewRating(
            winnerStats.rating,
            reward.ratingChange,
            true
        );

        loserStats.totalBattles += 1;
        loserStats.losses += 1;
        loserStats.totalTokensEarned += loserReward;
        loserStats.totalGoldEarned += reward.loserGold;
        loserStats.rating = calculateNewRating(
            loserStats.rating,
            reward.ratingChange,
            false
        );

        // Add to pending rewards
        pendingRewards[winner] += winnerReward;
        pendingRewards[loser] += loserReward;

        // Store battle reward
        battleRewards[battleId] = BattleReward({
            winnerTokens: winnerReward,
            winnerGold: reward.winnerGold,
            loserTokens: loserReward,
            loserGold: reward.loserGold,
            ratingChange: reward.ratingChange,
            timestamp: block.timestamp
        });

        totalRewardsDistributed += winnerReward + loserReward;

        emit BattleCompleted(battleId, winner, loser, winnerReward, loserReward);
        emit PlayerStatsUpdated(winner, winnerStats.rating, winnerStats.wins);
        emit PlayerStatsUpdated(loser, loserStats.rating, loserStats.losses);
    }

    /**
     * @dev Claim pending rewards
     */
    function claimRewards() public nonReentrant {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");

        pendingRewards[msg.sender] = 0;
        totalRewardsClaimed += amount;

        require(rewardToken.transfer(msg.sender, amount), "Transfer failed");

        emit RewardsClaimed(msg.sender, amount);
    }

    /**
     * @dev Adjust reward based on rating difference
     */
    function adjustReward(
        uint256 baseReward,
        uint256 ratingDiff,
        bool isWinner
    ) internal pure returns (uint256) {
        if (!isWinner) {
            return baseReward;
        }

        if (ratingDiff > 200) {
            // Easy win - reduced reward
            return (baseReward * 50) / 100;
        } else if (ratingDiff < -200) {
            // Upset - increased reward
            return (baseReward * 150) / 100;
        }

        return baseReward;
    }

    /**
     * @dev Calculate new rating after battle
     */
    function calculateNewRating(
        uint256 currentRating,
        uint256 ratingChange,
        bool isWin
    ) internal pure returns (uint256) {
        if (isWin) {
            uint256 newRating = currentRating + ratingChange;
            return newRating > MAX_RATING ? MAX_RATING : newRating;
        } else {
            if (currentRating < ratingChange) {
                return 0;
            }
            return currentRating - ratingChange;
        }
    }

    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) 
        public 
        view 
        returns (PlayerStats memory) 
    {
        return playerStats[player];
    }

    /**
     * @dev Get player win rate
     */
    function getWinRate(address player) 
        public 
        view 
        returns (uint256) 
    {
        PlayerStats memory stats = playerStats[player];
        if (stats.totalBattles == 0) {
            return 0;
        }
        return (stats.wins * 10000) / stats.totalBattles; // In basis points
    }

    /**
     * @dev Get pending rewards for player
     */
    function getPendingRewards(address player) 
        public 
        view 
        returns (uint256) 
    {
        return pendingRewards[player];
    }

    /**
     * @dev Update battle type rewards
     */
    function updateBattleRewards(
        uint8 battleTypeIdx,
        uint256 winnerTokens,
        uint256 winnerGold,
        uint256 loserTokens,
        uint256 loserGold,
        uint256 ratingChange
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        BattleType battleType = BattleType(battleTypeIdx);
        battleTypeRewards[battleType] = BattleReward({
            winnerTokens: winnerTokens,
            winnerGold: winnerGold,
            loserTokens: loserTokens,
            loserGold: loserGold,
            ratingChange: ratingChange,
            timestamp: block.timestamp
        });
    }

    /**
     * @dev Deposit tokens to reward pool
     */
    function depositToRewardPool(uint8 battleTypeIdx, uint256 amount) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(
            rewardToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        BattleType battleType = BattleType(battleTypeIdx);
        rewardPools[battleType].available += amount;

        emit RewardPoolUpdated(battleType, rewardPools[battleType].available);
    }

    /**
     * @dev End season and reset rewards
     */
    function endSeason() public onlyRole(DEFAULT_ADMIN_ROLE) {
        emit SeasonEnded(totalRewardsDistributed);
        totalRewardsDistributed = 0;
        seasonEndTime = block.timestamp + 90 days;
    }

    /**
     * @dev Pause/Unpause contract
     */
    function togglePause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = !paused;
    }

    /**
     * @dev Grant battle manager role
     */
    function grantBattleManagerRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        grantRole(BATTLE_MANAGER_ROLE, account);
    }

    /**
     * @dev Revoke battle manager role
     */
    function revokeBattleManagerRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        revokeRole(BATTLE_MANAGER_ROLE, account);
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw() public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = rewardToken.balanceOf(address(this));
        require(rewardToken.transfer(msg.sender, balance), "Transfer failed");
    }
}