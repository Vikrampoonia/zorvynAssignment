import type { QueryValue } from "./commonTypes.js";

export type AuthLoginRequest = {
    phoneNumber: QueryValue;
    otp: QueryValue;
};

export type AuthSendOtpRequest = {
    phoneNumber: QueryValue;
};

export type AuthVerifyOtpRequest = {
    phoneNumber: QueryValue;
    otp: QueryValue;
};

export type AuthRefreshTokenRequest = {
    refreshToken: QueryValue;
};

export type AuthLogoutRequest = {
    userId: number | undefined;
};