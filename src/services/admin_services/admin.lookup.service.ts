import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";

export interface LookupItem {
  id: number;
  name: string;
}

const mapLookup = <T extends Record<string, unknown>>(
  data: T[],
  idKey: keyof T,
  nameKey: keyof T
): LookupItem[] =>
  Array.isArray(data)
    ? data.map((item) => ({
      id: Number(item[idKey]),
      name: String(item[nameKey]),
    }))
    : [];

export const AdminLookupService = {
  async getCategories(): Promise<LookupItem[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_CATEGORIES_ACTIVE);
    return mapLookup(res.data.data, "categoryId", "categoryName");
  },

  async getBrands(): Promise<LookupItem[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_BRANDS);
    return mapLookup(res.data.data, "brandId", "brandName");
  },

  async getMaterials(): Promise<LookupItem[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_MATERIALS);
    return mapLookup(res.data.data, "materialId", "materialName");
  },

  async getOrigins(): Promise<LookupItem[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_ORIGINS);
    return mapLookup(res.data.data, "originId", "originName");
  },

  async getAges(): Promise<LookupItem[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_AGES);
    return mapLookup(res.data.data, "ageId", "ageRange");
  },

  async getSexes(): Promise<LookupItem[]> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_SEXES);
    return mapLookup(res.data.data, "sexId", "sexName");
  },
};
