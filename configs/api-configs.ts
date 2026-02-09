// export const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL!;
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:7219";
export const API_ENDPOINTS = {
  // ===== AUTH =====
  

   // ===== ADMIN PRODUCTS =====
  ADMIN_PRODUCTS: `${API_BASE}/api/admin/products`,

};
