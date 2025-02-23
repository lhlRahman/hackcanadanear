// src/services/llmService.js
import { OpenAI } from 'openai';
import { ENV } from '../config/environment.js';

/**
 * generateNegotiationResponse
 * This function sends a negotiation prompt to OpenAI's GPT-4 model and returns the response as a JSON string.
 * The negotiation prompt should describe the current NFT distribution and ask for a transfer plan. You must include atleast one from hackcanada.testnet
 *
 * Expected JSON response format from the LLM:
 * {
 *   "transfers": [
 *     {
 *       "from": "wallet_account",
 *       "to": "wallet_account",
 *       "token_id": "token123",
 *       "memo": "optional memo"
 *     },
 *     ...
 *   ]
 * }
 *
 * @param {Object} params - The input parameters.
 * @param {string} params.proposal - The negotiation prompt text.
 * @returns {Promise<string>} - The JSON string response from the LLM.
 */
export const llmService = {
  generateNegotiationResponse: async ({ proposal }) => {
    const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
    
    // Create a conversation where the system instructs the model to only output valid JSON.
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an autonomous NFT negotiation agent. " +
            "You are given the current distribution of NFTs across several wallets, " +
            "and you must output a JSON plan to shuffle the NFTs. " +
            "Output ONLY valid JSON in the following format: " +
            '{"transfers": [{"from": "wallet_account", "to": "wallet_account", "token_id": "token123", "memo": "optional memo"}, ...]}'
        },
        { role: "user", content: proposal }
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    // Return the generated content.
    return response.choices[0].message.content;
  }
};
