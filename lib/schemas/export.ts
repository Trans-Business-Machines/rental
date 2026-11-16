import z from "zod";

// Shared pieces for export filter schemas
export const optionalDay = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional();

// yyyy-MM-dd strings compare correctly as plain strings
export const isOrderedRange = (from?: string, to?: string) => !from || !to || from <= to;
