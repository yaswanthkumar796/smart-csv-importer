import express from 'express';
import prisma from '../utils/db.js';

const router = express.Router();

router.get('/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await prisma.user.findUnique({
      where: { name: userName },
      include: {
        expensesPaid: true,
        splits: { include: { expense: true } }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const history = [];

    user.expensesPaid.forEach(exp => {
      history.push({
        recordId: `credit-${exp.id}`,
        expenseId: exp.id,
        date: exp.date,
        description: `Paid for: ${exp.description}`,
        type: 'credit',
        amount: exp.amount,
        notes: exp.notes
      });
    });

    user.splits.forEach(split => {
      history.push({
        recordId: `debt-${split.id}`,
        expenseId: split.expense.id,
        date: split.expense.date,
        description: `Owe for split: ${split.expense.description}`,
        type: 'debt',
        amount: split.amountOwed,
        notes: split.expense.notes
      });
    });

    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    const auditTrail = history.map(item => {
      if (item.type === 'credit') runningBalance += item.amount;
      else runningBalance -= item.amount;
      
      return {
        ...item,
        runningBalance: Math.round(runningBalance * 100) / 100
      };
    });

    res.json({ userName, auditTrail, finalBalance: Math.round(runningBalance * 100) / 100 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

export default router;
