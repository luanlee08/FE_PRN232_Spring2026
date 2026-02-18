// Shared API response types used across all services

export interface ApiResponse<T> {
    status: number;
    statusMessage: string;
    message: string;
    data: T | null;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}
