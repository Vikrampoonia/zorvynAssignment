import { z } from "zod";

export const createPhoneNumberSchema = (message: string) =>
    z.string().regex(/^\d{10}$/, message);

export const createPositiveIdSchema = (message: string) =>
    z.coerce.number().int().positive(message);

export const paginationSchema = z.object({
    pageSize: z.coerce.number().int().positive().default(10),
    pageNumber: z.coerce.number().int().positive().default(1),
});