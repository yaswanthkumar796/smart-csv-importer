import express from 'express';
import prisma from '../utils/db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const accountId = req.user.id;
    const group = await prisma.group.findFirst({ where: { ownerId: accountId } });
    if (!group) {
      return res.json({ balances: {}, settlements: [] });
    }

    const expenses = await prisma.expense.findMany({
      where: { groupId: group.id },
      include: {
        paidBy: true,
        splits: { include: { user: true } }
      }
    });

    const balances = {};

    expenses.forEach(expense => {
      const payer = expense.paidBy.name;
      if (!balances[payer]) balances[payer] = 0;
      balances[payer] += expense.amount;

      expense.splits.forEach(split => {
        const debtor = split.user.name;
        if (!balances[debtor]) balances[debtor] = 0;
        balances[debtor] -= split.amountOwed;
      });
    });

    for (const user in balances) {
      balances[user] = Math.round(balances[user] * 100) / 100;
      if (Math.abs(balances[user]) < 0.01) delete balances[user];
    }

    const debtors = [];
    const creditors = [];

    for (const [name, amount] of Object.entries(balances)) {
      if (amount < 0) debtors.push({ name, amount: Math.abs(amount) });
      else if (amount > 0) creditors.push({ name, amount });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amount * 100) / 100
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (Math.abs(debtor.amount) < 0.01) i++;
      if (Math.abs(creditor.amount) < 0.01) j++;
    }

    res.json({ balances, settlements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

export default router;
