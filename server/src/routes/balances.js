import express from 'express';
import { calculateBalances } from '../services/balanceService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await calculateBalances();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate balances' });
  }
});

export default router;
