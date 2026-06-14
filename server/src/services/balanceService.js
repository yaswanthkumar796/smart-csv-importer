import prisma from '../utils/db.js';

export const calculateBalances = async () => {
  const users = await prisma.user.findMany({
    include: {
      expensesPaid: true,
      splits: true
    }
  });

  const balances = {};

  users.forEach(user => {
    balances[user.name] = 0;
  });

  users.forEach(user => {
    user.expensesPaid.forEach(exp => {
      balances[user.name] += exp.amount;
    });
    user.splits.forEach(split => {
      balances[user.name] -= split.amountOwed;
    });
  });

  const roundedBalances = {};
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([name, amount]) => {
    const rounded = Math.round(amount * 100) / 100;
    roundedBalances[name] = rounded;

    if (rounded < -0.01) debtors.push({ name, amount: Math.abs(rounded) });
    else if (rounded > 0.01) creditors.push({ name, amount: rounded });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: Math.round(settledAmount * 100) / 100
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  return { balances: roundedBalances, settlements };
};
