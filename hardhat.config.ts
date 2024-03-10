import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv'; 
dotenv.config();  // Load environment variables from .env file 

const mainnetProviderUrl = process.env.MAINNET_PROVIDER_URL;
const mainnetBloxrouteUrl = process.env.MAINNET_BLOXROUTE_URL;
const goerliProviderUrl = process.env.GOERLI__PROVIDER_URL;
const developmentMnemonic = process.env.DEV_ETH_MNEMONIC;
const developmentPKey = process.env.DEV_ETH_PKEY;

if (!mainnetProviderUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `MAINNET_PROVIDER_URL`\n');
  process.exit(1);
}

if (!mainnetBloxrouteUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `MAINNET_BLOXROUTE_URL`\n');
  process.exit(1);
}

if (!goerliProviderUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `GOERLI__PROVIDER_URL`\n');
  process.exit(1);
}

if (!developmentMnemonic) {
  console.error('Missing development Ethereum account mnemonic as environment variable `DEV_ETH_MNEMONIC`\n');
  process.exit(1);
}

if (!developmentPKey) {
  console.error('Missing development Ethereum account PKey as environment variable `DEV_ETH_PKEY`\n');
  process.exit(1);
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",

  networks: {
     hardhat: {
       forking: {
        enabled: true,
        url: mainnetProviderUrl,
        blockNumber: 19355965, 
       },           
       gasPrice: 0,
       initialBaseFeePerGas: 0,
       loggingEnabled: false,
       allowUnlimitedContractSize: true,
       accounts: {
         mnemonic: developmentMnemonic,
       },
       chainId: 1, // metamask -> accounts -> settings -> networks -> localhost 8545 -> set chainId to 1
     },

     mainnet: {
//        url: mainnetProviderUrl, // or any other JSON-RPC provider
        url: mainnetBloxrouteUrl, // or any other JSON-RPC provider
        accounts: [developmentPKey] //h4
     }
  },

  solidity: {
       compilers: [     
        { version: "0.8.13" },
      ],

      settings: {
       optimizer: {
        enabled: true,
        runs: 2000
       }
      }
  }


};

export default config;
