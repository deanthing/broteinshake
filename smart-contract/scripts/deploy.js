const hre = require("hardhat");

async function main() {
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const contract = await hre.ethers.getContractFactory("Moonlander");
  const deployedContract = await contract.deploy();

  await deployedContract.deployed();
  await deployedContract.startWhitelistSale();
  await deployedContract.startPublicSale();
  await deployedContract.setBaseURI("http://localhost:4000/id/");
  await deployedContract.setWhitelist([
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  ]);
  console.log("public and whitelist sale started");

  console.log("contract deployed to:", deployedContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
