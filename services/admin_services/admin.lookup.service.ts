import { API_ENDPOINTS } from "../../configs/api-configs";

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
    const res = await fetch(API_ENDPOINTS.ADMIN_CATEGORIES);
    const json = await res.json();
    return mapLookup(json.data, "categoryId", "categoryName");
  },

  async getBrands(): Promise<LookupItem[]> {
    const res = await fetch(API_ENDPOINTS.ADMIN_BRANDS);
    const json = await res.json();
    return mapLookup(json.data, "brandId", "brandName");
  },

  async getMaterials(): Promise<LookupItem[]> {
    const res = await fetch(API_ENDPOINTS.ADMIN_MATERIALS);
    const json = await res.json();
    return mapLookup(json.data, "materialId", "materialName");
  },

  async getOrigins(): Promise<LookupItem[]> {
    const res = await fetch(API_ENDPOINTS.ADMIN_ORIGINS);
    const json = await res.json();
    return mapLookup(json.data, "originId", "originName");
  },

  async getAges(): Promise<LookupItem[]> {
    const res = await fetch(API_ENDPOINTS.ADMIN_AGES);
    const json = await res.json();
    return mapLookup(json.data, "ageId", "ageName");
  },

  async getSexes(): Promise<LookupItem[]> {
    const res = await fetch(API_ENDPOINTS.ADMIN_SEXES);
    const json = await res.json();
    return mapLookup(json.data, "sexId", "sexName");
  },
};
