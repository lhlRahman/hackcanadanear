import { OpenAI } from 'openai';
import { nearService } from './services/nearService.js';
import { ENV } from './config/environment.js';

const messages = [
  {
    role: "system",
    content: `You are an autonomous Plant NFT trading and minting agent. You can:
    1. Mint new plant NFTs with specific growth parameters
    2. Transfer existing plant NFTs between accounts
    3. View plant metadata and parameters
    Each plant NFT has parameters for color vibrancy, leaf area index, wilting, spotting, and symmetry.`
  }
];

const functions = [
  {
    name: "mintPlantNFT",
    description: "Mint a new plant NFT with specific parameters",
    parameters: {
      type: "object",
      properties: {
        token_id: {
          type: "string",
          description: "Unique identifier for the NFT"
        },
        receiver_id: {
          type: "string",
          description: "NEAR account ID of the NFT recipient"
        },
        plant_metadata: {
          type: "object",
          properties: {
            glb_file_url: {
              type: "string",
              description: "URL to the 3D model of the plant"
            },
            parameters: {
              type: "object",
              properties: {
                color_vibrancy: {
                  type: "object",
                  properties: {
                    score: { type: "integer", minimum: 0, maximum: 100 },
                    explanation: { type: "string" }
                  }
                },
                leaf_area_index: {
                  type: "object",
                  properties: {
                    score: { type: "integer", minimum: 0, maximum: 100 },
                    explanation: { type: "string" }
                  }
                },
                wilting: {
                  type: "object",
                  properties: {
                    score: { type: "integer", minimum: 0, maximum: 100 },
                    explanation: { type: "string" }
                  }
                },
                spotting: {
                  type: "object",
                  properties: {
                    score: { type: "integer", minimum: 0, maximum: 100 },
                    explanation: { type: "string" }
                  }
                },
                symmetry: {
                  type: "object",
                  properties: {
                    score: { type: "integer", minimum: 0, maximum: 100 },
                    explanation: { type: "string" }
                  }
                }
              },
              required: ["color_vibrancy", "leaf_area_index", "wilting", "spotting", "symmetry"]
            },
            name: { type: "string" },
            wallet_id: { type: "string" },
            price: { type: "integer" }
          },
          required: ["glb_file_url", "parameters", "name", "wallet_id", "price"]
        }
      },
      required: ["token_id", "receiver_id", "plant_metadata"]
    }
  },
  {
    name: "transferPlantNFT",
    description: "Transfer a plant NFT from one account to another",
    parameters: {
      type: "object",
      properties: {
        token_id: {
          type: "string",
          description: "The identifier of the NFT to be transferred"
        },
        receiver_id: {
          type: "string",
          description: "NEAR account ID of the recipient"
        },
        memo: {
          type: "string",
          description: "Optional memo for the transfer"
        }
      },
      required: ["token_id", "receiver_id"]
    }
  },
  {
    name: "getPlantMetadata",
    description: "Get metadata for a specific plant NFT",
    parameters: {
      type: "object",
      properties: {
        token_id: {
          type: "string",
          description: "The identifier of the NFT"
        }
      },
      required: ["token_id"]
    }
  }
];

const availableTools = {
  mintPlantNFT: async (args) => {
    return await nearService.mintPlantNFT(args);
  },
  transferPlantNFT: async (args) => {
    return await nearService.transferNFT(args);
  },
  getPlantMetadata: async (args) => {
    return await nearService.getPlantMetadata(args.token_id);
  }
};

async function agent(openai, userInput) {
  messages.push({ role: "user", content: userInput });

  for (let i = 0; i < 5; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      functions: functions,
      function_call: "auto"
    });

    const choice = response.choices[0];
    const finish_reason = choice.finish_reason;
    const message = choice.message;

    if (finish_reason === "function_call" && message.function_call) {
      const functionName = message.function_call.name;
      const functionToCall = availableTools[functionName];
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      try {
        const functionResponse = await functionToCall(functionArgs);
        messages.push({
          role: "function",
          name: functionName,
          content: JSON.stringify(functionResponse)
        });
      } catch (error) {
        messages.push({
          role: "function",
          name: functionName,
          content: JSON.stringify({ error: error.message })
        });
      }
    } else if (finish_reason === "stop") {
      messages.push(message);
      return message.content;
    }
  }
  return "Unable to complete the operation after several attempts. Please try again with different parameters.";
}

async function main() {
  const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
  
  // Example: Mint a new plant NFT
  const mintExample = `Mint a new plant NFT with the following characteristics:
    - Name: Healthy Ficus
    - 3D Model: https://example.com/ficus.glb
    - Color Vibrancy: 85 (very vibrant green)
    - Leaf Area: 90 (excellent coverage)
    - Wilting: 95 (no signs)
    - Spotting: 88 (minimal)
    - Symmetry: 92 (very symmetrical)
    - Price: 1 NEAR
    - Recipient: alice.testnet`;

  const finalResponse = await agent(openai, mintExample);
  console.log("Final agent response:", finalResponse);
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

main().catch(err => console.error("Error in agent:", err));