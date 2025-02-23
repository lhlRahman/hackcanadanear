// src/tests/transferFlowTest.js
import { nearService } from '../services/nearService.js';
import { ENV } from '../config/environment.js';

async function runTransferFlowTest() {
  try {
    console.log("Starting NFT Transfer Flow Test...");

    // 1. Mint a new NFT with a random token_id.
    const token_id = "plant-" + Date.now();
    console.log("Minting NFT with token_id:", token_id);
    const mintResult = await nearService.mintPlantNFT({
      token_id,
      receiver_id: ENV.NEAR_ACCOUNT_ID,  // Mint to your contract owner's account.
      plant_metadata: {
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
        price: "1000000000000000000000000"
      }
    });
    console.log("Mint Result:", mintResult);

    // Wait for state update (adjust delay as needed).
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 2. Transfer the NFT from the owner to lhlrahman.testnet.
    console.log("Transferring NFT", token_id, "to lhlrahman.testnet...");
    const transferResult = await nearService.transferNFT({
      token_id,
      receiver_id: "lhlrahman.testnet",
      memo: "Testing NFT transfer"
    });
    console.log("Transfer Result:", transferResult);

    // Wait for transfer to be processed.
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Retrieve the NFT details to verify the new owner.
    console.log("Retrieving NFT details for token:", token_id);
    const tokenDetails = await nearService.getNFTToken(token_id);
    console.log("NFT Token Details:", tokenDetails);

    if (tokenDetails && tokenDetails.owner_id === "lhlrahman.testnet") {
      console.log("Success: NFT transfer verified. New owner is lhlrahman.testnet");
    } else {
      console.error("Failure: NFT transfer not verified. Current owner:",
        tokenDetails ? tokenDetails.owner_id : "Unknown");
    }
  } catch (error) {
    console.error("NFT Transfer Flow Test failed:", error);
  }
}

runTransferFlowTest();
