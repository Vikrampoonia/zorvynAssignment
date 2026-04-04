
import { Op } from "sequelize";
import { User } from "../models/user.js";
import { USER_STATUSES } from "../models/constants.js";
import type { UserRole } from "../models/constants.js";
import messages from "../models/messages.js";

type CreateUserPayload = {
    name: string;
    phoneNumber: string;
    role: UserRole;
};

type UpdateUserPayload = {
    id: number;
    name?: string;
    phoneNumber?: string;
    role?: UserRole;
};

type DeleteUserPayload = {
    id: number;
};

type getUserPayload = {
    id?: string;
    name?: string;
    phoneNumber?: string;
    role?: UserRole;
    pageSize: number;
    pageNumber: number;
}

class userService {

    async createUser(payload: CreateUserPayload) {
        const nowUtc = new Date();
        return User.create({
            name: payload.name,
            phoneNumber: payload.phoneNumber,
            role: payload.role,
            status: "active",
            createdAt: nowUtc,
            updatedAt: nowUtc,
        });
    }

    async getUser({ id, name, phoneNumber, role, pageSize, pageNumber }: getUserPayload) {
        const whereClause: Record<string, unknown> = {
            status: USER_STATUSES[0],
        };

        if (id !== undefined && id !== "") {
            whereClause.id = Number(id);
        }

        if (name !== undefined && name.trim() !== "") {
            whereClause.name = {
                [Op.iLike]: `%${name.trim()}%`,
            };
        }

        if (phoneNumber !== undefined && phoneNumber !== "") {
            whereClause.phoneNumber = phoneNumber;
        }

        if (role !== undefined) {
            whereClause.role = role;
        }

        const offset = (pageNumber - 1) * pageSize;
        const { rows, count } = await User.findAndCountAll({
            where: whereClause,
            limit: pageSize,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return {
            users: rows,
            totalCount: count,
            pageSize,
            pageNumber,
            totalPages: Math.ceil(count / pageSize),
        };
    }

    async updateUser(payload: UpdateUserPayload) {
        const nowUtc = new Date();
        const [updatedCount, updatedRows] = await User.update(
            {
                ...(payload.name !== undefined ? { name: payload.name } : {}),
                ...(payload.phoneNumber !== undefined ? { phoneNumber: payload.phoneNumber } : {}),
                ...(payload.role !== undefined ? { role: payload.role } : {}),
                updatedAt: nowUtc,
            },
            {
                where: { id: payload.id },
                returning: true,
            }
        );

        if (updatedCount === 0) {
            throw new Error(messages.user.notFound);
        }

        return updatedRows[0];
    }

    async deleteUser(payload: DeleteUserPayload) {
        const nowUtc = new Date();
        const activeStatus = USER_STATUSES[0];
        const inactiveStatus = USER_STATUSES[1];
        const [updatedCount, updatedRows] = await User.update(
            {
                status: inactiveStatus,
                updatedAt: nowUtc,
            },
            {
                where: {
                    id: payload.id,
                    status: activeStatus,
                },
                returning: true,
            }
        );

        if (updatedCount === 0) {
            throw new Error(messages.user.notFound);
        }

        return updatedRows[0];
    }

};

export default new userService();