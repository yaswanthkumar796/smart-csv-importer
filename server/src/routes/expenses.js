import express from 'express';
import prisma from '../utils/db.js';
import { calculateExactSplits } from '../utils/splitEngine.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { description, amount, paid_by, date, split_with } = req.body;
    const accountId = req.user.id;
    
    const exactSplits = calculateExactSplits(amount, 'equal', split_with, '');
    
    let group = await prisma.group.findFirst({ where: { ownerId: accountId } });
    if (!group) group = await prisma.group.create({ data: { name: 'Flatmates', ownerId: accountId } });

    const userNames = new Set([paid_by.trim(), ...Object.keys(exactSplits)]);
    const userMap = {};
    
    for (const name of userNames) {
      if (!name) continue;
      const user = await prisma.user.upsert({
        where: { name_groupId: { name, groupId: group.id } },
        update: {},
        create: { name, groupId: group.id }
      });
      userMap[name] = user.id;
    }

    const [year, month, day] = date.split('-');
    
    const expense = await prisma.expense.create({
      data: {
        groupId: group.id,
        description,
        date: new Date(`${year}-${month}-${day}`),
        amount: Number(amount),
        currency: 'INR',
        paidById: userMap[paid_by.trim()],
        splitType: 'equal'
      }
    });

    const splitData = Object.entries(exactSplits).map(([name, amountOwed]) => ({
      expenseId: expense.id,
      userId: userMap[name],
      amountOwed: Number(amountOwed)
    }));

    await prisma.expenseSplit.createMany({ data: splitData });
    res.json({ message: 'Expense added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

router.post('/settle', requireAuth, async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const accountId = req.user.id;

    let group = await prisma.group.findFirst({ where: { ownerId: accountId } });
    if (!group) group = await prisma.group.create({ data: { name: 'Flatmates', ownerId: accountId } });

    const userFrom = await prisma.user.upsert({ where: { name_groupId: { name: from, groupId: group.id } }, update: {}, create: { name: from, groupId: group.id } });
    const userTo = await prisma.user.upsert({ where: { name_groupId: { name: to, groupId: group.id } }, update: {}, create: { name: to, groupId: group.id } });

    const expense = await prisma.expense.create({
      data: {
        groupId: group.id,
        description: `Settled up: ${from} paid ${to}`,
        date: new Date(),
        amount: Number(amount),
        currency: 'INR',
        paidById: userFrom.id,
        splitType: 'settlement'
      }
    });

    await prisma.expenseSplit.create({
      data: {
        expenseId: expense.id,
        userId: userTo.id,
        amountOwed: Number(amount)
      }
    });

    res.json({ message: 'Settled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process settlement' });
  }
});

export default router;
