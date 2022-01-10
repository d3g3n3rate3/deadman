require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.11",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    ropsten: {
      url: "https://ropsten.infura.io/v3/ebfbe7cb810746e1a844a3e141ec2912",
      accounts: [`0x${process.env.ROPSTEN_KEY}`]
    },
    arbitrum: {
      url: 'https://rinkeby.arbitrum.io/rpc',
      accounts: [`0x${process.env.ARBITRUM_KEY}`]
    },
  }
};
