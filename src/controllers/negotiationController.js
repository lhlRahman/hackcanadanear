import { llmService } from '../services/llmService.js';

export const negotiateTrade = async (req, res, next) => {
  try {
    const { proposal } = req.body;
    // Use LLM service to generate a negotiation response based on the proposal
    const negotiationMessage = await llmService.generateNegotiationResponse(proposal);
    res.json({ negotiationMessage });
  } catch (error) {
    next(error);
  }
};
