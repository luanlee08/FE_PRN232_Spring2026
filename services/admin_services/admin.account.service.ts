import { API_ENDPOINTS } from "../../configs/api-configs";

export interface AccountAdmin {
  accountId: number;
  accountName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  status: string;
  roleId?: number;
  roleName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AccountQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  roleId?: number;
  status?: string;
}

export interface CreateAccountRequest {
  accountName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roleId: number;
  status?: string;
}

export interface UpdateAccountRequest {
  accountName: string;
  phoneNumber?: string;
  roleId: number;
  status?: string;
  password?: string;
}

interface PagedResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

interface ApiResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: T;
}

export const accountService = {
  getAccounts: async (query: AccountQuery): Promise<PagedResponse<AccountAdmin>> => {
    const params = new URLSearchParams({
      page: query.page.toString(),
      pageSize: query.pageSize.toString(),
    });

    if (query.keyword) params.append("keyword", query.keyword);
    if (query.roleId) params.append("roleId", query.roleId.toString());
    if (query.status) params.append("status", query.status);

    const res = await fetch(`${API_ENDPOINTS.ADMIN_ACCOUNTS}?${params}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch accounts");
    }

    return res.json();
  },

  getAccountById: async (id: number): Promise<ApiResponse<AccountAdmin>> => {
    const res = await fetch(`${API_ENDPOINTS.ADMIN_ACCOUNTS}/${id}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch account");
    }

    return res.json();
  },

  createAccount: async (data: CreateAccountRequest): Promise<ApiResponse<number>> => {
    const res = await fetch(API_ENDPOINTS.ADMIN_ACCOUNTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return res.json();
  },

  updateAccount: async (
    id: number,
    data: UpdateAccountRequest
  ): Promise<ApiResponse<boolean>> => {
    const res = await fetch(`${API_ENDPOINTS.ADMIN_ACCOUNTS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return res.json();
  },
};
