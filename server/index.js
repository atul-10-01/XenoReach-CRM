import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import passport from 'passport';
import authRoutes from './routes/auth.js';

import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import geminiRoutes from './routes/gemini.js';
import segmentRoutes from './routes/segments.js';
import campaignRoutes from './routes/campaigns.js';
import analyticsRoutes from './routes/analytics.js';
import vendorRoutes from './routes/vendor.js';

dotenv.config();
const app = express();

// Middlewares
const allowedOrigins = [
  'https://xeno-reach-crm.vercel.app',
  'https://xeno-reach-crm-atul-nags-projects.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Swagger setup
const swaggerDoc = YAML.load('./docs/swagger.yaml');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/vendor', vendorRoutes);

// Health-check
app.get('/', (req, res) => res.send('Xeno CRM API is running'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✔️ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
