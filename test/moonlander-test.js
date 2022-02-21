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

  context('with no minted tokens', async function () {
    it('has 0 totalSupply', async function () {
      const supply = await this.deployedContract.totalSupply()
      expect(supply).to.equal(0)
    })

    it('assert whitelist price', async function () {
      const weiPrice = await this.deployedContract.getWhitelistPrice()
      const etherPrice = ethers.utils.formatEther(weiPrice)
      expect(etherPrice).to.equal('0.04')
      // expect(supply).to.equal(0)
    })
    it('assert public sale price', async function () {
      const weiPrice = await this.deployedContract.getPublicSalePrice()
      const etherPrice = ethers.utils.formatEther(weiPrice)
      expect(etherPrice).to.equal('0.05')
    })

    it('set whitelist', async function () {
      await this.deployedContract.setWhitelist([
        addr1.getAddress(),
        addr2.getAddress(),
      ])

      const isWhitelisted = this.deployedContract.isWhitelisted(
        addr1.getAddress(),
      )
      expect(isWhitelisted).to.equal(true)
    })

    // it('has 0 totalSupply', async function () {
    //   const supply = await this.erc721a.totalSupply()
    //   expect(supply).to.equal(0)
    // })
  })

  // when no minted, supply is 0
  // price checks for whiteList and regularSale
  // add to whitelist and check if added
  // start whitelist sale, make sure active
  // start publicsale, make sure active
  // end both sales, make sure inactive
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
