const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MythicWarriorsNFT Contract", function () {
  let nftContract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MythicWarriorsNFT = await ethers.getContractFactory("MythicWarriorsNFT");
    nftContract = await MythicWarriorsNFT.deploy();
    await nftContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await nftContract.name()).to.equal("Mythic Warriors");
      expect(await nftContract.symbol()).to.equal("MYTHIC");
    });

    it("Should set the right owner", async function () {
      expect(await nftContract.owner()).to.equal(owner.address);
    });
  });

  describe("Card Minting", function () {
    it("Should mint a card successfully", async function () {
      const tx = await nftContract.mintCard(
        addr1.address,
        "Fire Drake",
        "Warrior",
        "Legendary",
        100,
        80,
        150,
        "ipfs://QmExample"
      );

      await expect(tx).to.emit(nftContract, "CardMinted");

      const balance = await nftContract.balanceOf(addr1.address);
      expect(balance).to.equal(1);
    });

    it("Should calculate power correctly", async function () {
      await nftContract.mintCard(
        addr1.address,
        "Fire Drake",
        "Warrior",
        "Legendary",
        100,
        80,
        150,
        "ipfs://QmExample"
      );

      const cardData = await nftContract.getCardData(0);
      expect(cardData.power).to.be.greaterThan(0);
      expect(cardData.level).to.equal(1);
    });

    it("Should require sufficient payment", async function () {
      const tx = nftContract.mintCard(
        addr1.address,
        "Fire Drake",
        "Warrior",
        "Legendary",
        100,
        80,
        150,
        "ipfs://QmExample",
        { value: ethers.parseEther("0.05") }
      );

      await expect(tx).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Card Upgrades", function () {
    beforeEach(async function () {
      await nftContract.mintCard(
        addr1.address,
        "Fire Drake",
        "Warrior",
        "Legendary",
        100,
        80,
        150,
        "ipfs://QmExample"
      );
    });

    it("Should upgrade card level and stats", async function () {
      const cardBefore = await nftContract.getCardData(0);
      const powerBefore = cardBefore.power;

      await nftContract.connect(addr1).upgradeCard(0);

      const cardAfter = await nftContract.getCardData(0);
      expect(cardAfter.level).to.equal(2);
      expect(cardAfter.power).to.be.greaterThan(powerBefore);
    });

    it("Should not allow upgrade by non-owner", async function () {
      const tx = nftContract.connect(addr2).upgradeCard(0);
      await expect(tx).to.be.revertedWith("Not card owner");
    });
  });

  describe("Card Locking", function () {
    beforeEach(async function () {
      await nftContract.mintCard(
        addr1.address,
        "Fire Drake",
        "Warrior",
        "Legendary",
        100,
        80,
        150,
        "ipfs://QmExample"
      );
    });

    it("Should lock and unlock cards", async function () {
      await nftContract.connect(addr1).lockCard(0);
      let cardData = await nftContract.getCardData(0);
      expect(cardData.isLocked).to.be.true;

      await nftContract.connect(addr1).unlockCard(0);
      cardData = await nftContract.getCardData(0);
      expect(cardData.isLocked).to.be.false;
    });

    it("Should prevent transfer of locked cards", async function () {
      await nftContract.connect(addr1).lockCard(0);

      const tx = nftContract.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
      await expect(tx).to.be.revertedWith("Card is locked");
    });
  });

  describe("Card Retrieval", function () {
    beforeEach(async function () {
      for (let i = 0; i < 3; i++) {
        await nftContract.mintCard(
          addr1.address,
          `Card ${i}`,
          "Warrior",
          "Rare",
          50,
          40,
          100,
          `ipfs://QmExample${i}`
        );
      }
    });

    it("Should retrieve all cards by owner", async function () {
      const cards = await nftContract.getCardsByOwner(addr1.address);
      expect(cards.length).to.equal(3);
    });

    it("Should retrieve card data", async function () {
      const cardData = await nftContract.getCardData(0);
      expect(cardData.name).to.equal("Card 0");
      expect(cardData.rarity).to.equal("Rare");
    });
  });
});