// src/services/work.js
import { connect, keyStores, KeyPair } from 'near-api-js';

const nearConfig = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
};

const ENV = {
    NEAR_ACCOUNT_ID: "lebronjamesnear.testnet",
    NEAR_SECRET_KEY: "ed25519:2g6YZttDoKzXuG6ra7L6TfRm3RCe2zY3iPYFELXqtW1zMsZATyyFpkNE5nAnHXN8kDyUNR6jfcrBVdXWzewzBUnC",
    NEAR_CONTRACT_ID: "lebronjamesnear.testnet",
};

// Validate environment variables
function validateEnvironment() {
    const requiredVars = ['NEAR_ACCOUNT_ID', 'NEAR_SECRET_KEY', 'NEAR_CONTRACT_ID'];
    const missingVars = requiredVars.filter(varName => !ENV[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    if (!ENV.NEAR_SECRET_KEY.startsWith('ed25519:')) {
        throw new Error('NEAR_SECRET_KEY must be a valid private key starting with "ed25519:"');
    }
}

async function initNear() {
    try {
        validateEnvironment();

        const keyStore = new keyStores.InMemoryKeyStore();
        await keyStore.setKey(
            nearConfig.networkId,
            ENV.NEAR_ACCOUNT_ID,
            KeyPair.fromString(ENV.NEAR_SECRET_KEY)
        );

        const near = await connect({
            ...nearConfig,
            keyStore,
            headers: {}
        });

        const account = await near.account(ENV.NEAR_ACCOUNT_ID);
        return { near, account };
    } catch (error) {
        console.error('Failed to initialize NEAR connection:', error);
        throw error;
    }
}

async function testMintNFT() {
    try {
        console.log('Starting NFT mint test...');
        
        // Initialize NEAR connection
        const { account } = await initNear();
        
        const tokenId = `plant-${Date.now()}`;
        const testMetadata = {
            glb_file_url: "https://example.com/plant.glb",
            parameters: {
                color_vibrancy: {
                    score: 85,
                    explanation: "Vibrant green coloration throughout"
                },
                leaf_area_index: {
                    score: 90,
                    explanation: "Excellent leaf coverage and density"
                },
                wilting: {
                    score: 95,
                    explanation: "No signs of wilting or drooping"
                },
                spotting: {
                    score: 88,
                    explanation: "Minor spots on few leaves"
                },
                symmetry: {
                    score: 92,
                    explanation: "Well-balanced growth pattern"
                }
            },
            name: "Test Plant NFT",
            wallet_id: ENV.NEAR_ACCOUNT_ID,
            price: "1000000000000000000000000" // 1 NEAR
        };

        console.log(`Minting NFT with token ID: ${tokenId}`);
        
        // Mint NFT - Changed method name from mint_plant_nft to nft_mint
        const mintResult = await account.functionCall({
            contractId: ENV.NEAR_CONTRACT_ID,
            methodName: 'nft_mint',
            args: {
                token_id: tokenId,
                receiver_id: ENV.NEAR_ACCOUNT_ID,
                plant_metadata: testMetadata
            },
            gas: '300000000000000',
            attachedDeposit: "10000000000000000000000" // 0.01 NEAR
        });
        
        console.log('Mint transaction result:', mintResult);

        // Get metadata
        const metadata = await account.viewFunction({
            contractId: ENV.NEAR_CONTRACT_ID,
            methodName: 'get_plant_metadata',
            args: { token_id: tokenId }
        });
        console.log('Retrieved metadata:', metadata);

        // Get token
        const token = await account.viewFunction({
            contractId: ENV.NEAR_CONTRACT_ID,
            methodName: 'nft_token',
            args: { token_id: tokenId }
        });
        console.log('Retrieved token:', token);

        console.log('Test completed successfully!');
        return {
            success: true,
            tokenId,
            metadata,
            token
        };
    } catch (error) {
        console.error('Error during NFT mint test:', error);
        throw error;
    }
}

// Run the test
testMintNFT()
    .then(result => console.log('Test result:', result))
    .catch(error => console.error('Test failed:', error));