import express from 'express';
import dotenv from 'dotenv';
import nftRoutes from './routes/nftRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Mount the NFT API routes at /api/nft
app.use('/api/nft', nftRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
