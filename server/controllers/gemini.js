import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateGeminiResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ reply: text });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ error: 'Gemini API error' });
  }
};
