import dotenv from 'dotenv';

dotenv.config();

export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_API_KEY não configurada no arquivo .env');
} 