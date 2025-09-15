i need to build a cashflow analyzer of a business based on their revenue data from multiple pricing plans and company wide spends data to recommend which pricing plans in the company can be tweaked to improve cashflow health of the business.

my tech stack is nextjs, typescript, vercel ai sdk

### Phase 1: The Data Pipeline & Foundation

- **Primary Goal:** To reliably ingest and structure all necessary financial data. If this phase fails, the entire project is built on sand.
- **Key Activities:**
  1.  **Project Scaffolding:** Initialize the Next.js/TypeScript project. Set up linting, formatting, and a basic project structure.
  2.  **Database Schema Design:** In Vercel Postgres, define two core tables: `revenue_transactions` and `expense_transactions`. Be meticulous with data types: use `DECIMAL` for currency, `TIMESTAMP WITH TIME ZONE` for dates, and `VARCHAR` for categories and plan IDs.
  3.  **Build the Ingestion API:** Create a Next.js API route (`/api/upload`) that handles `multipart/form-data` requests. It will accept CSV files.
  4.  **Develop the Parsing & Validation Logic:** Use a library like `papaparse` to stream and parse CSVs. This is the critical step: implement ruthless validation. Reject any file that doesn't match the exact expected columns. Validate data types row-by-row. Any row with a non-numeric amount or an invalid date gets logged and discarded.
- **Definition of Done:** I can successfully upload a revenue CSV and an expense CSV via the API. The data is parsed, validated, and stored correctly in the corresponding database tables. An attempt to upload a malformed CSV is rejected with a clear `400 Bad Request` error.

---

### Phase 2: The Visualization & Attribution Engine

- **Primary Goal:** To transform the raw, stored data into a coherent financial picture that a human can understand.
- **Key Activities:**
  1.  **Build Aggregation Endpoints:** Create API routes that query the database to provide aggregated data. For example: `/api/metrics/cashflow` which returns monthly total revenue and expenses, or `/api/metrics/revenue-by-plan`. These endpoints will do the heavy lifting with SQL `GROUP BY` and `SUM` functions.
  2.  **Develop the Dashboard UI:** Create the main dashboard page using Next.js. Use a charting library like Recharts or Chart.js to create the three core visualizations (Cashflow, Revenue by Plan, Spends by Category). Fetch data from the aggregation endpoints.
  3.  **Implement the MVP Attribution Model:** Write the core logic that assigns company-wide spending to each pricing plan. Start with the simple proportional model: `Plan A's Allocated Cost = Total Spends * (Plan A Revenue / Total Revenue)`. This calculation will power the "Profitability per Plan" metric.
- **Definition of Done:** The main dashboard loads and displays accurate charts based on the data ingested in Phase 1. A clear "Profitability" number (even if based on the simple model) is calculated and displayed for each pricing plan.

---

### Phase 3: The AI Recommendation Core

- **Primary Goal:** To integrate the LLM as a programmatic analyst that provides concrete, data-driven recommendations.
- **Key Activities:**
  1.  **Create the Analysis API Endpoint:** Build a new API route, `/api/analyze`. This endpoint will execute the logic from Phase 2 to generate a complete financial summary.
  2.  **Engineer the Master Prompt:** This is the most important task of the phase. Craft a detailed system prompt that instructs the LLM to act as an experienced CFO. The prompt will define the structure of the JSON data it's about to receive and, crucially, the exact JSON schema of the response you expect back (e.g., an array of objects with `recommendation`, `reasoning`, and `impact` fields).
  3.  **Integrate the Vercel AI SDK:** Use the SDK, specifically the `generateObject` function, to call your chosen LLM (like GPT-4o or Claude 3 Opus). Pass the financial summary as context and your desired Zod schema for the response. This enforces a structured, predictable output.
  4.  **Render the Recommendations:** On the frontend, add a button that calls the `/api/analyze` endpoint. When the structured JSON response is received, render it in a clean, easy-to-read format.
- **Definition of Done:** A user can click a button on the dashboard, which triggers the AI analysis. Within a few seconds, at least two specific, actionable recommendations appear on the screen, directly related to the data provided.

---

### Phase 4: Hardening & MVP Launch

- **Primary Goal:** To turn the functional prototype into a stable, usable tool and get it into the world.
- **Key Activities:**
  1.  **Focus on User Experience (UX):** Add essential UX features. This includes loading states for charts and the AI analysis, clear success messages after uploads, and helpful error messages for API failures. A tool that doesn't communicate what it's doing feels broken.
  2.  **Implement Caching:** The analysis API call will be slow and potentially expensive. Implement basic caching. If the underlying data hasn't changed since the last analysis, return the cached result instead of calling the LLM again.
  3.  **End-to-End Testing:** Manually run through the entire user flow at least five times with different datasets. Start with a clean slate, upload data, verify the dashboard, generate recommendations, and look for bugs.
  4.  **Deploy:** Push the final code to your Vercel project's main branch. Configure the production environment variables.
- **Definition of Done:** The application is live at a public URL. It is stable, responsive, and can successfully complete the entire workflow from data upload to recommendation without crashing. You have a shareable link for your first users.
