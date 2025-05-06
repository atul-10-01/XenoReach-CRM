import express from 'express';
import { generateGeminiResponse } from '../controllers/gemini.js';

const router = express.Router();

router.post('/generate', generateGeminiResponse);

export default router;
