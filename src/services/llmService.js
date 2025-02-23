// src/services/llmService.js
import { OpenAI } from 'openai';
import { ENV } from '../config/environment.js';

/**
 * generateNegotiationResponse
 * This function sends a negotiation prompt to OpenAI's GPT-4 model and returns the response as a JSON string.
 * It will retry up to 10 times if the response cannot be parsed as valid JSON.
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
    const systemMessage =
      "You are an autonomous NFT negotiation agent. " +
      "You are given the current distribution of NFTs across several wallets, " +
      "and you must output a JSON plan to shuffle the NFTs. " +
      "Output ONLY valid JSON in the following format: " +
      '{"transfers": [{"from": "wallet_account", "to": "wallet_account", "token_id": "token123", "memo": "optional memo"}, ...]}';

    let attempts = 0;
    let content = "";
    while (attempts < 10) {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: proposal }
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      content = response.choices[0].message.content;
      try {
        JSON.parse(content);
        console.log(`LLM response parsed successfully on attempt ${attempts + 1}.`);
        break; // valid JSON obtained, exit loop
      } catch (e) {
        attempts++;
        console.error(`Attempt ${attempts}: Failed to parse LLM response as JSON. Response received: ${content}`);
      }
    }

    if (attempts === 10) {
      throw new Error("Failed to get a valid JSON response from LLM after 10 attempts.");
    }
    return content;
  }
};
