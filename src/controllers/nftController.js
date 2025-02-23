import { nearService } from '../services/nearService.js';

// Controller for minting a new Plant NFT.
export const mintNFTController = async (req, res, next) => {
  try {
    const { token_id, receiver_id, plant_metadata } = req.body;
    const result = await nearService.mintPlantNFT({ token_id, receiver_id, plant_metadata });
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

// Controller for retrieving plant metadata.
export const getNFTMetadataController = async (req, res, next) => {
  try {
    const { token_id } = req.params;
    const metadata = await nearService.getPlantMetadata(token_id);
    res.json({ metadata });
  } catch (error) {
    next(error);
  }
};

// Controller for retrieving NFT token details.
export const getNFTTokenController = async (req, res, next) => {
  try {
    const { token_id } = req.params;
    const token = await nearService.getNFTToken(token_id);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

// Controller for transferring an NFT.
export const transferNFTController = async (req, res, next) => {
  try {
    const { token_id, receiver_id, memo } = req.body;
    const result = await nearService.transferNFT({ token_id, receiver_id, memo });
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

// Controller for getting all NFTs for an owner.
export const getTokensForOwnerController = async (req, res, next) => {
  try {
    const { account_id } = req.params;
    const tokens = await nearService.getTokensForOwner(account_id);
    res.json({ tokens });
  } catch (error) {
    next(error);
  }
};
