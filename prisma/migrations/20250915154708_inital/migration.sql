-- CreateTable
CREATE TABLE "public"."revenue_transactions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "planId" VARCHAR(255) NOT NULL,
    "category" VARCHAR(255),
    "description" VARCHAR(1000),
    "customerId" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "revenue_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expense_transactions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "vendor" VARCHAR(255),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "expense_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "revenue_transactions_date_idx" ON "public"."revenue_transactions"("date");

-- CreateIndex
CREATE INDEX "revenue_transactions_planId_idx" ON "public"."revenue_transactions"("planId");

-- CreateIndex
CREATE INDEX "expense_transactions_date_idx" ON "public"."expense_transactions"("date");

-- CreateIndex
CREATE INDEX "expense_transactions_category_idx" ON "public"."expense_transactions"("category");
