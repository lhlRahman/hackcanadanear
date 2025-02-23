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
 * Helper function to extract a JSON block from a given text.
 * It finds the first '{' and the last '}' and returns that substring.
 * Throws an error if no valid JSON block is found.
 *
 * @param {string} text - The text containing JSON.
 * @returns {string} - The extracted JSON string.
 */
function extractJSON(text) {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON block found in LLM response.");
  }
  return text.substring(firstBrace, lastBrace + 1);
}

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
      const jsonText = extractJSON(llmResponse);
      transferPlan = JSON.parse(jsonText);
    } catch (err) {
      throw new Error("Failed to parse LLM response as JSON.");
    }
    if (!transferPlan.transfers || !Array.isArray(transferPlan.transfers)) {
      throw new Error("Invalid transfer plan structure from LLM.");
    }

    // Step 5: Execute the transfers.
    // IMPORTANT: For this demo, only transfers from ENV.NEAR_ACCOUNT_ID (the default account)
    // will be executed.
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
        from: from
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
