import { API_ENDPOINTS } from "../../configs/api-configs";
import axios from "axios";

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
    const res = await axios.get(API_ENDPOINTS.ADMIN_CATEGORIES_ACTIVE, {
      withCredentials: true,
    });
    return mapLookup(res.data.data, "categoryId", "categoryName");
  },

  async getBrands(): Promise<LookupItem[]> {
    const res = await axios.get(API_ENDPOINTS.ADMIN_BRANDS, {
      withCredentials: true,
    });
    return mapLookup(res.data.data, "brandId", "brandName");
  },

  async getMaterials(): Promise<LookupItem[]> {
    const res = await axios.get(API_ENDPOINTS.ADMIN_MATERIALS, {
      withCredentials: true,
    });
    return mapLookup(res.data.data, "materialId", "materialName");
  },

  async getOrigins(): Promise<LookupItem[]> {
    const res = await axios.get(API_ENDPOINTS.ADMIN_ORIGINS, {
      withCredentials: true,
    });
    return mapLookup(res.data.data, "originId", "originName");
  },

  async getAges(): Promise<LookupItem[]> {
    const res = await axios.get(API_ENDPOINTS.ADMIN_AGES, {
      withCredentials: true,
    });
    return mapLookup(res.data.data, "ageId", "ageRange");
  },

  async getSexes(): Promise<LookupItem[]> {
    const res = await axios.get(API_ENDPOINTS.ADMIN_SEXES, {
      withCredentials: true,
    });
    return mapLookup(res.data.data, "sexId", "sexName");
  },
};
