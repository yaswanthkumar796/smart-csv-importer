import express from 'express';
import prisma from '../utils/db.js';
import { calculateExactSplits } from '../utils/splitEngine.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { description, amount, paid_by, date, split_with } = req.body;
    
    const exactSplits = calculateExactSplits(amount, 'equal', split_with, '');
    
    const userNames = new Set([paid_by.trim(), ...Object.keys(exactSplits)]);
    const userMap = {};
    
    for (const name of userNames) {
      if (!name) continue;
      const user = await prisma.user.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      userMap[name] = user.id;
    }

    let group = await prisma.group.findFirst({ where: { name: 'Flatmates' } });
    if (!group) group = await prisma.group.create({ data: { name: 'Flatmates' } });

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

router.post('/settle', async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    const userFrom = await prisma.user.upsert({ where: { name: from }, update: {}, create: { name: from } });
    const userTo = await prisma.user.upsert({ where: { name: to }, update: {}, create: { name: to } });

    let group = await prisma.group.findFirst({ where: { name: 'Flatmates' } });

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
