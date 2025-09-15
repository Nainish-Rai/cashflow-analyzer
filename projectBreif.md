i need to build a cashflow analyzer of a business based on their revenue data from multiple pricing plans and company wide spends data to recommend which pricing plans in the company can be tweaked to improve cashflow health of the business.

my tech stack is nextjs, typescript, vercel ai sdk

### Phase 1: The Data Foundation (Unchanged)

- **Primary Goal:** To ingest and structure all necessary financial data. This phase is the bedrock; the agent is useless without clean, reliable data.
- **Key Activities:**
  1.  **Project Scaffolding:** Initialize Next.js, TypeScript, Vercel Postgres.
  2.  **Schema Design:** Define the `revenue_transactions` and `expense_transactions` tables. The schema must be designed to efficiently support the queries our agent's tools will make (e.g., indexing on `plan_id`, `category`, and `timestamp`).
  3.  **Ingestion API:** Build the `/api/upload` route for CSV parsing and validation.
  4.  **Validation Logic:** Implement strict data validation. The agent must trust its data source.
- **Definition of Done:** I can upload revenue and expense CSVs. The data is correctly stored in the database. Malformed data is rejected. This phase remains the same because every great analyst needs good data.

---

### Phase 2: Building the Agent's Toolkit

- **Primary Goal:** To implement the deterministic, reliable functions (tools) that the agent will use to perceive and analyze the financial world. This is where we encapsulate all our business logic.
- **Key Activities:**
  1.  **Implement Data Retrieval Tools:** Code the actual logic for `listPricingPlansTool`, `getRevenueSummaryTool`, and `getExpenseSummaryTool`. These functions will query the database and return aggregated, structured data.
  2.  **Implement Core Calculation Tools:** This is the most critical part. Implement the logic for `calculateProfitabilityForPlanTool`, `calculateCashflowTrendTool`, and `findDataAnomaliesTool`. These are not just API endpoints; they are standalone, testable functions.
  3.  **Unit Testing:** Write unit tests for each tool. A tool like `calculateProfitabilityForPlanTool` must be 100% accurate. Test it with mock data to ensure its calculations are correct before letting the agent touch it.
  4.  **(Optional) Build the Dashboard:** The dashboard is now a _consumer_ of your tools. The UI charts can fetch their data from the same underlying functions the agent will use. This ensures consistency between what the user sees and what the agent analyzes.
- **Definition of Done:** All six tools (`list_pricing_plans`, `get_revenue_summary`, etc.) are implemented, unit-tested, and exported from `tools/financials.ts`. They can be called manually and return predictable, correct data.

---

### Phase 3: Agent Assembly & Orchestration

- **Primary Goal:** To bring the "mind" of the agent to life by combining the system prompt, the LLM, and the toolkit.
- **Key Activities:**
  1.  **Finalize the System Prompt:** Refine and lock in the `CASHFLOW_AGENT_SYSTEM_PROMPT`. This involves tuning the agent's persona, rules, and suggested workflow.
  2.  **Implement the Agent Host:** Create the main `cashflowAgent` function. This is where you'll use the Vercel AI SDK's `generateText` function, passing it the system prompt, the user's initial query, and the entire suite of tools you built in Phase 2.
  3.  **Develop the Frontend Interface:** The UI is no longer just a button that shows a final result. It needs to:
      - Take an initial text prompt from the user (e.g., "Give me a full cashflow analysis").
      - Call the `cashflowAgent` endpoint.
      - Display the agent's progress. This is key. Use the `onStepFinish` callback to show the user the agent's chain of thought: "Thinking...", "Using tool `get_revenue_summary`...", "Found 450 transactions...", etc.
      - Render the final, formatted recommendation.
- **Definition of Done:** A user can type a prompt, kick off the agent, see the agent's step-by-step progress (tool calls and reasoning), and receive a final analytical response in the UI.

---

### Phase 4: Hardening, UX Refinement & Launch

- **Primary Goal:** To make the agent interaction feel seamless, robust, and trustworthy before shipping.
- **Key Activities:**
  1.  **Agent-Centric UX:** Refine the streaming of the agent's steps. Make it clear and easy to follow. Handle edge cases, like when a tool returns an error or when the agent gets stuck in a loop.
  2.  **Implement Smart Caching:** The agent might call the same tool with the same parameters multiple times. Implement caching at the tool level. If `get_revenue_summary` for August is called, cache the result for a few minutes to reduce database load and improve agent speed.
  3.  **Error Handling & Observability:** What happens if a tool fails? The agent needs to be able to handle that gracefully. Log the entire agent run (all steps, tool calls, and results) so you can debug why it made a certain decision.
  4.  **End-to-End Testing & Deployment:** Test the full flow with various prompts. Test simple prompts ("How many plans do we have?") and complex prompts ("Which plan is dragging down our Q2 profitability and what should we do about it?"). Deploy to Vercel.
- **Definition of Done:** The application is deployed. The agent interaction is stable and provides clear feedback to the user throughout its run. Caching is working, and you have logs to trace and debug agent behavior.
