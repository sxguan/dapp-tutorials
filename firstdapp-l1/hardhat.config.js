require("@nomicfoundation/hardhat-toolbox");
const INFURA_API_KEY = "KEY";
const SEPOLIA_PRIVATE_KEY = "d600b31c9fa60204e37c2919afce764c0a04921dd4c94d7953ff923ad37acc0f";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/34d0d09e0ea34abca11b152194df3259`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
