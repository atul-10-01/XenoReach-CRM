import express from 'express';
import CommLog from '../models/CommunicationLog.js';

const router = express.Router();

// Dummy vendor API: Simulate delivery
router.post('/send', async (req, res) => {
  const { campaignId, customerId, customerEmail, customerName, message } = req.body;
  // Simulate random delivery result
  const isSent = Math.random() < 0.9;
  const status = isSent ? 'SENT' : 'FAILED';
  const error = isSent ? null : 'Simulated delivery failure';

  // Simulate async delivery receipt callback
  setTimeout(async () => {
    try {
      await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/vendor/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          customerId,
          status,
          error
        })
      });
    } catch (err) {
      console.error('Error calling delivery receipt API:', err.message);
    }
  }, 500 + Math.random() * 1000); // Simulate network delay

  res.json({ success: true, status });
});

// Delivery receipt endpoint
router.post('/receipt', async (req, res) => {
  const { campaignId, customerId, status, error } = req.body;
  try {
    await CommLog.findOneAndUpdate(
      { campaignId, customerId },
      {
        status,
        sentAt: status === 'SENT' ? new Date() : null,
        error: status === 'SENT' ? null : error
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update delivery status', error: err.message });
  }
});

export default router; 