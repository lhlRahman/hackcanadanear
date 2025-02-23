import { connect, keyStores, KeyPair } from 'near-api-js';
import { promises as fs } from 'fs';

const nearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
};

const ENV = {
  NEAR_ACCOUNT_ID: "lebronjamesnear.testnet",
  NEAR_SECRET_KEY: "ed25519:2g6YZttDoKzXuG6ra7L6TfRm3RCe2zY3iPYFELXqtW1zMsZATyyFpkNE5nAnHXN8kDyUNR6jfcrBVdXWzewzBUnC",
  NEAR_CONTRACT_ID: "lebronjamesnear.testnet",
};

async function initNear() {
  const keyStore = new keyStores.InMemoryKeyStore();
  await keyStore.setKey(
    nearConfig.networkId,
    ENV.NEAR_ACCOUNT_ID,
    KeyPair.fromString(ENV.NEAR_SECRET_KEY)
  );

  const near = await connect({
    ...nearConfig,
    keyStore,
    headers: {}
  });

  const account = await near.account(ENV.NEAR_ACCOUNT_ID);
  return { near, account };
}

async function initializeContract() {
  try {
    console.log('Starting contract initialization...');
    
    const { account } = await initNear();
    
    // First, deploy the contract
    console.log('Deploying contract...');
    const wasmFile = await fs.readFile('/Users/habibrahman/Code/canadahacks/shade-agent-backend/near-contract/target/wasm32-unknown-unknown/release/near_contract.wasm');
    const response = await account.deployContract(wasmFile);
    console.log('Deploy response:', response);

    // Then initialize it
    console.log('Initializing contract...');
    const result = await account.functionCall({
      contractId: ENV.NEAR_CONTRACT_ID,
      methodName: 'new',
      args: {},
      gas: '300000000000000',
      attachedDeposit: '0'
    });
    
    console.log('Initialization result:', result);
    return result;
  } catch (error) {
    console.error('Error during contract initialization:', error);
    throw error;
  }
}

// Run the initialization
initializeContract()
  .then(result => console.log('Initialization successful:', result))
  .catch(error => console.error('Initialization failed:', error));
