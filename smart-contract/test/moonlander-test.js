const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Moonlander", function () {
  let deployedContract;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  this.beforeEach(async function () {
    this.MoonlanderFactory = await ethers.getContractFactory("Moonlander");
    this.deployedContract = await this.MoonlanderFactory.deploy();
    await this.deployedContract.deployed();
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  context("premint tests", async function () {
    it("has 0 totalSupply", async function () {
      const supply = await this.deployedContract.totalSupply();
      expect(supply).to.equal(0);
    });
    it("assert whitelist price", async function () {
      const weiPrice = await this.deployedContract.getWhitelistPrice();
      const etherPrice = ethers.utils.formatEther(weiPrice);
      expect(etherPrice).to.equal("0.04");
      // expect(supply).to.equal(0)
    });
    it("assert public sale price", async function () {
      const weiPrice = await this.deployedContract.getPublicSalePrice();
      const etherPrice = ethers.utils.formatEther(weiPrice);
      expect(etherPrice).to.equal("0.05");
    });

    it("set whitelist and assert added", async function () {
      await this.deployedContract.setWhitelist([addr1.getAddress()]);
      const isWhitelistedAssertTrue = await this.deployedContract.isWhitelisted(
        addr1.getAddress()
      );
      expect(isWhitelistedAssertTrue).to.equal(true);
    });

    it("assert user not in whitelist", async function () {
      await this.deployedContract.setWhitelist([addr1.getAddress()]);
      const isWhitelistedAssertFalse =
        await this.deployedContract.isWhitelisted(addr2.getAddress());
      expect(isWhitelistedAssertFalse).to.equal(false);
    });

    it("start whitelist sale when not active", async function () {
      await this.deployedContract.startWhitelistSale();
      // increase time and force mine next block
      await ethers.provider.send("evm_increaseTime", [10]);
      await ethers.provider.send("evm_mine", []);
      const contractStarted =
        await this.deployedContract.isWhitelistSaleActive();
      expect(contractStarted).to.equal(true);
    });

    it("start whitelist sale when already active", async function () {
      await this.deployedContract.startWhitelistSale();
      await ethers.provider.send("evm_increaseTime", [10]);
      await ethers.provider.send("evm_mine", []);
      await expect(this.deployedContract.startWhitelistSale()).to.be.reverted;
    });

    it("start public sale when not active", async function () {
      await this.deployedContract.startPublicSale();
      // increase time and force mine next block
      await ethers.provider.send("evm_increaseTime", [10]);
      await ethers.provider.send("evm_mine", []);
      const contractStarted = await this.deployedContract.isPublicSaleActive();
      expect(contractStarted).to.equal(true);
    });

    it("end sale", async function () {
      // start sales
      await this.deployedContract.startWhitelistSale();
      await this.deployedContract.startPublicSale();
      // increase time and force mine next block
      await ethers.provider.send("evm_increaseTime", [10]);
      await ethers.provider.send("evm_mine", []);
      const whitelistSaleStarted =
        await this.deployedContract.isWhitelistSaleActive();
      const publicSaleStarted =
        await this.deployedContract.isPublicSaleActive();
      expect(whitelistSaleStarted).to.equal(true);
      expect(publicSaleStarted).to.equal(true);

      // end sales
      await this.deployedContract.pauseSale();
      const whitelistActive =
        await this.deployedContract.isWhitelistSaleActive();
      const publicSaleActive = await this.deployedContract.isPublicSaleActive();

      expect(whitelistActive).to.equal(false);
      expect(publicSaleActive).to.equal(false);
    });
  });

  context("mint tests", async function () {
    it("mint whitelist", async function () {
      await this.deployedContract.startWhitelistSale();
      await this.deployedContract.setWhitelist([addr1.getAddress()]);
      const options = { value: ethers.utils.parseEther("0.04") };
      await this.deployedContract.connect(addr1).whitelistMint(options);
      expect(
        await this.deployedContract.balanceOf(addr1.getAddress())
      ).to.equal(1);
      expect(await this.deployedContract.totalSupply()).to.equal(1);
    });

    it("mint public sale", async function () {
      await this.deployedContract.startPublicSale();
      const options = { value: ethers.utils.parseEther("0.1") };
      await this.deployedContract.connect(addr1).publicSaleMint(2, options);
      expect(
        await this.deployedContract.balanceOf(addr1.getAddress())
      ).to.equal(2);
      expect(await this.deployedContract.totalSupply()).to.equal(2);
    });

    it("mint not on whitelist", async function () {
      await this.deployedContract.startWhitelistSale();
      const options = { value: ethers.utils.parseEther("0.4") };
      await expect(
        this.deployedContract.connect(addr1).whitelistMint(options)
      ).to.be.reverted;
      expect(
        await this.deployedContract.balanceOf(addr1.getAddress())
      ).to.equal(0);
      expect(await this.deployedContract.totalSupply()).to.equal(0);
    });

    it("mint whitelist not active", async function () {
      const options = { value: ethers.utils.parseEther("0.4") };
      await expect(
        this.deployedContract.connect(addr1).whitelistMint(options)
      ).to.be.reverted;
      expect(
        await this.deployedContract.balanceOf(addr1.getAddress())
      ).to.equal(0);
      expect(await this.deployedContract.totalSupply()).to.equal(0);
    });

    it("mint whitelist more than 1", async function () {
      await this.deployedContract.startWhitelistSale();
      await this.deployedContract.setWhitelist([addr1.getAddress()]);
      const options = { value: ethers.utils.parseEther("0.04") };
      await this.deployedContract.connect(addr1).whitelistMint(options);
      await expect(
        this.deployedContract.connect(addr1).whitelistMint(options)
      ).to.be.reverted;
      expect(
        await this.deployedContract.balanceOf(addr1.getAddress())
      ).to.equal(1);
      expect(await this.deployedContract.totalSupply()).to.equal(1);
    });

    it("mint public sale not active", async function () {
      const options = { value: ethers.utils.parseEther("0.5") };
      await expect(
        this.deployedContract.connect(addr1).publicSaleMint(1, options)
      ).to.be.reverted;
      expect(
        await this.deployedContract.balanceOf(addr1.getAddress())
      ).to.equal(0);
      expect(await this.deployedContract.totalSupply()).to.equal(0);
    });

    it("mint when supply exceeded", async function () {
      await this.deployedContract.startPublicSale();
      await this.deployedContract.setMaxSupply(2);
      const options = { value: ethers.utils.parseEther("0.1") };
      this.deployedContract.connect(addr1).publicSaleMint(2, options);
      await expect(
        this.deployedContract.connect(addr1).publicSaleMint(1, options)
      ).to.be.reverted;
      expect(
        await this.deployedContract.balanceOf(addr1.getAddress())
      ).to.equal(2);
      expect(await this.deployedContract.totalSupply()).to.equal(2);
    });

    it("mint more than 5 at once", async function () {
      await this.deployedContract.startPublicSale();
      const options = { value: ethers.utils.parseEther("0.3") };
      await expect(
        this.deployedContract.connect(addr1).publicSaleMint(6, options)
      ).to.be.reverted;
      expect(
        await this.deployedContract.balanceOf(addr1.getAddress())
      ).to.equal(0);
      expect(await this.deployedContract.totalSupply()).to.equal(0);
    });

    it("mint after sale ended", async function () {
      await this.deployedContract.startPublicSale();
      await ethers.provider.send("evm_increaseTime", [10]);
      await ethers.provider.send("evm_mine", []);
      await this.deployedContract.pauseSale();
      await ethers.provider.send("evm_increaseTime", [10]);
      await ethers.provider.send("evm_mine", []);
      const options = { value: ethers.utils.parseEther("0.05") };
      await expect(
        this.deployedContract.connect(addr1).publicSaleMint(1, options)
      ).to.be.reverted;
    });

    // test this in live environment
    it("owner extract balance", async function () {
      await this.deployedContract.startPublicSale();
      const options = { value: ethers.utils.parseEther("0.15") };
      await this.deployedContract.connect(addr1).publicSaleMint(3, options);
      await this.deployedContract.balanceOf(addr1.getAddress());
      const balanceBefore = await ethers.provider.getBalance(
        owner.getAddress()
      );
      const tx = await this.deployedContract.withdraw();
      const receipt = await tx.wait();
      console.log(
        "total ether spent on gas for transaction: \t",
        ethers.utils.formatEther(
          receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
        )
      );
      const balanceAfter = await ethers.provider.getBalance(owner.getAddress());
      const profit = ethers.utils.formatEther(
        String(balanceAfter - balanceBefore)
      );
      console.log("profit: ", profit);
      // await expect(contract.getBalance(owner.getAddress()));
    });
    // mint after sale ends
  });

  // mint tests (rever test in chai)
  //  buy when not active
  //  buy when not whitelisted
  //  buy whitelisted after already purchasing
  //  buy when no supply left
  //  buy with insuffieincet funds or too much funds
  // withdraw funds

  // it("Should return the new greeting once it's changed", async function () {
  //   const Greeter = await ethers.getContractFactory('Greeter')
  //   const greeter = await Greeter.deploy('Hello, world!')
  //   await greeter.deployed()

  //   expect(await greeter.greet()).to.equal('Hello, world!')

  //   const setGreetingTx = await greeter.setGreeting('Hola, mundo!')

  //   // wait until the transaction is mined
  //   await setGreetingTx.wait()

  //   expect(await greeter.greet()).to.equal('Hola, mundo!')
  // })
});
