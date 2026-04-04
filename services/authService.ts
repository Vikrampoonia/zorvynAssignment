import crypto from "crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { Op } from "sequelize";
import { User } from "../models/user.js";
import { USER_STATUSES } from "../models/constants.js";
import type { UserRole } from "../models/constants.js";
import { AuthOtp } from "../models/authOtp.js";
import RefreshToken from "../models/refreshToken.js";
import messages from "../models/messages.js";

type LoginPayload = {
    phoneNumber: string;
    otp: string;
};

type OtpPayload = {
    phoneNumber: string;
};

type VerifyOtpPayload = {
    phoneNumber: string;
    otp: string;
};

type RefreshTokenPayload = {
    refreshToken: string;
};

type TokenPayload = {
    userId: number;
    name: string;
    phoneNumber: string;
    role: UserRole;
};

type RefreshTokenJwtPayload = TokenPayload & {
    tokenType: "refresh";
    jti: string;
};

type TokenBundle = {
    accessToken: string;
    refreshToken: string;
    user: TokenPayload;
};

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const buildTokenOptions = (expiresIn: NonNullable<SignOptions["expiresIn"]>) => ({
    expiresIn,
} satisfies SignOptions);

const toTokenExpiryDate = (expiresIn: NonNullable<SignOptions["expiresIn"]>) => {
    if (typeof expiresIn === "number") {
        return new Date(Date.now() + expiresIn * 1000);
    }

    const durationMatch = String(expiresIn).trim().match(/^(\d+)([smhd])$/i);

    if (!durationMatch) {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number(durationMatch[1]);
    const unit = durationMatch[2]?.toLowerCase();

    if (!unit) {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    const multiplier = multipliers[unit];

    if (!multiplier) {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    return new Date(Date.now() + value * multiplier);
};

const createJti = () => crypto.randomUUID();

class authService {

    async cleanupExpiredAuthData(): Promise<{ expiredOtpsDeleted: number; refreshTokensDeleted: number }> {
        const nowUtc = new Date();

        const expiredOtpsDeleted = await AuthOtp.destroy({
            where: {
                [Op.or]: [
                    {
                        expiresAt: {
                            [Op.lt]: nowUtc,
                        },
                    },
                    {
                        usedAt: {
                            [Op.ne]: null,
                        },
                    },
                ],
            },
        });

        const refreshTokensDeleted = await RefreshToken.destroy({
            where: {
                [Op.or]: [
                    {
                        expiresAt: {
                            [Op.lt]: nowUtc,
                        },
                    },
                    {
                        revokedAt: {
                            [Op.ne]: null,
                        },
                    },
                ],
            },
        });

        return {
            expiredOtpsDeleted,
            refreshTokensDeleted,
        };
    }

    async sendOtp({ phoneNumber }: OtpPayload): Promise<{ phoneNumber: string; otp: string; message: string }> {
        const user = await User.findOne({
            where: {
                phoneNumber,
                status: USER_STATUSES[0],
            },
        });

        if (!user) {
            throw new Error(messages.auth.activeUserNotFound);
        }

        const otp = createOtp();
        const nowUtc = new Date();
        const expiresAt = new Date(nowUtc.getTime() + 5 * 60 * 1000);

        await AuthOtp.destroy({
            where: {
                phoneNumber,
            },
        });

        await AuthOtp.create({
            phoneNumber,
            otp,
            verified: false,
            expiresAt,
            usedAt: null,
            createdAt: nowUtc,
            updatedAt: nowUtc,
        });

        return {
            phoneNumber,
            otp,
            message: messages.auth.otpGeneratedSuccessfully,
        };
    }

    async verifyOtp({ phoneNumber, otp }: VerifyOtpPayload): Promise<{ verified: boolean; message: string }> {
        const record = await AuthOtp.findOne({
            where: {
                phoneNumber,
            },
            order: [["createdAt", "DESC"]],
        });

        if (!record) {
            throw new Error(messages.auth.otpNotFound);
        }

        if (Date.now() > new Date(record.expiresAt).getTime()) {
            throw new Error(messages.auth.otpExpired);
        }

        if (record.otp !== otp) {
            throw new Error(messages.auth.invalidOtp);
        }

        record.verified = true;
        record.updatedAt = new Date();
        await record.save();

        return {
            verified: true,
            message: messages.auth.otpVerifiedSuccessfully,
        };
    }

    async login({ phoneNumber, otp }: LoginPayload): Promise<TokenBundle> {
        const record = await AuthOtp.findOne({
            where: {
                phoneNumber,
            },
            order: [["createdAt", "DESC"]],
        });

        if (!record) {
            throw new Error(messages.auth.otpNotFound);
        }

        if (Date.now() > new Date(record.expiresAt).getTime()) {
            throw new Error(messages.auth.otpExpired);
        }

        if (record.otp !== otp) {
            throw new Error(messages.auth.invalidOtp);
        }

        if (!record.verified) {
            throw new Error(messages.auth.otpNotVerified);
        }

        const user = await User.findOne({
            where: {
                phoneNumber,
                status: USER_STATUSES[0],
            },
        });

        if (!user) {
            throw new Error(messages.auth.activeUserNotFound);
        }

        const jwtSecret = process.env.JWT_SECRET;
        const refreshJwtSecret = process.env.JWT_REFRESH_SECRET ?? jwtSecret;

        if (!jwtSecret) {
            throw new Error(messages.auth.jwtSecretNotConfigured);
        }

        if (!refreshJwtSecret) {
            throw new Error(messages.auth.jwtRefreshSecretNotConfigured);
        }

        const tokenPayload: TokenPayload = {
            userId: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
        };

        const accessTokenOptions = buildTokenOptions((process.env.JWT_EXPIRES_IN ?? "15m") as NonNullable<SignOptions["expiresIn"]>);

        const refreshTokenOptions = buildTokenOptions((process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as NonNullable<SignOptions["expiresIn"]>);

        const accessToken = jwt.sign(tokenPayload, jwtSecret, accessTokenOptions);
        const refreshJti = createJti();
        const refreshTokenPayload: RefreshTokenJwtPayload = {
            ...tokenPayload,
            tokenType: "refresh",
            jti: refreshJti,
        };
        const refreshToken = jwt.sign(refreshTokenPayload, refreshJwtSecret, refreshTokenOptions);
        const refreshExpiresAt = toTokenExpiryDate(refreshTokenOptions.expiresIn);

        await RefreshToken.create({
            userId: user.id,
            jti: refreshJti,
            token: refreshToken,
            expiresAt: refreshExpiresAt,
            revokedAt: null,
            replacedByJti: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        record.usedAt = new Date();
        record.updatedAt = new Date();
        await record.save();

        return {
            accessToken,
            refreshToken,
            user: tokenPayload,
        };
    }

    async refreshToken({ refreshToken }: RefreshTokenPayload): Promise<TokenBundle> {
        const jwtSecret = process.env.JWT_SECRET;
        const refreshJwtSecret = process.env.JWT_REFRESH_SECRET ?? jwtSecret;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not configured");
        }

        if (!refreshJwtSecret) {
            throw new Error("JWT_REFRESH_SECRET is not configured");
        }

        const decoded = jwt.verify(refreshToken, refreshJwtSecret) as JwtPayload & RefreshTokenJwtPayload;

        if (!decoded.userId || !decoded.phoneNumber || !decoded.role || !decoded.name || decoded.tokenType !== "refresh" || !decoded.jti) {
            throw new Error(messages.auth.invalidRefreshTokenPayload);
        }

        const storedToken = await RefreshToken.findOne({
            where: {
                jti: decoded.jti,
                userId: decoded.userId,
            },
        });

        if (!storedToken) {
            throw new Error(messages.auth.refreshTokenNotFound);
        }

        if (storedToken.revokedAt) {
            throw new Error(messages.auth.refreshTokenRevoked);
        }

        if (Date.now() > new Date(storedToken.expiresAt).getTime()) {
            throw new Error(messages.auth.refreshTokenExpired);
        }

        const user = await User.findOne({
            where: {
                id: decoded.userId,
                phoneNumber: decoded.phoneNumber,
                status: USER_STATUSES[0],
            },
        });

        if (!user) {
            throw new Error(messages.auth.activeUserNotFound);
        }

        const tokenPayload: TokenPayload = {
            userId: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
        };

        const accessToken = jwt.sign(
            tokenPayload,
            jwtSecret,
            buildTokenOptions((process.env.JWT_EXPIRES_IN ?? "15m") as NonNullable<SignOptions["expiresIn"]>)
        );

        const rotatedRefreshJti = createJti();
        const rotatedRefreshPayload: RefreshTokenJwtPayload = {
            ...tokenPayload,
            tokenType: "refresh",
            jti: rotatedRefreshJti,
        };
        const refreshTokenOptions = buildTokenOptions((process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as NonNullable<SignOptions["expiresIn"]>);
        const rotatedRefreshToken = jwt.sign(rotatedRefreshPayload, refreshJwtSecret, refreshTokenOptions);
        const rotatedRefreshExpiresAt = toTokenExpiryDate(refreshTokenOptions.expiresIn);

        await RefreshToken.create({
            userId: user.id,
            jti: rotatedRefreshJti,
            token: rotatedRefreshToken,
            expiresAt: rotatedRefreshExpiresAt,
            revokedAt: null,
            replacedByJti: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        storedToken.revokedAt = new Date();
        storedToken.replacedByJti = rotatedRefreshJti;
        storedToken.updatedAt = new Date();
        await storedToken.save();

        return {
            accessToken,
            refreshToken: rotatedRefreshToken,
            user: tokenPayload,
        };
    }

    async logout(userId: number): Promise<{ success: boolean; message: string }> {
        await this.revokeRefreshTokensForUser(userId);
        return {
            success: true,
            message: messages.auth.refreshTokensRevokedSuccessfully,
        };
    }

    async revokeRefreshTokensForUser(userId: number): Promise<{ success: boolean; message: string }> {
        const tokens = await RefreshToken.findAll({
            where: {
                userId,
                revokedAt: null,
            },
        });

        const nowUtc = new Date();
        for (const token of tokens) {
            token.revokedAt = nowUtc;
            token.updatedAt = nowUtc;
            await token.save();
        }

        return {
            success: true,
            message: messages.auth.loggedOutSuccessfully,
        };
    }

};

export default new authService();