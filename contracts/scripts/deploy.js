const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting contract deployment...");

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy GameToken (ERC20)
  console.log("\n📦 Deploying GameToken...");
  const GameToken = await hre.ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.waitForDeployment();
  const gameTokenAddress = await gameToken.getAddress();
  console.log(`✅ GameToken deployed to: ${gameTokenAddress}`);

  // Deploy MythicWarriorsNFT
  console.log("\n🎴 Deploying MythicWarriorsNFT...");
  const MythicWarriorsNFT = await hre.ethers.getContractFactory("MythicWarriorsNFT");
  const nftContract = await MythicWarriorsNFT.deploy();
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log(`✅ MythicWarriorsNFT deployed to: ${nftAddress}`);

  // Deploy GameStaking
  console.log("\n💎 Deploying GameStaking...");
  const GameStaking = await hre.ethers.getContractFactory("GameStaking");
  const stakingContract = await GameStaking.deploy(gameTokenAddress, nftAddress);
  await stakingContract.waitForDeployment();
  const stakingAddress = await stakingContract.getAddress();
  console.log(`✅ GameStaking deployed to: ${stakingAddress}`);

  // Deploy BattleRewards
  console.log("\n⚔️  Deploying BattleRewards...");
  const BattleRewards = await hre.ethers.getContractFactory("BattleRewards");
  const battleRewards = await BattleRewards.deploy(gameTokenAddress);
  await battleRewards.waitForDeployment();
  const battleRewardsAddress = await battleRewards.getAddress();
  console.log(`✅ BattleRewards deployed to: ${battleRewardsAddress}`);

  // Setup roles and permissions
  console.log("\n🔐 Setting up permissions...");

  // Add staking contract as minter to game token
  const MINTER_ROLE = await gameToken.MINTER_ROLE?.();
  if (MINTER_ROLE === undefined) {
    // If no MINTER_ROLE, add staking as minter manually
    await gameToken.addMinter(stakingAddress, ethers.parseEther("1000000"));
    console.log(`✅ Added GameStaking as minter`);
  }

  // Add battle rewards as minter
  await gameToken.addMinter(battleRewardsAddress, ethers.parseEther("5000000"));
  console.log(`✅ Added BattleRewards as minter`);

  // Grant battle manager role to deployer temporarily (for testing)
  const BATTLE_MANAGER_ROLE = await battleRewards.BATTLE_MANAGER_ROLE();
  await battleRewards.grantRole(BATTLE_MANAGER_ROLE, deployer.address);
  console.log(`✅ Granted battle manager role to deployer`);

  // Save deployment addresses
  const deploymentData = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      gameToken: gameTokenAddress,
      mythicWarriorsNFT: nftAddress,
      gameStaking: stakingAddress,
      battleRewards: battleRewardsAddress,
    },
  };

  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const filename = path.join(
    deploymentPath,
    `${hre.network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
  console.log(`\n📄 Deployment data saved to: ${filename}`);

  // Print summary
  console.log("\n🎉 Deployment Summary:");
  console.log("================================");
  console.log(`Network: ${hre.network.name}`);
  console.log(`GameToken: ${gameTokenAddress}`);
  console.log(`MythicWarriorsNFT: ${nftAddress}`);
  console.log(`GameStaking: ${stakingAddress}`);
  console.log(`BattleRewards: ${battleRewardsAddress}`);
  console.log("================================\n");

  return deploymentData;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });