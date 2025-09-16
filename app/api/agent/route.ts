import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
import {
  google,
  CASHFLOW_AGENT_SYSTEM_PROMPT,
} from "@/lib/config/agent-config";
import {
  getRevenueSummaryTool,
  getExpenseSummaryTool,
  listPricingPlansTool,
  calculateProfitabilityForPlanTool,
  calculateCashflowTrendTool,
  findDataAnomaliesTool,
} from "@/lib/tools/financials";

export const maxDuration = 60; // Allow up to 60 seconds for complex analysis

export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    // Stream the agent response with tools
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: CASHFLOW_AGENT_SYSTEM_PROMPT,
      stopWhen: stepCountIs(50),
      messages: convertToModelMessages(messages),
      tools: {
        // Data Retrieval Tools
        list_pricing_plans: listPricingPlansTool,
        get_revenue_summary: getRevenueSummaryTool,
        get_expense_summary: getExpenseSummaryTool,

        // Core Calculation & Analysis Tools
        calculate_profitability_for_plan: calculateProfitabilityForPlanTool,
        calculate_cashflow_trend: calculateCashflowTrendTool,
        find_data_anomalies: findDataAnomaliesTool,
      },
      onStepFinish(step) {
        // Log tool calls and results

        if (step.toolCalls && step.toolCalls.length > 0) {
          step.toolCalls.forEach((toolCall) => {
            console.log(
              `Tool called: ${toolCall.toolName} with input:`,
              toolCall.input
            );
          });
        }
      },
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        // Attach metadata for tool usage tracking
        if (part.type === "finish") {
          return {
            finishedAt: Date.now(),
            usage: part.totalUsage,
          };
        }
      },
    });
  } catch (error) {
    console.error("Cashflow agent error:", error);

    // Return a proper error response for streaming
    const errorResult = streamText({
      model: google("gemini-2.5-flash-lite"),
      prompt:
        "I encountered an error while analyzing your cashflow data. Please try again.",
    });

    return errorResult.toUIMessageStreamResponse();
  }
}
