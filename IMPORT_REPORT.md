# CSV Import & Anomaly Report

## 1. Execution Summary
During the testing phase, I uploaded the provided `Expenses Export.csv` to evaluate the system's resilience against messy data and edge cases. The `importService` successfully parsed the file, separated clean data from corrupted data, and executed automatic currency conversions.

* **Total Valid Rows Processed & Saved:** 37
* **Total Anomalies Detected:** 10
* **Status:** Database integrity successfully maintained. Invalid data was isolated and flagged for manual review, while safe data was pushed to the PostgreSQL database.

---

## 2. Detailed Anomaly Log
The application caught 10 distinct issues. Instead of allowing the server to crash or saving bad math to the database, my system intercepted them as follows:

| Date | Description | Original Amount | Issue Detected | Action Taken |
| :--- | :--- | :--- | :--- | :--- |
| 20-02-2026 | Aisha birthday cake | 1500 INR | `MATH_ERROR: UNKNOWN_SPLIT_TYPE` | Flagged for review |
| 22-02-2026 | House cleaning supplies | 780 INR | `MISSING_PAID_BY` | Skipped (Cannot assign debt) |
| 25-02-2026 | Rohan paid Aisha back | 5000 INR | `MATH_ERROR: UNKNOWN_SPLIT_TYPE` | Flagged for review |
| 28-02-2026 | Pizza Friday | 1440 INR | `MATH_ERROR: INVALID_PERCENTAGE_TOTAL_110` | Flagged for review |
| 09-03-2026 | Goa villa booking | 540 USD | `FOREIGN_CURRENCY` | Auto-converted to 51,462 INR |
| 10-03-2026 | Beach shack lunch | 84 USD | `FOREIGN_CURRENCY` | Auto-converted to 8,005 INR |
| 11-03-2026 | Parasailing | 150 USD | `FOREIGN_CURRENCY` | Auto-converted to 14,295 INR |
| 12-03-2026 | Parasailing refund | -30 USD | `INVALID_AMOUNT` | Flagged for review (Negative value) |
| 22-03-2026 | Dinner order Swiggy | 0 INR | `INVALID_AMOUNT` | Flagged for review (Zero value) |
| 25-03-2026 | Weekend brunch | 2200 INR | `MATH_ERROR: INVALID_PERCENTAGE_TOTAL_110`| Flagged for review |

---

## 3. Post-Import Dashboard Results
After the 37 valid rows were committed to the database, the backend calculated the net balances across the 10 unique user profiles extracted from the CSV. 

**Graph Theory Debt Simplifier:**
Initially, the standard settlement calculation generated a massive web of 24 separate transactions required to settle the group. By routing the data through the integrated Greedy Graph Algorithm (Two-Pointer Method), the application successfully crushed the settlement plan down to just **9 optimized transactions**. 

The books are perfectly balanced and the data is isolated to the authenticated session (`yashu`).
