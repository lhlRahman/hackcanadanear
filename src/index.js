import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nftRoutes from './routes/nftRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: '*',  // Allow all origins - customize this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount the NFT API routes at /api/nft
app.use('/api/nft', nftRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});