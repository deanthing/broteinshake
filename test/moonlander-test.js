const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Moonlander', function () {
  let deployedContract
  let owner
  let addr1
  let addr2
  let addr3

  this.beforeEach(async function () {
    this.MoonlanderFactory = await ethers.getContractFactory('Moonlander')
    this.deployedContract = await this.MoonlanderFactory.deploy()
    await this.deployedContract.deployed()
    ;[owner, addr1, addr2, addr3] = await ethers.getSigners()
  })

  // context('premint tests', async function () {
  //   it('has 0 totalSupply', async function () {
  //     const supply = await this.deployedContract.totalSupply()
  //     expect(supply).to.equal(0)
  //   })

  //   it('assert whitelist price', async function () {
  //     const weiPrice = await this.deployedContract.getWhitelistPrice()
  //     const etherPrice = ethers.utils.formatEther(weiPrice)
  //     expect(etherPrice).to.equal('0.04')
  //     // expect(supply).to.equal(0)
  //   })
  //   it('assert public sale price', async function () {
  //     const weiPrice = await this.deployedContract.getPublicSalePrice()
  //     const etherPrice = ethers.utils.formatEther(weiPrice)
  //     expect(etherPrice).to.equal('0.05')
  //   })

  //   it('set whitelist and assert added', async function () {
  //     await this.deployedContract.setWhitelist([addr1.getAddress()])
  //     const isWhitelistedAssertTrue = await this.deployedContract.isWhitelisted(
  //       addr1.getAddress(),
  //     )
  //     expect(isWhitelistedAssertTrue).to.equal(true)
  //   })

  //   it('assert user not in whitelist', async function () {
  //     await this.deployedContract.setWhitelist([addr1.getAddress()])
  //     const isWhitelistedAssertFalse = await this.deployedContract.isWhitelisted(
  //       addr2.getAddress(),
  //     )
  //     expect(isWhitelistedAssertFalse).to.equal(false)
  //   })

  //   it('start whitelist sale when not active', async function () {
  //     await this.deployedContract.startWhiteListSale()
  //     // increase time and force mine next block
  //     await ethers.provider.send('evm_increaseTime', [10])
  //     await ethers.provider.send('evm_mine', [])
  //     const contractStarted = await this.deployedContract.isWhitelistSaleActive()
  //     expect(contractStarted).to.equal(true)
  //   })

  //   it('start whitelist sale when already active', async function () {
  //     await this.deployedContract.startWhiteListSale()
  //     await ethers.provider.send('evm_increaseTime', [10])
  //     await ethers.provider.send('evm_mine', [])
  //     await expect(this.deployedContract.startWhiteListSale()).to.be.reverted
  //   })

  //   it('start public sale when not active', async function () {
  //     await this.deployedContract.startPublicSale()
  //     // increase time and force mine next block
  //     await ethers.provider.send('evm_increaseTime', [10])
  //     await ethers.provider.send('evm_mine', [])
  //     const contractStarted = await this.deployedContract.isPublicSaleActive()
  //     expect(contractStarted).to.equal(true)
  //   })

  //   it('end sale', async function () {
  //     // start sales
  //     await this.deployedContract.startWhiteListSale()
  //     await this.deployedContract.startPublicSale()
  //     // increase time and force mine next block
  //     await ethers.provider.send('evm_increaseTime', [10])
  //     await ethers.provider.send('evm_mine', [])
  //     const whiteListSaleStarted = await this.deployedContract.isWhitelistSaleActive()
  //     const publicSaleStarted = await this.deployedContract.isPublicSaleActive()
  //     expect(whiteListSaleStarted).to.equal(true)
  //     expect(publicSaleStarted).to.equal(true)

  //     // end sales
  //     await this.deployedContract.pauseSale()
  //     const whiteListActive = await this.deployedContract.isWhitelistSaleActive()
  //     const publicSaleActive = await this.deployedContract.isPublicSaleActive()

  //     expect(whiteListActive).to.equal(false)
  //     expect(publicSaleActive).to.equal(false)
  //   })
  // })

  context('mint tests', async function () {
    it('mint whitelist', async function () {
      await this.deployedContract.startWhiteListSale()
    })
  })

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
})
