const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.getContractFactory("Moonlander");

  const deployedContract = await contract.attach(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  await deployedContract.setWhitelist([
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  ]);
  console.log("whitelist set");
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
