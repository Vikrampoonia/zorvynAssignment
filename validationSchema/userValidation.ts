import { z } from "zod";
import messages from "../models/messages.js";
import { USER_ROLES } from "../models/constants.js";
import { createPhoneNumberSchema, createPositiveIdSchema, paginationSchema } from "./commonValidation.js";

export const createUserSchema = z.object({
    name: z.string().trim().min(1, messages.user.nameCannotBeEmpty),
    phoneNumber: createPhoneNumberSchema(messages.user.phoneNumberMustBeValid),
    role: z.enum(USER_ROLES),
});

export const updateUserSchema = z.object({
    id: createPositiveIdSchema(messages.user.idMustBePositive),
    name: z.string().trim().min(1, messages.user.nameCannotBeEmpty).optional(),
    phoneNumber: createPhoneNumberSchema(messages.user.phoneNumberMustBeValid).optional(),
    role: z.enum(USER_ROLES).optional(),
}).refine(
    (data) => data.name !== undefined || data.phoneNumber !== undefined || data.role !== undefined,
    { message: messages.user.roleRequiredForUpdate }
);

export const deleteUserSchema = z.object({
    id: createPositiveIdSchema(messages.user.idMustBePositive),
});

export const getUserSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    role: z.enum(USER_ROLES).optional(),
}).merge(paginationSchema);
