import { Decimal } from "@prisma/client/runtime/library";

// Helper function to convert Decimal to number for JSON serialization
export const decimalToNumber = (decimal: Decimal): number => {
  return parseFloat(decimal.toString());
};

// Helper function to calculate date ranges
export const getDateRange = (
  period?: string,
  startDate?: string,
  endDate?: string
): { startDate: Date; endDate: Date } => {
  // If custom dates are provided, use them
  if (startDate && endDate) {
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
  }

  // If only custom start date is provided, use current date as end
  if (startDate && !endDate) {
    return {
      startDate: new Date(startDate),
      endDate: new Date(),
    };
  }

  // If only custom end date is provided, default to 30 days before end date
  if (!startDate && endDate) {
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(end.getDate() - 30);
    return {
      startDate: start,
      endDate: end,
    };
  }

  // Use predefined periods
  const now = new Date();
  const calculatedStartDate = new Date();

  switch (period) {
    case "last_30_days":
      calculatedStartDate.setDate(now.getDate() - 30);
      break;
    case "last_90_days":
      calculatedStartDate.setDate(now.getDate() - 90);
      break;
    case "last_6_months":
      calculatedStartDate.setMonth(now.getMonth() - 6);
      break;
    case "last_year":
      calculatedStartDate.setFullYear(now.getFullYear() - 1);
      break;
    case "current_month":
      calculatedStartDate.setDate(1);
      calculatedStartDate.setHours(0, 0, 0, 0);
      break;
    case "current_year":
      calculatedStartDate.setMonth(0, 1);
      calculatedStartDate.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      calculatedStartDate.setDate(now.getDate() - 1);
      calculatedStartDate.setHours(0, 0, 0, 0);
      return {
        startDate: calculatedStartDate,
        endDate: new Date(
          calculatedStartDate.getTime() + 24 * 60 * 60 * 1000 - 1
        ),
      };
    case "last_week":
      calculatedStartDate.setDate(now.getDate() - 7);
      break;
    case "last_month":
      calculatedStartDate.setMonth(now.getMonth() - 1);
      break;
    case "last_quarter":
      calculatedStartDate.setMonth(now.getMonth() - 3);
      break;
    default:
      calculatedStartDate.setDate(now.getDate() - 30); // Default to 30 days
  }

  return { startDate: calculatedStartDate, endDate: now };
};
