import express from 'express';
import Campaign from '../models/Campaign.js';
import CommLog from '../models/CommunicationLog.js';
import Segment from '../models/Segment.js';

const router = express.Router();

// GET /api/analytics/campaigns
// Returns list of campaigns with sent / success / failure counts
router.get('/campaigns', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchCampaignDate = {};
    
    if (startDate) matchCampaignDate.$gte = new Date(startDate);
    if (endDate) matchCampaignDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59));

    const stats = await CommLog.aggregate([
      {
        $group: {
          _id: '$campaignId',
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'SENT'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      ...(startDate || endDate ? [{ $match: { 'campaign.createdAt': matchCampaignDate } }] : []),
      {
        $lookup: {
          from: 'segments',
          localField: 'campaign.segmentId',
          foreignField: '_id',
          as: 'segment'
        }
      },
      { $unwind: '$segment' },
      {
        $project: {
          campaignId: '$_id',
          name: '$campaign.name',
          segmentName: '$segment.name',
          createdAt: '$campaign.createdAt',
          total: 1,
          sent: 1,
          failed: 1,
          pending: 1,
          successRate: {
            $round: [{
              $multiply: [
                { $divide: ['$sent', { $max: ['$total', 1] }] },
                100
              ]
            }, 2]
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/analytics/segments
// Returns segment performance metrics
router.get('/segments', async (req, res) => {
  try {
    const stats = await Segment.aggregate([
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: 'segmentId',
          as: 'campaigns'
        }
      },
      {
        $project: {
          name: 1,
          customerCount: 1,
          campaignCount: { $size: '$campaigns' },
          lastRun: 1,
          isActive: 1
        }
      },
      { $sort: { customerCount: -1 } }
    ]);

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Segment analytics error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching segment analytics',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router; 