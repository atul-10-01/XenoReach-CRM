import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');

router.post('/suggest', async (req, res) => {
  try {
    const { segmentName, segmentDescription } = req.body;

    if (!segmentName) {
      return res.status(400).json({ success: false, message: 'Segment name is required' });
    }

    const prompt = `
You are an expert marketing copywriter for a CRM platform. 
Generate 3 catchy, emotionally engaging promotional campaign messages for the following customer segment. 
Each message should:
- Be personalized and relevant to the segment
- Include a clear call-to-action
- Be up to 50 words
- Be catchy, emotional, and include at least one relevant emoji
- Do NOT include any explanations or extra text, only the campaign messages themselves
- Format as a numbered list

Segment Name: "${segmentName}"
${segmentDescription ? segmentDescription : ''}
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response into structured format
    const suggestions = text
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/^\d+\.\s*(.+)$/);
        if (match) {
          return {
            message: match[1].trim(),
            explanation: null
          };
        }
        return null;
      })
      .filter(Boolean);

    res.json({ 
      success: true, 
      suggestions,
      rawResponse: text 
    });
  } catch (err) {
    console.error('Gemini API error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate suggestions', 
      error: err.message 
    });
  }
});

export default router;
