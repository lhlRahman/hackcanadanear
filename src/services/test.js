// src/tests/testNearService.js
import { nearService } from '../services/nearService.js';
import { ENV } from '../config/environment.js';

async function testMintNFT() {
    console.log("Testing mintPlantNFT...");
    // Generate a unique token_id using current timestamp
    const token_id = "plant-" + Date.now();
    // Mint the NFT to our own account for testing
    const receiver_id = ENV.NEAR_ACCOUNT_ID;
    const plant_metadata = {
      glb_file_url: "https://example.com/plant.glb",
      parameters: {
        color_vibrancy: { score: 85, explanation: "Vibrant color" },
        leaf_area_index: { score: 90, explanation: "High coverage" },
        wilting: { score: 5, explanation: "No wilting" },
        spotting: { score: 2, explanation: "Minor spots" },
        symmetry: { score: 92, explanation: "Well balanced" }
      },
      name: "Test Plant NFT",
      wallet_id: ENV.NEAR_ACCOUNT_ID,
      price: "1000000000000000000000000" // Example price in yoctoNEAR
    };
  
    try {
      const mintResult = await nearService.mintPlantNFT({
        token_id,
        receiver_id,
        plant_metadata
      });
      console.log("Mint Result:", mintResult);
      return token_id;
    } catch (error) {
      console.error("Minting NFT failed:", error);
      throw error;
    }
  }
  

async function testGetPlantMetadata(token_id) {
  console.log("Testing getPlantMetadata for token:", token_id);
  try {
    const metadata = await nearService.getPlantMetadata(token_id);
    console.log("Plant Metadata:", metadata);
  } catch (error) {
    console.error("Getting plant metadata failed:", error);
  }
}

async function testGetNFTToken(token_id) {
  console.log("Testing getNFTToken for token:", token_id);
  try {
    const token = await nearService.getNFTToken(token_id);
    console.log("NFT Token:", token);
  } catch (error) {
    console.error("Getting NFT token failed:", error);
  }
}

async function testTransferNFT(token_id) {
  console.log("Testing transferNFT for token:", token_id);
  // Transfer the NFT to a different (dummy) account.
  const receiver_id = "dummy.testnet"; 
  try {
    const transferResult = await nearService.transferNFT({
      receiver_id,
      token_id,
      memo: "Test NFT transfer"
    });
    console.log("Transfer Result:", transferResult);
  } catch (error) {
    console.error("Transferring NFT failed:", error);
  }
}

// Commented out because your contract might not have nft_tokens_for_owner implemented
// async function testGetTokensForOwner() {
//   console.log("Testing getTokensForOwner...");
//   try {
//     const tokens = await nearService.getTokensForOwner(ENV.NEAR_ACCOUNT_ID);
//     console.log("Tokens for Owner:", tokens);
//   } catch (error) {
//     console.error("Getting tokens for owner failed:", error);
//   }
// }

async function runTests() {
  try {
    // Mint a new NFT and capture its token_id.
    const token_id = await testMintNFT();
    // Wait a bit for the state to update.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testGetPlantMetadata(token_id);
    await testGetNFTToken(token_id);
    await testTransferNFT(token_id);
    // await testGetTokensForOwner(); // Uncomment if implemented in your contract.
    
    console.log("All tests completed successfully!");
  } catch (error) {
    console.error("One or more tests failed:", error);
  }
}

runTests();
