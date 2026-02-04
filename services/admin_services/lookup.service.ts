// import axiosAdmin from "@/lib/axiosAdmin";
// import { API_ENDPOINTS } from "../configs/api-configs";

// export interface LookupItem {
//   id: number;
//   name: string;
// }

// export const getCategories = async (): Promise<LookupItem[]> => {
//   const res = await axiosAdmin.get(API_ENDPOINTS.CATEGORIES);

//   return res.data.map((c: any) => ({
//     id: c.categoryId,
//     name: c.categoryName,
//   }));
// };

// export const getShapes = async (): Promise<LookupItem[]> => {
//   const res = await axiosAdmin.get(API_ENDPOINTS.SHAPES);

//   return res.data.map((s: any) => ({
//     id: s.shapesId,
//     name: s.shapesName,
//   }));
// };
// export const getBlogCategories = async (): Promise<LookupItem[]> => {
//   const res = await axiosAdmin.get(API_ENDPOINTS.BLOG_CATEGORIES);

//   return res.data.map((c: any) => ({
//     id: c.blogCategoryId,
//     name: c.blogCategoryName,
//   }));
// };