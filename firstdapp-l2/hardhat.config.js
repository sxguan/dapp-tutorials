require("@nomicfoundation/hardhat-toolbox");
const DEVNET_PRIVKEY= "d600b31c9fa60204e37c2919afce764c0a04921dd4c94d7953ff923ad37acc0f";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    l2: {
      url: `https://goerli-rollup.arbitrum.io/rpc`,
      accounts: [DEVNET_PRIVKEY]
    }
  }
};
