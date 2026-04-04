import result from "../models/result.js";
import constants from "../models/constants.js";
import messages from "../models/messages.js";
import userService from "../services/userService.js";
import type { UserCreateRequest, UserDeleteRequest, UserGetRequest, UserUpdateRequest } from "../types/userTypes.js";
import { createUserSchema, deleteUserSchema, getUserSchema, updateUserSchema } from "../validationSchema/userValidation.js";

class userController {

    async createUser({ name, phoneNumber, role }: UserCreateRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = createUserSchema.safeParse({
                name,
                phoneNumber: String(phoneNumber ?? ""),
                role,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await userService.createUser({
                name: validationResult.data.name,
                phoneNumber: validationResult.data.phoneNumber,
                role: validationResult.data.role,
            });
            res.status = httpStatus.created;
            res.message = messages.user.createdSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = httpStatus.serverError;
        }
        return res;
    }

    async getUser({ id, name, phoneNumber, role, pageSize, pageNumber }: UserGetRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = getUserSchema.safeParse({
                id,
                name,
                phoneNumber,
                role,
                pageSize,
                pageNumber,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const safePageSize = Math.min(validationResult.data.pageSize, 50);
            const data = await userService.getUser({
                ...(validationResult.data.id !== undefined ? { id: validationResult.data.id } : {}),
                ...(validationResult.data.name !== undefined ? { name: validationResult.data.name } : {}),
                ...(validationResult.data.phoneNumber !== undefined ? { phoneNumber: validationResult.data.phoneNumber } : {}),
                ...(validationResult.data.role !== undefined ? { role: validationResult.data.role } : {}),
                pageSize: safePageSize,
                pageNumber: validationResult.data.pageNumber,
            });
            res.status = httpStatus.success;
            res.message = messages.user.fetchedSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = httpStatus.serverError;
        }
        return res;
    }

    async updateUser({ id, name, phoneNumber, role }: UserUpdateRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = updateUserSchema.safeParse({
                id,
                name: name === undefined ? undefined : String(name),
                phoneNumber: phoneNumber === undefined ? undefined : String(phoneNumber),
                role,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await userService.updateUser({
                id: validationResult.data.id,
                ...(validationResult.data.name !== undefined ? { name: validationResult.data.name } : {}),
                ...(validationResult.data.phoneNumber !== undefined ? { phoneNumber: validationResult.data.phoneNumber } : {}),
                ...(validationResult.data.role !== undefined ? { role: validationResult.data.role } : {}),
            });
            res.status = httpStatus.success;
            res.message = messages.user.updatedSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error && error.message === messages.user.notFound ? httpStatus.notFound : httpStatus.serverError;
        }
        return res;
    }

    async deleteUser({ id }: UserDeleteRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = deleteUserSchema.safeParse({ id });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await userService.deleteUser({ id: validationResult.data.id });
            res.status = httpStatus.success;
            res.message = messages.user.deactivatedSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error && error.message === messages.user.notFound ? httpStatus.notFound : httpStatus.serverError;
        }
        return res;
    }

};

export default new userController();