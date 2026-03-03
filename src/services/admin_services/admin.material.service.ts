import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";

export interface MaterialAdmin {
  materialId: number;
  materialName: string;
  description?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const AdminMaterialService = {
  async get(params: {
    page: number;
    pageSize: number;
    keyword?: string;
  }) {
    const res = await axiosInstance.get<
      ApiResponse<PagedResult<MaterialAdmin>>
    >(API_ENDPOINTS.ADMIN_MATERIALS_LIST, { params });

    return res.data.data;
  },

  async create(data: {
    materialName: string;
    description?: string;
    isDeleted: boolean;
  }) {
    const res = await axiosInstance.post(
      API_ENDPOINTS.ADMIN_MATERIALS_LIST,
      data
    );
    return res.data;
  },

  async update(
    id: number,
    data: {
      materialName: string;
      description?: string;
      isDeleted: boolean;
    }
  ) {
    const res = await axiosInstance.put(
      API_ENDPOINTS.ADMIN_MATERIAL_BY_ID(id),
      data
    );
    return res.data;
  },
};