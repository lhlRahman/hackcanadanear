// src/services/nearService.js
import { connect, keyStores, KeyPair } from 'near-api-js';
import { nearConfig } from '../config/nearConfig.js';
import { ENV } from '../config/environment.js';

// Create an in-memory keystore instance.
const keyStore = new keyStores.InMemoryKeyStore();

// Initialize the NEAR connection and account.
async function initNear() {
  await keyStore.setKey(
    nearConfig.networkId,
    ENV.NEAR_ACCOUNT_ID,
    KeyPair.fromString(ENV.NEAR_SECRET_KEY)
  );

  const config = {
    ...nearConfig,
    keyStore,
  };

  const near = await connect(config);
  const account = await near.account(ENV.NEAR_ACCOUNT_ID);
  return { near, account };
}

const nearInitPromise = initNear();

async function getAccount() {
  const { account } = await nearInitPromise;
  return account;
}

export const nearService = {
  /**
   * Mint a new Plant NFT.
   * Expects an object with:
   * - token_id: Unique identifier for the NFT.
   * - receiver_id: Account ID that will own the NFT.
   * - plant_metadata: An object with:
   *      - glb_file_url: URL to the GLB file.
   *      - parameters: An object with keys color_vibrancy, leaf_area_index, wilting, spotting, symmetry.
   *      - name: Name of the NFT.
   *      - wallet_id: Wallet identifier.
   *      - price: Price string in yoctoNEAR.
   */
  mintPlantNFT: async ({
    token_id,
    receiver_id,
    plant_metadata: { glb_file_url, parameters, name, wallet_id, price }
  }) => {
    const account = await getAccount();
    // 0.01 NEAR in yoctoNEAR (10^22 yoctoNEAR)
    const deposit = "10000000000000000000000"; 
    const result = await account.functionCall({
      contractId: ENV.NEAR_CONTRACT_ID,
      methodName: 'nft_mint',  // <-- Updated method name
      args: {
        token_id,
        receiver_id,
        plant_metadata: {
          glb_file_url,
          parameters: {
            color_vibrancy: parameters.color_vibrancy,
            leaf_area_index: parameters.leaf_area_index,
            wilting: parameters.wilting,
            spotting: parameters.spotting,
            symmetry: parameters.symmetry
          },
          name,
          wallet_id,
          price
        }
      },
      gas: '300000000000000', // 300 TGas
      attachedDeposit: deposit
    });
    return result;
  },

  /**
   * Retrieve metadata for a given NFT (plant).
   */
  getPlantMetadata: async (token_id) => {
    const account = await getAccount();
    const result = await account.viewFunction({
      contractId: ENV.NEAR_CONTRACT_ID,
      methodName: 'get_plant_metadata',
      args: { token_id }
    });
    return result;
  },

  /**
   * Transfer an NFT from the current owner to another account.
   * This uses the standard NEP-171 nft_transfer method.
   */
  transferNFT: async ({ receiver_id, token_id, memo = null }) => {
    const account = await getAccount();
    const result = await account.functionCall({
      contractId: ENV.NEAR_CONTRACT_ID,
      methodName: 'nft_transfer',
      args: {
        receiver_id,
        token_id,
        memo
      },
      gas: '300000000000000',
      attachedDeposit: '1' // 1 yoctoNEAR required by NEP-171
    });
    return result;
  },

  /**
   * Get details for a specific NFT token.
   */
  getNFTToken: async (token_id) => {
    const account = await getAccount();
    const result = await account.viewFunction({
      contractId: ENV.NEAR_CONTRACT_ID,
      methodName: 'nft_token',
      args: { token_id }
    });
    return result;
  },

  /**
   * Get all NFTs owned by a specific account.
   */
  getTokensForOwner: async (account_id) => {
    const account = await getAccount();
    const result = await account.viewFunction({
      contractId: ENV.NEAR_CONTRACT_ID,
      methodName: 'nft_tokens_for_owner',
      args: { 
        account_id,
        from_index: '0',
        limit: 100
      }
    });
    return result;
  }
};
