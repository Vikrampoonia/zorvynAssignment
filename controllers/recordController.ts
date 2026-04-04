import result from "../models/result.js";
import constants from "../models/constants.js";
import messages from "../models/messages.js";
import recordService from "../services/recordService.js";
import type { DashboardSummaryRequest, RecordCreateRequest, RecordDeleteRequest, RecordGetRequest, RecordUpdateRequest } from "../types/recordTypes.js";
import { createRecordSchema, dashboardSummarySchema, deleteRecordSchema, getRecordSchema, updateRecordSchema } from "../validationSchema/recordValidation.js";

class recordController {

    async createRecord({ userId, amount, type, category, date, notes }: RecordCreateRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = createRecordSchema.safeParse({
                userId,
                amount,
                type,
                category,
                date,
                notes,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await recordService.createRecord({
                userId: validationResult.data.userId,
                amount: validationResult.data.amount,
                type: validationResult.data.type,
                category: validationResult.data.category,
                date: validationResult.data.date,
                ...(validationResult.data.notes !== undefined ? { notes: validationResult.data.notes } : {}),
            });
            res.status = httpStatus.created;
            res.message = messages.record.createdSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = httpStatus.serverError;
        }
        return res;
    }

    async getRecord({ id, amount, date, category, type, notes, pageSize, pageNumber }: RecordGetRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = getRecordSchema.safeParse({
                id,
                amount,
                date,
                category,
                type,
                notes,
                pageSize,
                pageNumber,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const safePageSize = Math.min(validationResult.data.pageSize, 50);
            const data = await recordService.getRecord({
                ...(validationResult.data.id !== undefined ? { id: validationResult.data.id } : {}),
                ...(validationResult.data.amount !== undefined ? { amount: validationResult.data.amount } : {}),
                ...(validationResult.data.date !== undefined ? { date: validationResult.data.date } : {}),
                ...(validationResult.data.category !== undefined ? { category: validationResult.data.category } : {}),
                ...(validationResult.data.type !== undefined ? { type: validationResult.data.type } : {}),
                ...(validationResult.data.notes !== undefined ? { notes: validationResult.data.notes } : {}),
                pageSize: safePageSize,
                pageNumber: validationResult.data.pageNumber,
            });
            res.status = httpStatus.success;
            res.message = messages.record.fetchedSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = httpStatus.serverError;
        }
        return res;
    }

    async updateRecord({ id, userId, amount, type, category, date, notes }: RecordUpdateRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = updateRecordSchema.safeParse({
                id,
                userId,
                amount,
                type,
                category,
                date,
                notes,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await recordService.updateRecord({
                id: validationResult.data.id,
                ...(validationResult.data.userId !== undefined ? { userId: validationResult.data.userId } : {}),
                ...(validationResult.data.amount !== undefined ? { amount: validationResult.data.amount } : {}),
                ...(validationResult.data.type !== undefined ? { type: validationResult.data.type } : {}),
                ...(validationResult.data.category !== undefined ? { category: validationResult.data.category } : {}),
                ...(validationResult.data.date !== undefined ? { date: validationResult.data.date } : {}),
                ...(validationResult.data.notes !== undefined ? { notes: validationResult.data.notes } : {}),
            });
            res.status = httpStatus.success;
            res.message = messages.record.updatedSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error && error.message === messages.record.notFound ? httpStatus.notFound : httpStatus.serverError;
        }
        return res;
    }

    async deleteRecord({ id }: RecordDeleteRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = deleteRecordSchema.safeParse({ id });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await recordService.deleteRecord({ id: validationResult.data.id });
            res.status = httpStatus.success;
            res.message = messages.record.deletedSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = error instanceof Error && error.message === messages.record.notFound ? httpStatus.notFound : httpStatus.serverError;
        }
        return res;
    }

    async getDashBoardSummary({ startDate, endDate, trend }: DashboardSummaryRequest) {
        let res = new result();
        const { httpStatus } = constants;
        try {
            const validationResult = dashboardSummarySchema.safeParse({
                startDate,
                endDate,
                trend,
            });

            if (!validationResult.success) {
                res.status = httpStatus.badRequest;
                res.message = validationResult.error.issues[0]?.message ?? messages.generic.invalidRequestPayload;
                return res;
            }

            const data = await recordService.getDashBoardSummary({
                ...(validationResult.data.startDate !== undefined ? { startDate: validationResult.data.startDate } : {}),
                ...(validationResult.data.endDate !== undefined ? { endDate: validationResult.data.endDate } : {}),
                trend: validationResult.data.trend as "weekly" | "monthly",
            });
            res.status = httpStatus.success;
            res.message = messages.record.dashboardFetchedSuccessfully;
            res.data = data;
        } catch (error: unknown) {
            res.message = error instanceof Error ? error.message : messages.generic.internalServerError;
            res.status = httpStatus.serverError;
        }
        return res;
    }

};

export default new recordController();