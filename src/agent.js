import { OpenAI } from 'openai';
import { nearService } from './services/nearService.js';
import { ENV } from './config/environment.js';

// Define the schema for our only function: transferring an NFT.
const tools = [
  {
    type: "function",
    function: {
      name: "transferNFT",
      description:
        "Transfer an NFT from the current wallet to another wallet. " +
        "Parameters: token_id (string), receiver_id (string), and optionally memo (string).",
      parameters: {
        type: "object",
        properties: {
          token_id: { type: "string", description: "The NFT token ID to be transferred" },
          receiver_id: { type: "string", description: "The NEAR account ID of the recipient" },
          memo: { type: "string", description: "An optional memo for the transfer" }
        },
        required: ["token_id", "receiver_id"]
      }
    }
  }
];

// Map the function name to its actual implementation.
const availableTools = {
  transferNFT: async (args) => {
    // Call our NEAR service's transferNFT method.
    return await nearService.transferNFT({
      token_id: args.token_id,
      receiver_id: args.receiver_id,
      memo: args.memo || "NFT transfer initiated by autonomous agent"
    });
  }
};

// Initialize the conversation with a system prompt.
// This instructs the LLM that its sole responsibility is to perform NFT transfers.
const messages = [
  {
    role: "system",
    content:
      "You are an autonomous NFT transfer agent. " +
      "Your role is to transfer NFTs from one wallet to another using the provided transferNFT function. " +
      "When given a transfer request, output a function call with the token_id and receiver_id. " +
      "Do not provide any additional output."
  }
];

// The main agent function that processes the user's input.
async function agent(openai, userInput) {
  // Append the user input.
  messages.push({ role: "user", content: userInput });

  // Allow for multiple iterations (e.g. up to 5 rounds) for function calling.
  for (let i = 0; i < 5; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      tools
    });

    const choice = response.choices[0];
    const finish_reason = choice.finish_reason;
    const message = choice.message;

    if (finish_reason === "tool_calls" && message.tool_calls) {
      // Extract the function call details.
      const toolCall = message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionToCall = availableTools[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);

      // Execute the function call.
      const functionResponse = await functionToCall(functionArgs);

      // Append the function's output to the conversation.
      messages.push({
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResponse)
      });
    } else if (finish_reason === "stop") {
      // When the model is finished, return the final answer.
      messages.push(message);
      return message.content;
    }
  }
  return "Unable to finalize NFT transfer after multiple iterations.";
}

// Example usage: The agent receives a transfer request and calls the transferNFT function.
async function main() {
  const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
  
  // Example user prompt. Adjust token_id and receiver_id as needed.
  const userInput = "Please transfer NFT 'plant-123456789" + "' from account '" + ENV.NEAR_ACCOUNT_ID + "' to account 'lhlrahman.testnet'.";
  
  const finalResponse = await agent(openai, userInput);
  console.log("Agent final response:", finalResponse);
}

main().catch((err) => console.error("Error in agent:", err));
