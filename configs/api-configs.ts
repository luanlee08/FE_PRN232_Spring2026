  // export const API_BASE =
  //   process.env.NEXT_PUBLIC_API_URL!;
  export const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "https://localhost:7219";
  export const API_ENDPOINTS = {
    // ===== AUTH =====
    

    // ===== ADMIN PRODUCTS =====
    ADMIN_PRODUCTS: `${API_BASE}/api/admin/products`,

  // ===== ADMIN ACCOUNTS =====
  ADMIN_ACCOUNTS: `${API_BASE}/api/admin/accounts`,

};

      // ===== ADMIN LOOKUPS (DROPDOWN) =====
  ADMIN_CATEGORIES: `${API_BASE}/api/admin/categories/active`,
  ADMIN_BRANDS: `${API_BASE}/api/admin/brands/active`,
  ADMIN_MATERIALS: `${API_BASE}/api/admin/materials/active`,
  ADMIN_ORIGINS: `${API_BASE}/api/admin/origins`,
  ADMIN_AGES: `${API_BASE}/api/admin/ages`,
  ADMIN_SEXES: `${API_BASE}/api/admin/sexes`,
  };
