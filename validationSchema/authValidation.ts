import { z } from "zod";
import messages from "../models/messages.js";
import { createPhoneNumberSchema } from "./commonValidation.js";

export const loginSchema = z.object({
    phoneNumber: createPhoneNumberSchema(messages.user.phoneNumberMustBeValid),
    otp: z.string().trim().min(1, messages.auth.otpCannotBeEmpty),
});

export const sendOtpSchema = z.object({
    phoneNumber: createPhoneNumberSchema(messages.user.phoneNumberMustBeValid),
});

export const verifyOtpSchema = z.object({
    phoneNumber: createPhoneNumberSchema(messages.user.phoneNumberMustBeValid),
    otp: z.string().trim().min(1, messages.auth.otpCannotBeEmpty),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().trim().min(1, messages.auth.refreshTokenCannotBeEmpty),
});