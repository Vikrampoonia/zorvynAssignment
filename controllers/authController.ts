import result from "../models/result.js";
import constants from "../models/constants.js";
import messages from "../models/messages.js";
import authService from "../services/authService.js";
import type { AuthLoginRequest, AuthLogoutRequest, AuthRefreshTokenRequest, AuthSendOtpRequest, AuthVerifyOtpRequest } from "../types/authTypes.js";
import { loginSchema, refreshTokenSchema, sendOtpSchema, verifyOtpSchema } from "../validationSchema/authValidation.js";

const resolveAuthErrorStatus = (errorMessage: string, httpStatus: typeof constants.httpStatus) => {
    const badRequestMessages = new Set([
        messages.auth.invalidUserId,
        messages.auth.otpCannotBeEmpty,
        messages.auth.refreshTokenCannotBeEmpty,
    ]);

    const unauthorizedMessages = new Set([
        messages.auth.activeUserNotFound,
        messages.auth.otpNotFound,
        messages.auth.otpExpired,
        messages.auth.invalidOtp,
        messages.auth.otpNotVerified,
        messages.auth.refreshTokenNotFound,
        messages.auth.refreshTokenRevoked,
        messages.auth.refreshTokenExpired,
        messages.auth.invalidRefreshTokenPayload,
    ]);

    if (badRequestMessages.has(errorMessage)) {
        return httpStatus.badRequest;
    }

    if (unauthorizedMessages.has(errorMessage)) {
        return httpStatus.unauthorized;
    }

    return httpStatus.serverError;
};

class authController {

    async login({ phoneNumber, otp }: AuthLoginRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = loginSchema.safeParse({
                phoneNumber: String(phoneNumber ?? ""),
                otp,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await authService.login({
                phoneNumber: validationResult.data.phoneNumber,
                otp: validationResult.data.otp,
            });
            res.status = httpStatus.success;
            res.message = messages.auth.loginSuccessful;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error ? resolveAuthErrorStatus(error.message, httpStatus) : httpStatus.serverError;
        }
        return res;
    }

    async sendOtp({ phoneNumber }: AuthSendOtpRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = sendOtpSchema.safeParse({
                phoneNumber: String(phoneNumber ?? ""),
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await authService.sendOtp({
                phoneNumber: validationResult.data.phoneNumber,
            });
            res.status = httpStatus.success;
            res.message = data.message;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error ? resolveAuthErrorStatus(error.message, httpStatus) : httpStatus.serverError;
        }
        return res;
    }

    async verifyOtp({ phoneNumber, otp }: AuthVerifyOtpRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = verifyOtpSchema.safeParse({
                phoneNumber: String(phoneNumber ?? ""),
                otp,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await authService.verifyOtp({
                phoneNumber: validationResult.data.phoneNumber,
                otp: validationResult.data.otp,
            });
            res.status = httpStatus.success;
            res.message = data.message;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error ? resolveAuthErrorStatus(error.message, httpStatus) : httpStatus.serverError;
        }
        return res;
    }

    async refreshToken({ refreshToken }: AuthRefreshTokenRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = refreshTokenSchema.safeParse({
                refreshToken,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await authService.refreshToken({
                refreshToken: validationResult.data.refreshToken,
            });
            res.status = httpStatus.success;
            res.message = messages.auth.tokenRefreshedSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error ? resolveAuthErrorStatus(error.message, httpStatus) : httpStatus.serverError;
        }
        return res;
    }

    async logout({ userId }: AuthLogoutRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const numericUserId = Number(userId);

            if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
                res.status = httpStatus.badRequest;
                res.message = messages.auth.invalidUserId;
                return res;
            }

            const data = await authService.logout(numericUserId);
            res.status = httpStatus.success;
            res.message = data.message;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error ? resolveAuthErrorStatus(error.message, httpStatus) : httpStatus.serverError;
        }
        return res;
    }
};

export default new authController();