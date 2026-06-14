# Shared Expenses App

A web app built to handle messy group expenses from a CSV file. It catches data errors, figures out exactly who owes what without guessing, and saves everything to a database. I built this for my placement assignment using a PERN-like stack.

## Tech Stack
- **Frontend:** React (Vite, standard JavaScript), Axios, plain CSS.
- **Backend:** Node.js, Express, Multer (for file uploads).
- **Database:** PostgreSQL (to meet the relational DB rule) and Prisma.
- **Auth:** JWT and bcrypt for real login security.

## How to run it

### 1. Database Setup
Make sure you have PostgreSQL running. Create a database.
In the `server` folder, make a `.env` file:
`DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/YOUR_DB_NAME?schema=public"`
`JWT_SECRET="my_secret_key"`

### 2. Start the Backend
Go to the server folder:
`cd server`
`npm install`
`npx prisma db push`
`npx prisma generate`
`npm run dev`
(Runs on port 5000)

### 3. Start the Frontend
Open a new terminal and go to the client folder:
`cd client`
`npm install`
`npm run dev`

### 4. Testing
1. Make an account on the login page.
2. Go to the Import tab and upload the `expenses_export.csv` file.
3. Look at the report to see what errors the app caught, then click Confirm to save the good rows.
4. Go to the Dashboard to see who owes who, and click on a name to see their exact history.
