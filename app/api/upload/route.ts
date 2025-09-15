import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import Papa from "papaparse";

const prisma = new PrismaClient();

const REVENUE_COLUMNS = [
  "amount",
  "date",
  "planId",
  "category",
  "description",
  "customerId",
];
const EXPENSE_COLUMNS = [
  "amount",
  "date",
  "category",
  "description",
  "vendor",
  "isRecurring",
];

interface RevenueRow {
  amount: string;
  date: string;
  planId: string;
  category?: string;
  description?: string;
  customerId?: string;
}

interface ExpenseRow {
  amount: string;
  date: string;
  category: string;
  description?: string;
  vendor?: string;
  isRecurring?: string;
}

type ValidRevenueData = {
  amount: number;
  date: Date;
  planId: string;
  category: string | null;
  description: string | null;
  customerId: string | null;
};

type ValidExpenseData = {
  amount: number;
  date: Date;
  category: string;
  description: string | null;
  vendor: string | null;
  isRecurring: boolean;
};

function validateRevenueRow(row: RevenueRow, index: number): boolean {
  if (!row.amount || isNaN(Number(row.amount))) {
    console.log(`Row ${index}: Invalid amount: ${row.amount}`);
    return false;
  }

  if (!row.date || isNaN(Date.parse(row.date))) {
    console.log(`Row ${index}: Invalid date: ${row.date}`);
    return false;
  }

  if (!row.planId?.trim()) {
    console.log(`Row ${index}: Missing planId`);
    return false;
  }

  return true;
}

function validateExpenseRow(row: ExpenseRow, index: number): boolean {
  if (!row.amount || isNaN(Number(row.amount))) {
    console.log(`Row ${index}: Invalid amount: ${row.amount}`);
    return false;
  }

  if (!row.date || isNaN(Date.parse(row.date))) {
    console.log(`Row ${index}: Invalid date: ${row.date}`);
    return false;
  }

  if (!row.category?.trim()) {
    console.log(`Row ${index}: Missing category`);
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!type || !["revenue", "expense"].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "revenue" or "expense"' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      );
    }

    const text = await file.text();

    return new Promise<NextResponse>((resolve) => {
      const validRows: (ValidRevenueData | ValidExpenseData)[] = [];
      let invalidRowCount = 0;

      Papa.parse<RevenueRow | ExpenseRow>(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const expectedColumns =
              type === "revenue" ? REVENUE_COLUMNS : EXPENSE_COLUMNS;

            if (
              !results.meta.fields ||
              !expectedColumns.every((col) =>
                results.meta.fields!.includes(col)
              )
            ) {
              resolve(
                NextResponse.json(
                  {
                    error: `Invalid columns. Expected: ${expectedColumns.join(
                      ", "
                    )}. Found: ${results.meta.fields?.join(", ") || "none"}`,
                  },
                  { status: 400 }
                )
              );
              return;
            }

            results.data.forEach((row, index: number) => {
              let isValid = false;

              if (type === "revenue") {
                isValid = validateRevenueRow(row as RevenueRow, index + 1);
                if (isValid) {
                  const r = row as RevenueRow;
                  validRows.push({
                    amount: Number(r.amount),
                    date: new Date(r.date),
                    planId: r.planId.trim(),
                    category: r.category?.trim() || null,
                    description: r.description?.trim() || null,
                    customerId: r.customerId?.trim() || null,
                  });
                }
              } else {
                isValid = validateExpenseRow(row as ExpenseRow, index + 1);
                if (isValid) {
                  const e = row as ExpenseRow;
                  validRows.push({
                    amount: Number(e.amount),
                    date: new Date(e.date),
                    category: e.category.trim(),
                    description: e.description?.trim() || null,
                    vendor: e.vendor?.trim() || null,
                    isRecurring:
                      e.isRecurring === "true" || e.isRecurring === "1",
                  });
                }
              }

              if (!isValid) {
                invalidRowCount++;
              }
            });

            if (validRows.length === 0) {
              resolve(
                NextResponse.json(
                  { error: "No valid rows found" },
                  { status: 400 }
                )
              );
              return;
            }

            if (type === "revenue") {
              await prisma.revenueTransaction.createMany({
                data: validRows as ValidRevenueData[],
              });
            } else {
              await prisma.expenseTransaction.createMany({
                data: validRows as ValidExpenseData[],
              });
            }

            resolve(
              NextResponse.json({
                message: "File uploaded successfully",
                validRows: validRows.length,
                invalidRows: invalidRowCount,
                totalProcessed: validRows.length + invalidRowCount,
              })
            );
          } catch (error) {
            console.error("Database error:", error);
            resolve(
              NextResponse.json(
                { error: "Database insertion failed" },
                { status: 500 }
              )
            );
          }
        },
        error: (error: Error) => {
          console.error("CSV parsing error:", error);
          resolve(
            NextResponse.json(
              { error: "Failed to parse CSV file" },
              { status: 400 }
            )
          );
        },
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
