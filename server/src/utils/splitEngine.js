export const calculateExactSplits = (amount, splitType, splitWith, splitDetails) => {
  const users = splitWith.split(';').map(u => u.trim()).filter(Boolean);
  const splits = {};
  const totalAmount = Number(amount);

  if (users.length === 0) {
    throw new Error('NO_USERS_IN_SPLIT');
  }

  if (splitType === 'equal') {
    const baseSplit = Math.floor((totalAmount / users.length) * 100) / 100;
    let runningTotal = 0;

    users.forEach((user, index) => {
      if (index === users.length - 1) {
        splits[user] = Number((totalAmount - runningTotal).toFixed(2));
      } else {
        splits[user] = baseSplit;
        runningTotal += baseSplit;
      }
    });
    return splits;
  }

  if (splitType === 'percentage') {
    if (!splitDetails) throw new Error('MISSING_SPLIT_DETAILS');
    
    const parts = splitDetails.split(';').map(p => p.trim());
    let totalPercentage = 0;
    const parsedPercentages = {};

    parts.forEach(part => {
      const match = part.match(/([a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)%/);
      if (!match) throw new Error('MALFORMED_PERCENTAGE_DETAILS');
      
      const user = match[1].trim();
      const percent = Number(match[2]);
      parsedPercentages[user] = percent;
      totalPercentage += percent;
    });

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(`INVALID_PERCENTAGE_TOTAL_${totalPercentage}`);
    }

    let runningTotal = 0;
    const specifiedUsers = Object.keys(parsedPercentages);

    specifiedUsers.forEach((user, index) => {
      if (index === specifiedUsers.length - 1) {
        splits[user] = Number((totalAmount - runningTotal).toFixed(2));
      } else {
        const userAmount = Math.floor((totalAmount * (parsedPercentages[user] / 100)) * 100) / 100;
        splits[user] = userAmount;
        runningTotal += userAmount;
      }
    });
    return splits;
  }

  if (splitType === 'share') {
    if (!splitDetails) throw new Error('MISSING_SPLIT_DETAILS');

    const parts = splitDetails.split(';').map(p => p.trim());
    let totalShares = 0;
    const parsedShares = {};

    parts.forEach(part => {
      const match = part.match(/([a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)/);
      if (!match) throw new Error('MALFORMED_SHARE_DETAILS');

      const user = match[1].trim();
      const share = Number(match[2]);
      parsedShares[user] = share;
      totalShares += share;
    });

    if (totalShares === 0) throw new Error('ZERO_TOTAL_SHARES');

    let runningTotal = 0;
    const specifiedUsers = Object.keys(parsedShares);

    specifiedUsers.forEach((user, index) => {
      if (index === specifiedUsers.length - 1) {
        splits[user] = Number((totalAmount - runningTotal).toFixed(2));
      } else {
        const userAmount = Math.floor((totalAmount * (parsedShares[user] / totalShares)) * 100) / 100;
        splits[user] = userAmount;
        runningTotal += userAmount;
      }
    });
    return splits;
  }

  throw new Error('UNKNOWN_SPLIT_TYPE');
};
