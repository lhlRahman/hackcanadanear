// src/controllers/nftShuffleController.js

import { nearService } from "../services/nearService.js";
import { llmService } from "../services/llmService.js"; // Assumed to exist and call OpenAI
import { ENV } from "../config/environment.js";

// List of wallet accounts we care about.
const walletAccounts = [
  "lebronjames.testnet",
  "lhlrahman.testnet",
  "hackcanada.testnet",
];

/**
 * Shuffles NFTs among the specified wallets based on an LLM negotiation.
 * This function does not take input; it works based on the current state.
 */
export const shuffleNFTsController = async () => {
  try {
    // Step 1: Fetch NFTs for each wallet.
    const walletNFTs = {};
    for (const account of walletAccounts) {
      const tokens = await nearService.getTokensForOwner(account);
      walletNFTs[account] = tokens;
    }
    console.log("Fetched NFT tokens for each wallet:", walletNFTs);

    // Step 2: Create a negotiation prompt that describes the current NFT distribution.
    const negotiationPrompt = `
We have three wallets with the following NFT distribution:
${JSON.stringify(walletNFTs, null, 2)}
Propose a transfer plan to shuffle the NFTs among these wallets. 
Output valid JSON in the following format:
{
  "transfers": [
    {"from": "wallet_account", "to": "wallet_account", "token_id": "token123", "memo": "optional memo"},
    ...
  ]
}
Do not output any text outside of the JSON.
    `;

    // Step 3: Call the LLM to get a transfer plan.
    const llmResponse = await llmService.generateNegotiationResponse({
      proposal: negotiationPrompt,
    });
    console.log("LLM negotiation response:", llmResponse);

    // Step 4: Parse the LLM response (expecting valid JSON).
    let transferPlan;
    try {
      transferPlan = JSON.parse(llmResponse);
    } catch (err) {
      throw new Error("Failed to parse LLM response as JSON.");
    }
    if (!transferPlan.transfers || !Array.isArray(transferPlan.transfers)) {
      throw new Error("Invalid transfer plan structure from LLM.");
    }

    // Step 5: Execute the transfers.
    // IMPORTANT: For simplicity, this example only executes transfers if the "from" account
    // is the same as ENV.NEAR_ACCOUNT_ID (the account our nearService uses).
    for (const transfer of transferPlan.transfers) {
      const { from, to, token_id, memo } = transfer;
      if (from !== ENV.NEAR_ACCOUNT_ID) {
        console.log(`Skipping transfer from ${from} because only transfers from ${ENV.NEAR_ACCOUNT_ID} are supported in this demo.`);
        continue;
      }
      console.log(`Transferring token ${token_id} from ${from} to ${to} with memo "${memo || "Shuffle transfer"}"`);
      const result = await nearService.transferNFT({
        token_id,
        receiver_id: to,
        memo: memo || "Shuffle transfer",
      });
      console.log("Transfer executed. Result:", result);
    }

    return { success: true, transferPlan };
  } catch (error) {
    console.error("Error in shuffleNFTsController:", error);
    return { success: false, error: error.message };
  }
};

// For standalone testing, run the controller:
if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
  shuffleNFTsController().then((res) => console.log("Shuffle result:", res));
}
