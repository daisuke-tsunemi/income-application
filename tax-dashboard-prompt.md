# Implementation Guide for Tax Return & Withholding Dashboard

## 1. Objective and Requirements
You are an expert Next.js (App Router) and TypeScript engineer.
Please transform the current repository (previously a CRM dashboard) into a "Tax Return and Withholding Dashboard" for sole proprietors. 
The main purpose of this system is to aggregate daily records and display them in a format that makes it easy to transcribe numbers into the e-Tax system (Japan's online tax portal) during tax filing season.

*Constraint: We are NOT using `shadcn/ui`. Please reuse the existing raw React components and layout styled with Tailwind CSS from the current repository.*

## 2. API Schema and Type Definitions (TypeScript)
Create or update `src/types/microcms.ts` to include the following 5 API schemas. (Make sure to include common microCMS fields: `id`, `createdAt`, `updatedAt`, `publishedAt`, `revisedAt`).

1. **Client (`Client`)**
   - `name`: string
   - `address`: string (optional)
   - `invoice_number`: string (default: "T")
   - `has_withholding`: boolean
   - `note`: string (optional)

2. **Category (`Category`)**
   - `name`: string
   - `description`: string (optional)

3. **Income (`Income`)**
   - `date`: string (ISO8601)
   - `client`: Client (Content Reference)
   - `amount`: number
   - `tax_withheld`: number
   - `status`: "未入金" (Unpaid) | "入金済" (Paid)
   - `is_verified`: boolean (Checked against the official payment slip)
   - `memo`: string (optional)

4. **Expense (`Expense`)**
   - `date`: string (ISO8601)
   - `category`: Category (Content Reference)
   - `payee`: string
   - `payment_method`: "クレジットカード" | "現金" | "銀行振込" | "事業主借（個人の財布から支払）"
   - `amount`: number
   - `business_ratio`: number (default: 100)
   - `receipt_images`: Array<{ url: string, width: number, height: number }> (Multiple images)
   - `note`: string (optional)

5. **Deduction (`Deduction`)**
   - `date`: string (ISO8601)
   - `deduction_type`: "社会保険料（国保・年金等）" | "生命保険料" | "地震保険料" | "小規模企業共済等掛金" | "医療費" | "寄付金（ふるさと納税）"
   - `payee`: string
   - `amount`: number
   - `certificate_image`: { url: string, width: number, height: number } (Image, optional)
   - `note`: string (optional)

## 3. Data Fetching Utility
Update `src/lib/microcms.ts` (or create a new utility file) to fetch the above 5 endpoints using `microcms-js-sdk`. Create list-fetching functions (e.g., `getIncomes`, `getExpenses`) with a limit of 100 for now.

## 4. Routing and Sidebar Updates
Update the existing sidebar navigation to the following structure:
- Home (`/`)
- Incomes & Withholding (`/incomes`)
- Expenses & Blue Return Summary (`/expenses`)
- Income Deductions (`/deductions`)

## 5. Page Implementation Requirements

### A. `/incomes` (Income & Withholding Tax Reconciliation View)
- Goal: To transcribe data into "Schedule 2" of the tax return.
- Group the fetched `Income` data by **Client (`client.name`)**.
- Display a table showing the annual total `amount` and total `tax_withheld` for each client.
- Add visual indicators (e.g., badges) for `is_verified` status.

### B. `/expenses` (Blue Return Financial Statement View)
- Goal: To transcribe data into the Income Statement of the Blue Return.
- Group the fetched `Expense` data by **Category (`category.name`)**.
- Display the annual totals for each category.
- **CRITICAL LOGIC:** You must calculate and display the **"Business Expense Amount"** using the formula: `amount * (business_ratio / 100)`. This calculated value is the actual number needed for tax filing.

### C. `/deductions` (Income Deduction View)
- Goal: To transcribe data into the Income Deductions section.
- Group the fetched `Deduction` data by **Deduction Type (`deduction_type`)**.
- Display a table showing the type, payee, and amount.
- If a `certificate_image` exists, provide a link or thumbnail to view the document.

### D. `/` (Home / Summary Dashboard)
- Fetch all relevant data and display 4 main KPI cards at the top:
  1. Total Annual Income
  2. Total Withholding Tax
  3. Total Business Expenses (calculated using business_ratio)
  4. Total Deductions
- Display an alert list of unverified incomes (`is_verified === false`).

### E. Global UI Annotations & Charts
- **Annotations:** Display a clear disclaimer/note on the Dashboard and relevant pages indicating: *"Note: This system is designed specifically to aggregate data for easy transcription to e-Tax forms. It is NOT a substitute for formal double-entry bookkeeping (debits/credits) required by statutory ledgers."* (Format this nicely using Tailwind CSS).
- **Charts:** If necessary and effective for visualizing the financial status, please create and insert charts (e.g., using Recharts) such as "Monthly Income Trends" or "Expense Breakdown by Category".

## 6. Implementation Steps and Guidelines
1. Start with type definitions and API fetching logic.
2. Ensure the layout is responsive, clean, and data-dense.
3. If you encounter missing data or need dummy data during development, feel free to mock it temporarily, but the final code should wire up to the microCMS fetching functions.