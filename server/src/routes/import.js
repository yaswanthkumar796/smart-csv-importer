import express from 'express';
import multer from 'multer';
import { processCsv } from '../services/importService.js';
import fs from 'fs';
import prisma from '../utils/db.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const report = await processCsv(req.file.path);
    fs.unlinkSync(req.file.path);
    res.json({ message: 'Import processed successfully', data: report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process import' });
  }
});

router.post('/confirm', async (req, res) => {
  try {
    const { validRows } = req.body;
    if (!validRows || !validRows.length) return res.status(400).json({ error: 'No data to save' });

    const userNames = new Set();
    validRows.forEach(row => {
      if (row.paid_by && row.paid_by.trim()) userNames.add(row.paid_by.trim());
      if (row.calculated_splits) {
        Object.keys(row.calculated_splits).forEach(name => userNames.add(name.trim()));
      }
    });

    const userMap = {};
    for (const name of userNames) {
      const user = await prisma.user.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      userMap[name] = user.id;
    }

    let group = await prisma.group.findFirst({ where: { name: 'Flatmates' } });
    if (!group) {
      group = await prisma.group.create({ data: { name: 'Flatmates' } });
    }

    for (const row of validRows) {
      const rawDate = row.date ? String(row.date).trim() : '';
      let expenseDate = new Date();
      if (rawDate.includes('-')) {
        const [day, month, year] = rawDate.split('-');
        if (day && month && year) {
          expenseDate = new Date(`${year}-${month}-${day}`);
        }
      } else if (rawDate) {
        expenseDate = new Date(rawDate);
      }
      if (isNaN(expenseDate.getTime())) expenseDate = new Date();
      const paidByStr = row.paid_by ? row.paid_by.trim() : '';
      const paidById = userMap[paidByStr] || null;

      if (!paidById) {
        throw new Error(`User not found for paid_by: "${paidByStr}" in row: ${row.description}`);
      }

      const expense = await prisma.expense.create({
        data: {
          groupId: group.id,
          description: row.description || '',
          date: expenseDate,
          amount: Number(row.amount) || 0,
          currency: row.currency ? row.currency.trim() : 'INR',
          paidById: paidById,
          splitType: row.split_type || 'unknown',
          notes: row.notes || ''
        }
      });

      if (row.calculated_splits) {
        const splitData = Object.entries(row.calculated_splits).map(([name, amountOwed]) => ({
          expenseId: expense.id,
          userId: userMap[name.trim()],
          amountOwed: Number(amountOwed)
        }));

        await prisma.expenseSplit.createMany({ data: splitData });
      }
    }

    res.json({ message: 'Data successfully saved to database' });
  } catch (error) {
    console.error('Database save error:', error);
    res.status(500).json({ error: error.message || 'Failed to save to database' });
  }
});

export default router;
