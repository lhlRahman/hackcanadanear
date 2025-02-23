import express from 'express';
import {
  mintNFTController,
  getNFTMetadataController,
  getNFTTokenController,
  transferNFTController,
  getTokensForOwnerController
} from '../controllers/nftController.js';

const router = express.Router();

// Endpoint to mint a new NFT
router.post('/mint', mintNFTController);

// Endpoint to get metadata for a specific NFT
router.get('/metadata/:token_id', getNFTMetadataController);

// Endpoint to get full NFT token details
router.get('/token/:token_id', getNFTTokenController);

// Endpoint to transfer an NFT
router.post('/transfer', transferNFTController);

// Endpoint to list all NFTs for an owner (if implemented)
router.get('/owner/:account_id', getTokensForOwnerController);

export default router;
