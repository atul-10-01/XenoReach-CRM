import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import geminiRoutes from './routes/gemini.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/gemini', geminiRoutes);

app.get('/', (req, res) => res.send('Xeno CRM API is running'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✔️ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
