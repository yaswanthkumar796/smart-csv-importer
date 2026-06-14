import express from 'express';
import prisma from '../utils/db.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { optimizeSettlements } from '../utils/debtSimplifier.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const accountId = req.user.id;
    const group = await prisma.group.findFirst({ where: { ownerId: accountId } });
    if (!group) {
      return res.json({ balances: {}, settlements: [], optimizedSettlements: [] });
    }

    const expenses = await prisma.expense.findMany({
      where: { groupId: group.id },
      include: {
        paidBy: true,
        splits: { include: { user: true } }
      }
    });

    const balances = {};
    const pairwiseGraph = {};

    expenses.forEach(expense => {
      const payer = expense.paidBy.name;
      if (!balances[payer]) balances[payer] = 0;
      balances[payer] += expense.amount;

      expense.splits.forEach(split => {
        const debtor = split.user.name;
        if (debtor !== payer) {
          if (!pairwiseGraph[debtor]) pairwiseGraph[debtor] = {};
          if (!pairwiseGraph[debtor][payer]) pairwiseGraph[debtor][payer] = 0;
          pairwiseGraph[debtor][payer] += split.amountOwed;
        }

        if (!balances[debtor]) balances[debtor] = 0;
        balances[debtor] -= split.amountOwed;
      });
    });

    // Compute "Standard Settlements" (pairwise netting)
    const standardSettlements = [];
    const seenPairs = new Set();

    for (const debtor in pairwiseGraph) {
      for (const creditor in pairwiseGraph[debtor]) {
        const pairId = [debtor, creditor].sort().join('-');
        if (seenPairs.has(pairId)) continue;
        seenPairs.add(pairId);

        const debtorToCreditor = pairwiseGraph[debtor][creditor] || 0;
        const creditorToDebtor = (pairwiseGraph[creditor] && pairwiseGraph[creditor][debtor]) ? pairwiseGraph[creditor][debtor] : 0;

        const net = debtorToCreditor - creditorToDebtor;
        if (net > 0) {
          standardSettlements.push({ from: debtor, to: creditor, amount: Math.round(net * 100) / 100 });
        } else if (net < 0) {
          standardSettlements.push({ from: creditor, to: debtor, amount: Math.round(Math.abs(net) * 100) / 100 });
        }
      }
    }

    // Clean up net balances for optimized function
    for (const user in balances) {
      balances[user] = Math.round(balances[user] * 100) / 100;
      if (Math.abs(balances[user]) < 0.01) delete balances[user];
    }

    const optimizedSettlements = optimizeSettlements(balances);

    res.json({ balances, settlements: standardSettlements, optimizedSettlements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

export default router;
