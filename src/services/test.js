// src/tests/testEndpoints.js
// If you're using Node 18+ you have global fetch, otherwise install node-fetch
// and import it using: import fetch from 'node-fetch';

const BASE_URL = "https://hackcanadanear.onrender.com/api/nft";

/**
 * Test minting an NFT.
 */
async function testMint() {
  console.log("Testing Mint NFT...");
  const response = await fetch(`${BASE_URL}/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token_id: "223",
      receiver_id: "hackcanada.testnet", // minted to hackcanada for transfers
      plant_metadata: {
        glb_file_url: "https://example.com/testplant.glb",
        parameters: {
          color_vibrancy: { score: 85, explanation: "Vibrant color" },
          leaf_area_index: { score: 90, explanation: "Good coverage" },
          wilting: { score: 5, explanation: "No wilting" },
          spotting: { score: 2, explanation: "Minor spots" },
          symmetry: { score: 92, explanation: "Balanced growth" }
        },
        name: "Test Plant NFT",
        wallet_id: "hackcanada.testnet",
        price: "1000000000000000000000000"
      }
    })
  });
  const data = await response.json();
  console.log("Mint NFT Response:", data);
}

/**
 * Test retrieving NFT metadata.
 */
async function testGetMetadata() {
  console.log("Testing Get NFT Metadata...");
  const tokenId = "223";
  const response = await fetch(`${BASE_URL}/metadata/${tokenId}`);
  const data = await response.json();
  console.log("Get NFT Metadata Response:", data);
}

/**
 * Test retrieving full NFT token details.
 */
async function testGetToken() {
  console.log("Testing Get NFT Token Details...");
  const tokenId = "223";
  const response = await fetch(`${BASE_URL}/token/${tokenId}`);
  const data = await response.json();
  console.log("Get NFT Token Response:", data);
}

/**
 * Test transferring an NFT.
 * This command transfers the NFT from hackcanada.testnet to another account.
 */
async function testTransfer() {
  console.log("Testing Transfer NFT...");
  const response = await fetch(`${BASE_URL}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token_id: "223",
      receiver_id: "lhlrahman.testnet",
      memo: "Test NFT transfer",
      from: "hackcanada.testnet" // Always send from hackcanada.testnet
    })
  });
  const data = await response.json();
  console.log("Transfer NFT Response:", data);
}

/**
 * Test retrieving all NFTs for a given owner.
 */
async function testGetTokensForOwner() {
  console.log("Testing Get Tokens for Owner...");
  const owner = "hackcanada.testnet";
  const response = await fetch(`${BASE_URL}/owner/${owner}`);
  const data = await response.json();
  console.log("Get Tokens for Owner Response:", data);
}

/**
 * Test shuffling NFTs (LLM negotiation and transfers).
 */
async function testShuffle() {
  console.log("Testing Shuffle NFTs...");
  const response = await fetch(`${BASE_URL}/shuffle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  const data = await response.json();
  console.log("Shuffle NFTs Response:", data);
}

/**
 * Run all tests sequentially.
 */
async function runTests() {
  try {
    await testMint();
    // Adding a short delay to ensure state propagation.
    await new Promise((r) => setTimeout(r, 2000));
    await testGetMetadata();
    await testGetToken();
    await testTransfer();
    await testGetTokensForOwner();
    await testShuffle();
    console.log("All tests executed on https://hackcanadanear.onrender.com");
  } catch (error) {
    console.error("Error during tests:", error);
  }
}

runTests();
