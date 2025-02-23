import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NEAR_ACCOUNT_ID: process.env.NEAR_ACCOUNT_ID,
  NEAR_SECRET_KEY: process.env.NEAR_SECRET_KEY,
  NEAR_CONTRACT_ID: process.env.NEAR_CONTRACT_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PORT: process.env.PORT || 3000,
};
