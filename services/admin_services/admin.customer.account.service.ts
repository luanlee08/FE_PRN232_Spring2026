import { API_ENDPOINTS } from "../../configs/api-configs";

export interface CustomerAccount {
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

export interface CustomerAccountQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
}

export interface UpdateCustomerAccountRequest {
  status: string;
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

export const customerAccountService = {
  getCustomerAccounts: async (query: CustomerAccountQuery): Promise<PagedResponse<CustomerAccount>> => {
    const params = new URLSearchParams({
      page: query.page.toString(),
      pageSize: query.pageSize.toString(),
    });

    if (query.keyword) params.append("keyword", query.keyword);
    if (query.status) params.append("status", query.status);

    const res = await fetch(`${API_ENDPOINTS.ADMIN_CUSTOMER_ACCOUNTS}?${params}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch customer accounts");
    }

    return res.json();
  },

  getCustomerAccountById: async (id: number): Promise<ApiResponse<CustomerAccount>> => {
    const res = await fetch(`${API_ENDPOINTS.ADMIN_CUSTOMER_ACCOUNTS}/${id}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch customer account");
    }

    return res.json();
  },

  updateCustomerAccount: async (
    id: number,
    data: UpdateCustomerAccountRequest
  ): Promise<ApiResponse<boolean>> => {
    const res = await fetch(`${API_ENDPOINTS.ADMIN_CUSTOMER_ACCOUNTS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update customer account");
    }

    return res.json();
  },
};
