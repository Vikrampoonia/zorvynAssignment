import type { QueryValue } from "./commonTypes.js";

export type RecordCreateRequest = {
    userId: QueryValue;
    amount: QueryValue;
    type: QueryValue;
    category: QueryValue;
    date: QueryValue;
    notes: QueryValue;
};

export type RecordUpdateRequest = {
    id: QueryValue;
    userId: QueryValue;
    amount: QueryValue;
    type: QueryValue;
    category: QueryValue;
    date: QueryValue;
    notes: QueryValue;
};

export type RecordDeleteRequest = {
    id: QueryValue;
};

export type RecordGetRequest = {
    id: QueryValue;
    date: QueryValue;
    category: QueryValue;
    type: QueryValue;
    pageSize: QueryValue;
    pageNumber: QueryValue;
};

export type DashboardSummaryRequest = {
    startDate: QueryValue;
    endDate: QueryValue;
    trend: QueryValue;
};