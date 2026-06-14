# Why I made these decisions

### 1. Postgres instead of MongoDB
I normally use MongoDB for my personal projects. But the rules clearly said no NoSQL. So I spent time setting up PostgreSQL and used Prisma to make it easier to talk to the database.

### 2. Not crashing on bad data
The prompt said a crashed import is a failing answer. Instead of just throwing a backend error when the CSV is weird, I made an "Import Report" screen. It puts the good rows in one list and the bad rows in another list, showing the user exactly what went wrong.

### 3. The Math Engine (Solving Rohan's request)
Rohan didn't want "magic numbers". To fix this, I made a backend function that calculates the exact amount everyone owes down to the decimal point. If 100 rupees is split 3 ways, the function gives the last person the extra 1 cent so it always balances perfectly. These exact numbers are saved in the DB so they can be audited later.

### 4. Real Login System
The requirement just said "Login module". I could have just made a fake dropdown to select a user, but I decided to build a real JWT auth system with bcrypt password hashing to show I can build secure features.
