
const hre = require("hardhat");

async function main() {

  const [owner] = await hre.ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    owner.address
  );

  const SwitchFactory = await hre.ethers.getContractFactory("SwitchFactory");
  const switchfactory = await SwitchFactory.deploy();

  await switchfactory.deployed();
  console.log("Factory deployed to:", switchfactory.address);

  //const tx = await switchfactory.newSwitch([owner.address], [100], 10, 1000, { value: 110 });
  //await tx.wait();

  //console.log("Factory deployed to:", switchfactory.address);
  //console.log(await switchfactory.getSwitch(1));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
