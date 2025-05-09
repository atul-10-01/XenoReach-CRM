import express from 'express';
import Campaign from '../models/Campaign.js';
import Customer from '../models/Customer.js';
import Segment from '../models/Segment.js';
import CommLog from '../models/CommunicationLog.js';
import { buildMongoQuery } from '../utils/queryBuilder.js';
import { sendCampaignEmails } from '../utils/emailService.js';

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

// Create and send a campaign
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

    // Create initial communication logs with PENDING status
    const commLogs = customers.map(customer => ({
      campaignId: campaign._id,
      customerId: customer._id,
      status: 'PENDING',
      sentAt: null
    }));

    await CommLog.insertMany(commLogs);

    // Send emails in background
    sendCampaignEmails(customers, campaign)
      .then(async (results) => {
        // Update communication logs based on email sending results
        for (let i = 0; i < customers.length; i++) {
          const customer = customers[i];
          const result = results[i];
          
          await CommLog.findOneAndUpdate(
            { campaignId: campaign._id, customerId: customer._id },
            {
              status: result.success ? 'SENT' : 'FAILED',
              sentAt: result.success ? new Date() : null,
              error: result.success ? null : result.error
            }
          );
        }
      })
      .catch(error => {
        console.error('Error in background email sending:', error);
      });

    res.status(201).json({
      success: true,
      campaign,
      sentTo: customers.length,
      message: 'Campaign created and emails are being sent in the background'
    });
  } catch (err) {
    console.error('Campaign error:', err);
    res.status(500).json({ success: false, message: 'Failed to create campaign', error: err.message });
  }
});

export default router; 