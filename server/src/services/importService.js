import fs from 'fs';
import csv from 'csv-parser';
import { calculateExactSplits } from '../utils/splitEngine.js';

export const processCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const rawData = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rawData.push(data))
      .on('end', async () => {
        try {
          const results = [];
          const anomalies = [];
          const seenRows = new Set();
          const ratesCache = {};

          for (const data of rawData) {
            let anomalyType = null;
            let actionTaken = 'flagged_for_review';
            
            const rowString = JSON.stringify({ ...data, notes: '' });

            if (seenRows.has(rowString)) {
              anomalyType = 'DUPLICATE_ENTRY';
              actionTaken = 'skipped';
            } else if (Number(data.amount) <= 0) {
              anomalyType = 'INVALID_AMOUNT';
            } else if (!data.paid_by || !data.paid_by.trim()) {
              anomalyType = 'MISSING_PAID_BY';
              actionTaken = 'skipped';
            } else if (data.currency && data.currency.trim().toUpperCase() !== 'INR') {
              anomalyType = 'FOREIGN_CURRENCY';
              const fromCurrency = data.currency.trim().toUpperCase();
              
              if (!ratesCache[fromCurrency]) {
                try {
                  const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
                  if (res.ok) {
                    const rateData = await res.json();
                    ratesCache[fromCurrency] = rateData.rates.INR;
                  }
                } catch (error) {
                  console.error('Failed to fetch exchange rate:', error);
                }
              }

              if (ratesCache[fromCurrency]) {
                const rate = ratesCache[fromCurrency];
                const originalAmount = Number(data.amount);
                const normalizedAmount = Number((originalAmount * rate).toFixed(2));
                
                data.amount = normalizedAmount;
                data.notes = `Converted ${originalAmount} ${fromCurrency} at 1 ${fromCurrency} = ${rate} INR. ${data.notes || ''}`;
                data.currency = 'INR';
                actionTaken = 'auto_converted';
              }
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
          }
          resolve({ validRows: results, anomalies });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};
