class Messages {
    generic: {
        invalidRequestPayload: string;
        internalServerError: string;
    };

    auth: {
        loginSuccessful: string;
        otpGeneratedSuccessfully: string;
        otpVerifiedSuccessfully: string;
        tokenRefreshedSuccessfully: string;
        loggedOutSuccessfully: string;
        otpCannotBeEmpty: string;
        refreshTokenCannotBeEmpty: string;
        activeUserNotFound: string;
        otpNotFound: string;
        otpExpired: string;
        invalidOtp: string;
        otpNotVerified: string;
        jwtSecretNotConfigured: string;
        jwtRefreshSecretNotConfigured: string;
        invalidUserId: string;
        refreshTokenNotFound: string;
        refreshTokenRevoked: string;
        refreshTokenExpired: string;
        invalidRefreshTokenPayload: string;
        refreshTokensRevokedSuccessfully: string;
    };

    user: {
        createdSuccessfully: string;
        updatedSuccessfully: string;
        deactivatedSuccessfully: string;
        fetchedSuccessfully: string;
        nameCannotBeEmpty: string;
        phoneNumberMustBeValid: string;
        roleRequiredForUpdate: string;
        idMustBePositive: string;
        notFound: string;
    };

    record: {
        createdSuccessfully: string;
        updatedSuccessfully: string;
        deletedSuccessfully: string;
        fetchedSuccessfully: string;
        dashboardFetchedSuccessfully: string;
        categoryCannotBeEmpty: string;
        amountMustBeGreaterThanZero: string;
        userIdMustBePositive: string;
        idMustBePositive: string;
        atLeastOneFieldRequiredToUpdate: string;
        trendWeeklyOrMonthly: string;
        notFound: string;
    };

    system: {
        serverRunning: string;
        apiRouteHint: string;
        rootRouteHint: string;
        authCleanupDeletedRows: string;
        authCleanupFailed: string;
    };

    constructor() {
        this.generic = {
            invalidRequestPayload: "Invalid request payload",
            internalServerError: "Internal server error",
        };

        this.auth = {
            loginSuccessful: "Login successful",
            otpGeneratedSuccessfully: "OTP generated successfully",
            otpVerifiedSuccessfully: "OTP verified successfully",
            tokenRefreshedSuccessfully: "Token refreshed successfully",
            loggedOutSuccessfully: "Logged out successfully",
            otpCannotBeEmpty: "otp cannot be empty",
            refreshTokenCannotBeEmpty: "refreshToken cannot be empty",
            activeUserNotFound: "Active user not found",
            otpNotFound: "OTP not found",
            otpExpired: "OTP expired",
            invalidOtp: "Invalid OTP",
            otpNotVerified: "OTP is not verified",
            jwtSecretNotConfigured: "JWT_SECRET is not configured",
            jwtRefreshSecretNotConfigured: "JWT_REFRESH_SECRET is not configured",
            invalidUserId: "Invalid user id",
            refreshTokenNotFound: "Refresh token not found",
            refreshTokenRevoked: "Refresh token has been revoked",
            refreshTokenExpired: "Refresh token expired",
            invalidRefreshTokenPayload: "Invalid refresh token payload",
            refreshTokensRevokedSuccessfully: "Refresh tokens revoked successfully",
        };

        this.user = {
            createdSuccessfully: "User created successfully",
            updatedSuccessfully: "User updated successfully",
            deactivatedSuccessfully: "User deactivated successfully",
            fetchedSuccessfully: "Users fetched successfully",
            nameCannotBeEmpty: "name cannot be empty",
            phoneNumberMustBeValid: "phoneNumber must be a valid 10 digit number",
            roleRequiredForUpdate: "At least one field is required to update (name, phoneNumber, role)",
            idMustBePositive: "id must be a positive number",
            notFound: "User not found",
        };

        this.record = {
            createdSuccessfully: "Record created successfully",
            updatedSuccessfully: "Record updated successfully",
            deletedSuccessfully: "Record deleted successfully",
            fetchedSuccessfully: "Records fetched successfully",
            dashboardFetchedSuccessfully: "Dashboard summary fetched successfully",
            categoryCannotBeEmpty: "category cannot be empty",
            amountMustBeGreaterThanZero: "amount must be greater than 0",
            userIdMustBePositive: "userId must be a positive number",
            idMustBePositive: "id must be a positive number",
            atLeastOneFieldRequiredToUpdate: "At least one field is required to update",
            trendWeeklyOrMonthly: "trend must be weekly or monthly",
            notFound: "Record not found",
        };

        this.system = {
            serverRunning: "Zorvyn Finance API Server is running!",
            apiRouteHint: "Test the API: http://localhost:",
            rootRouteHint: "Test the root: http://localhost:",
            authCleanupDeletedRows: "[auth-cleanup] deleted",
            authCleanupFailed: "[auth-cleanup] cleanup failed:",
        };
    }
}

export default new Messages();