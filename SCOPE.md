# Scope and Anomaly Log

## Database Setup
I usually use MERN, but the instructions strictly said "Use relational DBs only". So I used PostgreSQL with Prisma. Here is how I set up the tables:
- **User:** Stores the user's name and hashed password.
- **Group & GroupMember:** Handles who is in the flat. I added `joinedAt` and `leftAt` dates here so the app knows Sam moved in late and Meera moved out early.
- **Expense:** Stores the main bill. I added a `currency` column here specifically because Priya paid for things in USD.
- **ExpenseSplit:** This is the most important part. Instead of doing math on the fly, this table saves the exact decimal amount each person owes for every single bill to avoid "magic numbers".

## How I handled the CSV problems (Anomaly Log)
When the user uploads the CSV, I don't let it crash if the data is bad. I built an importer that checks for these things:

1. **Duplicates:** 
   - *Problem:* The Swiggy dinner was logged twice.
   - *My Fix:* I convert each row to a string. If I see the exact same string again, I flag it as `DUPLICATE_ENTRY` and skip it so nobody pays twice.

2. **Bad Amounts:** 
   - *Problem:* Some amounts are 0 or negative.
   - *My Fix:* If the amount is 0 or less, I flag it as `INVALID_AMOUNT` and show it on the report.

3. **Wrong Currency:** 
   - *Problem:* Priya used US dollars.
   - *My Fix:* If the currency is not INR, I flag it as `FOREIGN_CURRENCY`. It still gets saved, but the tag is there so we don't accidentally treat 1 dollar like 1 rupee.

4. **Math Errors:** 
   - *Problem:* One row's percentages added up to 110%.
   - *My Fix:* My split calculator throws an error if percentages don't equal exactly 100. The app catches the error, flags the row as `MATH_ERROR`, and skips it instead of breaking.
