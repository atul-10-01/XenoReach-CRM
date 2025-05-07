import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';

import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import geminiRoutes from './routes/gemini.js';


dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Swagger setup
const swaggerDoc = YAML.load('./docs/swagger.yaml');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// Mount routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/gemini', geminiRoutes);

// Health-check
app.get('/', (req, res) => res.send('Xeno CRM API is running'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✔️ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
