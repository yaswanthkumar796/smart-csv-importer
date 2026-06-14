import express from 'express';
import cors from 'cors';
import importRoutes from './routes/import.js';
import balanceRoutes from './routes/balances.js';
import auditRoutes from './routes/audit.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/import', importRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
