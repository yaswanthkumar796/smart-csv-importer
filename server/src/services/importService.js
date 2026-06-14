import fs from 'fs';
import csv from 'csv-parser';

export const processCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const anomalies = [];
    const seenRows = new Set();

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        let anomalyType = null;
        let actionTaken = 'flagged_for_review';
        
        const rowString = JSON.stringify({ ...data, notes: '' });

        if (seenRows.has(rowString)) {
          anomalyType = 'DUPLICATE_ENTRY';
          actionTaken = 'skipped';
        } else if (Number(data.amount) <= 0) {
          anomalyType = 'INVALID_AMOUNT';
        } else if (data.currency && data.currency.trim().toUpperCase() !== 'INR') {
          anomalyType = 'FOREIGN_CURRENCY';
        }

        if (anomalyType) {
          anomalies.push({
            row: data,
            issue: anomalyType,
            action: actionTaken
          });
        }
        
        if (actionTaken !== 'skipped') {
          results.push(data);
        }
        
        seenRows.add(rowString);
      })
      .on('end', () => resolve({ validRows: results, anomalies }))
      .on('error', reject);
  });
};
