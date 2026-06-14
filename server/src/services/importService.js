import fs from 'fs';
import csv from 'csv-parser';
import { calculateExactSplits } from '../utils/splitEngine.js';

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
        } else if (!data.paid_by || !data.paid_by.trim()) {
          anomalyType = 'MISSING_PAID_BY';
          actionTaken = 'skipped';
        }

        let exactSplits = null;
        
        if (!anomalyType || actionTaken !== 'skipped') {
          try {
            exactSplits = calculateExactSplits(
              data.amount, 
              data.split_type, 
              data.split_with, 
              data.split_details
            );
          } catch (error) {
            anomalyType = `MATH_ERROR: ${error.message}`;
            actionTaken = 'flagged_for_review';
          }
        }

        if (anomalyType) {
          anomalies.push({
            row: data,
            issue: anomalyType,
            action: actionTaken
          });
        }
        
        if (actionTaken !== 'skipped' && exactSplits) {
          results.push({
            ...data,
            calculated_splits: exactSplits
          });
        }
        
        seenRows.add(rowString);
      })
      .on('end', () => resolve({ validRows: results, anomalies }))
      .on('error', reject);
  });
};
