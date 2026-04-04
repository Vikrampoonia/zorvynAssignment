import { z } from "zod";
import messages from "../models/messages.js";
import { RECORD_TYPES } from "../models/constants.js";
import { createPositiveIdSchema, paginationSchema } from "./commonValidation.js";

export const createRecordSchema = z.object({
    userId: createPositiveIdSchema(messages.record.userIdMustBePositive),
    amount: z.coerce.number().positive(messages.record.amountMustBeGreaterThanZero),
    type: z.enum(RECORD_TYPES),
    category: z.string().trim().min(1, messages.record.categoryCannotBeEmpty),
    date: z.coerce.date(),
    notes: z.string().trim().optional(),
});

export const updateRecordSchema = z.object({
    id: createPositiveIdSchema(messages.record.idMustBePositive),
    userId: createPositiveIdSchema(messages.record.userIdMustBePositive).optional(),
    amount: z.coerce.number().positive(messages.record.amountMustBeGreaterThanZero).optional(),
    type: z.enum(RECORD_TYPES).optional(),
    category: z.string().trim().min(1, messages.record.categoryCannotBeEmpty).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().trim().optional(),
}).refine(
    (data) =>
        data.userId !== undefined
        || data.amount !== undefined
        || data.type !== undefined
        || data.category !== undefined
        || data.date !== undefined
        || data.notes !== undefined,
    { message: messages.record.atLeastOneFieldRequiredToUpdate }
);

export const deleteRecordSchema = z.object({
    id: createPositiveIdSchema(messages.record.idMustBePositive),
});

export const getRecordSchema = z.object({
    id: createPositiveIdSchema(messages.record.idMustBePositive).optional(),
    amount: z.coerce.number().positive(messages.record.amountMustBeGreaterThanZero).optional(),
    date: z.coerce.date().optional(),
    category: z.string().trim().min(1, messages.record.categoryCannotBeEmpty).optional(),
    type: z.enum(RECORD_TYPES).optional(),
    notes: z.string().trim().min(1, messages.record.notesCannotBeEmpty).optional(),
}).merge(paginationSchema);

export const dashboardSummarySchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    trend: z.string().refine((value) => value === "weekly" || value === "monthly", {
        message: messages.record.trendWeeklyOrMonthly,
    }),
});