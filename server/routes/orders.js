import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// POST /api/orders
router.post(
  '/',
  [
    body('customerId').isMongoId().withMessage('Valid customerId required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('items').isArray({ min: 1 }).withMessage('At least one item'),
    body('items.*.name').notEmpty(),
    body('items.*.qty').isInt({ min: 1 }),
    body('items.*.price').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      // Ensure customer exists
      const cust = await Customer.findById(req.body.customerId);
      if (!cust) return res.status(404).json({ error: 'Customer not found' });

      const order = new Order(req.body);
      await order.save();

      // Update customer stats
      cust.spend += order.amount;
      cust.visits += 1;
      cust.lastOrderDate = order.orderDate;
      await cust.save();

      res.status(201).json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/orders
router.get('/', async (req, res) => {
  const list = await Order.find().sort('-createdAt');
  res.json(list);
});

export default router;
