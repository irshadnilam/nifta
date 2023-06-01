import "@nomicfoundation/hardhat-toolbox";
import { config as envConfig } from 'dotenv';

envConfig();

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!deployerPrivateKey) {
  throw new Error(
    "Please set a DEPLOYER_PRIVATE_KEY in a .env file"
  );
}


const config = {
  mocha: {
    enableTimeouts: false,
    before_timeout: 480000
  },
  
  defaultNetwork: "theta_privatenet",
  networks: {
    theta_privatenet: {
      url: "http://localhost:18888/rpc",
      accounts: [
        deployerPrivateKey
      ],
      chainId: 366,
      gasPrice: 4000000000000
    },
    theta_testnet: {
      url: `https://eth-rpc-api-testnet.thetatoken.org/rpc`,
      accounts: [deployerPrivateKey],
      chainId: 365,
      gasPrice: 4000000000000
    },
    theta_mainnet: {
      url: `https://eth-rpc-api.thetatoken.org/rpc`,
      accounts: [deployerPrivateKey],
      chainId: 361,
      gasPrice: 4000000000000
    },
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        // https://docs.soliditylang.org/en/v0.7.6/metadata.html
        bytecodeHash: 'none',
      },
    },
  },
};

export default config;
