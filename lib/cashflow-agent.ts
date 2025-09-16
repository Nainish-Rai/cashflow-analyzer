// import { generateText, stepCountIs, streamText } from "ai";
// import { google, CASHFLOW_AGENT_SYSTEM_PROMPT } from "./config/agent-config";
// import {
//   getRevenueSummaryTool,
//   getExpenseSummaryTool,
//   listPricingPlansTool,
//   calculateProfitabilityForPlanTool,
//   calculateCashflowTrendTool,
//   findDataAnomaliesTool,
// } from "./tools/financials";
// import { ProgressLogger, ProgressOptions } from "./progress-logger";

// export interface CashflowAgentResponse {
//   response: string;
//   toolsUsed: string[];
//   analysisMetrics: {
//     totalRevenue?: number;
//     totalExpenses?: number;
//     netCashflow?: number;
//     plansAnalyzed?: number;
//     anomaliesFound?: number;
//   };
// }

// export async function cashflowAgent(
//   prompt: string,
//   progressOptions?: ProgressOptions
// ): Promise<CashflowAgentResponse> {
//   const progressLogger = new ProgressLogger(progressOptions);
//   const toolsUsed: string[] = [];
//   const analysisMetrics: CashflowAgentResponse["analysisMetrics"] = {};

//   try {
//     progressLogger.start(prompt);
//     progressLogger.step("Initializing Financial Analyst Agent");

//     const result = await streamText({
//       model: google("gemini-2.5-flash-lite"),
//       prompt,
//       system: CASHFLOW_AGENT_SYSTEM_PROMPT,
//       stopWhen: stepCountIs(50), // Allow multiple tool calls
//       tools: {
//         // Data Retrieval Tools
//         list_pricing_plans: listPricingPlansTool,
//         get_revenue_summary: getRevenueSummaryTool,
//         get_expense_summary: getExpenseSummaryTool,

//         // Core Calculation & Analysis Tools
//         calculate_profitability_for_plan: calculateProfitabilityForPlanTool,
//         calculate_cashflow_trend: calculateCashflowTrendTool,
//         find_data_anomalies: findDataAnomaliesTool,
//       },
//       onStepFinish(step) {
//         // Log tool calls and results
//         if (step.toolCalls && step.toolCalls.length > 0) {
//           step.toolCalls.forEach((toolCall) => {
//             progressLogger.toolCall(toolCall.toolName, toolCall.input);
//             if (!toolsUsed.includes(toolCall.toolName)) {
//               toolsUsed.push(toolCall.toolName);
//             }
//           });
//         }

//         if (step.toolResults && step.toolResults.length > 0) {
//           step.toolResults.forEach((toolResult) => {
//             progressLogger.toolResult(toolResult.toolName, toolResult.output);

//             // Extract key metrics from tool results
//             type RevenueSummary = { totalRevenue?: number };
//             type ExpenseSummary = { totalExpenses?: number };
//             type CashflowTrend = { totalNetCashflow?: number };
//             type PricingPlans = { totalPlans?: number };
//             type DataAnomalies = { anomaliesFound?: number };

//             if (toolResult.toolName === "get_revenue_summary") {
//               const result = toolResult.output as RevenueSummary;
//               if (result.totalRevenue) {
//                 analysisMetrics.totalRevenue = result.totalRevenue;
//               }
//             }
//             if (toolResult.toolName === "get_expense_summary") {
//               const result = toolResult.output as ExpenseSummary;
//               if (result.totalExpenses) {
//                 analysisMetrics.totalExpenses = result.totalExpenses;
//               }
//             }
//             if (toolResult.toolName === "calculate_cashflow_trend") {
//               const result = toolResult.output as CashflowTrend;
//               if (result.totalNetCashflow) {
//                 analysisMetrics.netCashflow = result.totalNetCashflow;
//               }
//             }
//             if (toolResult.toolName === "list_pricing_plans") {
//               const result = toolResult.output as PricingPlans;
//               if (result.totalPlans) {
//                 analysisMetrics.plansAnalyzed = result.totalPlans;
//               }
//             }
//             if (toolResult.toolName === "find_data_anomalies") {
//               const result = toolResult.output as DataAnomalies;
//               if (result.anomaliesFound) {
//                 analysisMetrics.anomaliesFound = result.anomaliesFound;
//               }
//             }
//           });
//         }

//         // Log step completion
//         progressLogger.step(`Completed step`);
//       },
//     });

//     progressLogger.complete(result.text);

//     return {
//       response: result.text,
//       toolsUsed,
//       analysisMetrics,
//     };
//   } catch (error) {
//     progressLogger.error(error);
//     throw error;
//   }
// }
