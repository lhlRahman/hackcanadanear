import { ENV } from '../config/environment.js';

export const llmService = {
  generateNegotiationResponse: async (proposal) => {
    const prompt = `Negotiate a trade: I have NFT ${proposal.myNFT} and I want NFT ${proposal.desiredNFT}. Propose trade terms in one sentence.`;
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 50
      })
    });
    const data = await response.json();
    return data.choices[0].text.trim();
  }
};
