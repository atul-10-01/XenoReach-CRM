import express from 'express';
import { body, validationResult } from 'express-validator';
import Customer from '../models/Customer.js';

const router = express.Router();

// POST /api/customers
router.post(
  '/',
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('spend').optional().isNumeric(),
    body('visits').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const cust = new Customer(req.body);
      await cust.save();
      res.status(201).json(cust);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/customers (list)
router.get('/', async (req, res) => {
  const list = await Customer.find().sort('-createdAt');
  res.json(list);
});

export default router;
