import type { QueryValue } from "./commonTypes.js";

export type UserCreateRequest = {
    name: QueryValue;
    phoneNumber: QueryValue;
    role: QueryValue;
};

export type UserUpdateRequest = {
    id: QueryValue;
    name: QueryValue;
    phoneNumber: QueryValue;
    role: QueryValue;
};

export type UserDeleteRequest = {
    id: QueryValue;
};

export type UserGetRequest = {
    id: QueryValue;
    name: QueryValue;
    phoneNumber: QueryValue;
    role: QueryValue;
    pageSize: QueryValue;
    pageNumber: QueryValue;
};