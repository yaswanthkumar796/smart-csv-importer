# AI Usage

**Tools used:** I used an AI coding agent and Gemini to help plan the architecture and write out the boilerplate code quickly so I could finish in 2 days.

## 3 times the AI got it wrong and I had to fix it:

### 1. It tried to force TypeScript on me
When I asked the AI to set up the React client and Prisma, it automatically created `.tsx` files and a `tsconfig.json`. I wanted to stick to plain standard JavaScript so I wouldn't waste time fixing type errors during the live review. I had to tell it to delete the client folder and recreate it using standard Vite JS.

### 2. Writing bad React logic for the Dashboard
When we were building the audit trail, the AI wrote code that fetched every single person's entire transaction history all at once when the dashboard loaded. I realized this would be super slow if the database got big. I changed the code so it only fetches a specific person's history when you actually click on their name.

### 3. Just printing code instead of working
A few times early on, the AI just printed out the terminal commands and code in the chat instead of actually making the files in my workspace. I had to update my prompts to be way more strict, telling it "Do not just output code, use your tools to actually create the files."
