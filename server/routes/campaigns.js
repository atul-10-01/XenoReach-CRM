import express from 'express';
import Campaign from '../models/Campaign.js';
import Customer from '../models/Customer.js';
import Segment from '../models/Segment.js';
import { buildMongoQuery } from '../utils/queryBuilder.js';

const router = express.Router();

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('segmentId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (err) {
    console.error('Failed to fetch campaigns:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch campaigns', error: err.message });
  }
});

// Create and simulate a campaign
router.post('/', async (req, res) => {
  const { name, message, segmentId } = req.body;

  if (!name || !message || !segmentId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ success: false, message: 'Segment not found' });
    }

    const mongoQuery = buildMongoQuery(segment.rules);
    const customers = await Customer.find(mongoQuery).select('email name');

    const campaign = new Campaign({
      name,
      message,
      segmentId,
      customerCount: customers.length,
      status: 'sent'
    });

    await campaign.save();

    // Log simulated "delivery"
    customers.forEach(c => {
      console.log(`📨 [${new Date().toISOString()}] Sending to ${c.email}: "${message}"`);
    });

    res.status(201).json({
      success: true,
      campaign,
      sentTo: customers.length
    });
  } catch (err) {
    console.error('Campaign error:', err);
    res.status(500).json({ success: false, message: 'Failed to create campaign', error: err.message });
  }
});

export default router; 