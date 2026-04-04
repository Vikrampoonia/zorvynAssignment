
import { Op } from "sequelize";
import { RecordModel } from "../models/record.js";
import type { RecordType } from "../models/constants.js";
import messages from "../models/messages.js";

type CreateRecordPayload = {
    userId: number;
    amount: number;
    type: RecordType;
    category: string;
    date: Date;
    notes?: string;
};

type UpdateRecordPayload = {
    id: number;
    userId?: number;
    amount?: number;
    type?: RecordType;
    category?: string;
    date?: Date;
    notes?: string;
};

type DeleteRecordPayload = {
    id: number;
};

type GetRecordPayload = {
    id?: number;
    date?: Date;
    category?: string;
    type?: RecordType;
    pageSize: number;
    pageNumber: number;
};

type DashboardSummaryPayload = {
    startDate?: Date;
    endDate?: Date;
    trend: "weekly" | "monthly";
};

class recordService {

    async createRecord(payload: CreateRecordPayload) {
        const nowUtc = new Date();
        return RecordModel.create({
            userId: payload.userId,
            amount: String(payload.amount),
            type: payload.type,
            category: payload.category,
            date: payload.date,
            ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
            createdAt: nowUtc,
            updatedAt: nowUtc,
        });
    }

    async getRecord({ id, date, category, type, pageSize, pageNumber }: GetRecordPayload) {
        const whereClause: Record<string, unknown> = {};

        if (id !== undefined) {
            whereClause.id = id;
        }

        if (category !== undefined) {
            whereClause.category = {
                [Op.iLike]: `%${category}%`,
            };
        }

        if (type !== undefined) {
            whereClause.type = type;
        }

        if (date !== undefined) {
            whereClause.date = date;
        }

        const offset = (pageNumber - 1) * pageSize;

        const { rows, count } = await RecordModel.findAndCountAll({
            where: whereClause,
            limit: pageSize,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return {
            records: rows,
            totalCount: count,
            pageSize,
            pageNumber,
            totalPages: Math.ceil(count / pageSize),
        };
    }

    async updateRecord(payload: UpdateRecordPayload) {
        const nowUtc = new Date();
        const [updatedCount, updatedRows] = await RecordModel.update(
            {
                ...(payload.userId !== undefined ? { userId: payload.userId } : {}),
                ...(payload.amount !== undefined ? { amount: String(payload.amount) } : {}),
                ...(payload.type !== undefined ? { type: payload.type } : {}),
                ...(payload.category !== undefined ? { category: payload.category } : {}),
                ...(payload.date !== undefined ? { date: payload.date } : {}),
                ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
                updatedAt: nowUtc,
            },
            {
                where: { id: payload.id },
                returning: true,
            }
        );

        if (updatedCount === 0) {
            throw new Error(messages.record.notFound);
        }

        return updatedRows[0];
    }

    async deleteRecord(payload: DeleteRecordPayload) {
        const deletedCount = await RecordModel.destroy({
            where: { id: payload.id },
        });

        if (deletedCount === 0) {
            throw new Error(messages.record.notFound);
        }

        return { id: payload.id };
    }

    async getDashBoardSummary({ startDate, endDate, trend }: DashboardSummaryPayload) {
        const resolvedEndDate = endDate ?? new Date();
        const resolvedStartDate = startDate ?? new Date(resolvedEndDate);

        if (startDate === undefined) {
            resolvedStartDate.setMonth(resolvedStartDate.getMonth() - 3);
        }

        const summaryRows = await RecordModel.findAll({
            attributes: [
                "type",
                "category",
                "amount",
                "date",
            ],
            where: {
                date: {
                    [Op.between]: [resolvedStartDate, resolvedEndDate],
                },
            },
            order: [["date", "ASC"]],
            raw: true,
        }) as unknown as Array<{ type: RecordType; category: string; amount: string; date: Date }>;

        const toNumber = (value: string | number) => Number(value ?? 0);
        const formatPeriodKey = (dateValue: Date) => {
            if (trend === "monthly") {
                return dateValue.toISOString().slice(0, 7);
            }

            const weekStart = new Date(dateValue);
            const day = weekStart.getUTCDay();
            const diff = weekStart.getUTCDate() - day + (day === 0 ? -6 : 1);
            weekStart.setUTCDate(diff);
            weekStart.setUTCHours(0, 0, 0, 0);
            return weekStart.toISOString().slice(0, 10);
        };

        const aggregateBucket = (rows: Array<{ type: RecordType; category: string; amount: string }>) => {
            const categoryTotals = new Map<string, { totalIncome: number; totalExpense: number; netBalance: number }>();
            let totalIncome = 0;
            let totalExpense = 0;

            for (const row of rows) {
                const amount = toNumber(row.amount);
                const currentCategory = categoryTotals.get(row.category) ?? { totalIncome: 0, totalExpense: 0, netBalance: 0 };

                if (row.type === "income") {
                    totalIncome += amount;
                    currentCategory.totalIncome += amount;
                    currentCategory.netBalance += amount;
                } else {
                    totalExpense += amount;
                    currentCategory.totalExpense += amount;
                    currentCategory.netBalance -= amount;
                }

                categoryTotals.set(row.category, currentCategory);
            }

            const categoryWiseTotals = Array.from(categoryTotals.entries()).map(([category, totals]) => ({
                category,
                ...totals,
            }));

            return {
                totalIncome,
                totalExpense,
                netBalance: totalIncome - totalExpense,
                categoryWiseTotals,
            };
        };

        const overallTotals = aggregateBucket(summaryRows);

        const periodMap = new Map<string, Array<{ type: RecordType; category: string; amount: string }>>();
        for (const row of summaryRows) {
            const periodKey = formatPeriodKey(new Date(row.date));
            const bucket = periodMap.get(periodKey) ?? [];
            bucket.push({ type: row.type, category: row.category, amount: row.amount });
            periodMap.set(periodKey, bucket);
        }

        const periods = Array.from(periodMap.entries()).map(([period, rows]) => ({
            period,
            ...aggregateBucket(rows),
        }));

        return {
            filters: {
                startDate: resolvedStartDate,
                endDate: resolvedEndDate,
                trend,
            },
            ...overallTotals,
            periods,
        };
    }

};

export default new recordService();