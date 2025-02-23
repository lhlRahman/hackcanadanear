export const nearConfig = {
  networkId: process.env.NEAR_NETWORK_ID || 'testnet',
  nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
  walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.testnet.near.org',
  helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
  explorerUrl: process.env.NEAR_EXPLORER_URL || 'https://explorer.testnet.near.org',
};
