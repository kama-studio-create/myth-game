const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameToken Contract", function () {
  let gameToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const GameToken = await ethers.getContractFactory("GameToken");
    gameToken = await GameToken.deploy();
    await gameToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await gameToken.name()).to.equal("Mythic Warriors Token");
      expect(await gameToken.symbol()).to.equal("MYTHIC");
    });

    it("Should mint initial supply to owner", async function () {
      const balance = await gameToken.balanceOf(owner.address);
      expect(balance).to.equal(ethers.parseEther("10000000"));
    });

    it("Should set correct total supply", async function () {
      const totalSupply = await gameToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("10000000"));
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await gameToken.addMinter(owner.address, ethers.parseEther("1000000"));
    });

    it("Should allow authorized minter to mint", async function () {
      await gameToken.mint(addr1.address, ethers.parseEther("1000"));
      const balance = await gameToken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.parseEther("1000"));
    });

    it("Should not allow non-minter to mint", async function () {
      const tx = gameToken.connect(addr1).mint(addr1.address, ethers.parseEther("1000"));
      await expect(tx).to.be.revertedWith("Not authorized to mint");
    });

    it("Should not exceed minting allowance", async function () {
      const tx = gameToken.mint(addr1.address, ethers.parseEther("2000000"));
      await expect(tx).to.be.revertedWith("Exceeds minting allowance");
    });

    it("Should not exceed max supply", async function () {
      await gameToken.addMinter(addr1.address, ethers.parseEther("100000000"));
      const tx = gameToken.connect(addr1).mint(addr1.address, ethers.parseEther("100000000"));
      await expect(tx).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await gameToken.transfer(addr1.address, ethers.parseEther("1000"));
    });

    it("Should burn tokens", async function () {
      await gameToken.connect(addr1).burn(ethers.parseEther("100"));
      const balance = await gameToken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.parseEther("900"));
    });

    it("Should burn tokens from approved address", async function () {
      await gameToken.connect(addr1).approve(addr2.address, ethers.parseEther("500"));
      await gameToken.connect(addr2).burnFrom(addr1.address, ethers.parseEther("200"));
      
      const balance = await gameToken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.parseEther("800"));
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await gameToken.transfer(addr1.address, ethers.parseEther("1000"));
    });

    it("Should transfer tokens", async function () {
      await gameToken.connect(addr1).transfer(addr2.address, ethers.parseEther("100"));
      
      expect(await gameToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("900"));
      expect(await gameToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should not transfer more than balance", async function () {
      const tx = gameToken.connect(addr1).transfer(addr2.address, ethers.parseEther("2000"));
      await expect(tx).to.be.revertedWithCustomError(gameToken, "ERC20InsufficientBalance");
    });
  });

  describe("Approval and AllowanceTransfer", function () {
    beforeEach(async function () {
      await gameToken.transfer(addr1.address, ethers.parseEther("1000"));
    });

    it("Should approve tokens", async function () {
      await gameToken.connect(addr1).approve(addr2.address, ethers.parseEther("500"));
      const allowance = await gameToken.allowance(addr1.address, addr2.address);
      expect(allowance).to.equal(ethers.parseEther("500"));
    });

    it("Should transfer from approved address", async function () {
      await gameToken.connect(addr1).approve(addr2.address, ethers.parseEther("500"));
      await gameToken.connect(addr2).transferFrom(addr1.address, addr2.address, ethers.parseEther("200"));

      expect(await gameToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("800"));
      expect(await gameToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("200"));
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause transfers", async function () {
      await gameToken.pause();
      const tx = gameToken.transfer(addr1.address, ethers.parseEther("100"));
      await expect(tx).to.be.revertedWithCustomError(gameToken, "EnforcedPause");
    });

    it("Should unpause transfers", async function () {
      await gameToken.pause();
      await gameToken.unpause();
      await gameToken.transfer(addr1.address, ethers.parseEther("100"));
      
      expect(await gameToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should only allow owner to pause", async function () {
      const tx = gameToken.connect(addr1).pause();
      await expect(tx).to.be.revertedWithCustomError(gameToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Airdrop", function () {
    it("Should airdrop tokens to multiple addresses", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];

      await gameToken.airdrop(recipients, amounts);

      expect(await gameToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
      expect(await gameToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("200"));
    });

    it("Should not airdrop if arrays length mismatch", async function () {
      const tx = gameToken.airdrop(
        [addr1.address, addr2.address],
        [ethers.parseEther("100")]
      );
      await expect(tx).to.be.revertedWith("Array length mismatch");
    });
  });
});