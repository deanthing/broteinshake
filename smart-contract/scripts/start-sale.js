const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.getContractFactory("Moonlander");

  const deployedContract = await contract.attach(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );

  await deployedContract.startWhitelistSale();
  await deployedContract.startPublicSale();
  await deployedContract.setBaseURI("http://localhost:4000/id/");
  console.log("public and whitelist sale started");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
