// export const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL!;
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7219";
export const API_ENDPOINTS = {
  // ===== AUTH =====

  // ===== ADMIN PRODUCTS =====
  ADMIN_PRODUCTS: `${API_BASE}/api/admin/products`,
  ADMIN_BRANDS: `${API_BASE}/api/admin/brands/active`,
  ADMIN_MATERIALS: `${API_BASE}/api/admin/materials/active`,
  ADMIN_ORIGINS: `${API_BASE}/api/admin/origins`,
  ADMIN_AGES: `${API_BASE}/api/admin/ages`,
  ADMIN_SEXES: `${API_BASE}/api/admin/sexes`,
  ADMIN_SUPER_CATEGORIES: `${API_BASE}/api/admin/super-categories`,
  ADMIN_SUPER_CATEGORIES_ACTIVE: `${API_BASE}/api/admin/super-categories/active`,
  ADMIN_SUPER_CATEGORY_BY_ID: (id: number) => `${API_BASE}/api/admin/super-categories/${id}`,
  ADMIN_CATEGORIES: `${API_BASE}/api/admin/categories`,
  ADMIN_CATEGORIES_ACTIVE: `${API_BASE}/api/admin/categories/active`,
  ADMIN_CATEGORY_BY_ID: (id: number) => `${API_BASE}/api/admin/categories/${id}`,

  // ===== ADMIN ACCOUNTS =====
  ADMIN_ACCOUNTS: `${API_BASE}/api/admin/accounts`,
  ADMIN_CUSTOMER_ACCOUNTS: `${API_BASE}/api/admin/customer-accounts`,

  // ===== CUSTOMER CART =====
  CART: `${API_BASE}/api/cart`,
  CART_ADD: `${API_BASE}/api/cart/add`,
  CART_UPDATE: `${API_BASE}/api/cart/update`,
  CART_INCREMENT: (cartItemId: number) => `${API_BASE}/api/cart/increment/${cartItemId}`,
  CART_DECREMENT: (cartItemId: number) => `${API_BASE}/api/cart/decrement/${cartItemId}`,
  CART_REMOVE: (cartItemId: number) => `${API_BASE}/api/cart/remove/${cartItemId}`,
  CART_CLEAR: `${API_BASE}/api/cart/clear`,

  // ===== CUSTOMER ADDRESSES =====
  ADDRESSES: `${API_BASE}/api/addresses`,
  ADDRESS_BY_ID: (id: number) => `${API_BASE}/api/addresses/${id}`,
  ADDRESS_SET_DEFAULT: (id: number) => `${API_BASE}/api/addresses/${id}/set-default`,

  // ===== CUSTOMER ORDERS =====
  ORDERS: `${API_BASE}/api/COrder`,
  ORDER_BY_ID: (id: number) => `${API_BASE}/api/COrder/${id}`,
  ORDER_PAYMENT_METHODS: `${API_BASE}/api/COrder/payment-methods`,
  ORDER_MY_ORDERS: `${API_BASE}/api/COrder/my-orders`,
  ORDER_CANCEL: (id: number) => `${API_BASE}/api/COrder/${id}/cancel`,

  // ===== CUSTOMER SHIPPING =====
  SHIPPING_METHODS: `${API_BASE}/api/CShipping/methods`,
  SHIPPING_CALCULATE_FEE: `${API_BASE}/api/CShipping/calculate-fee`,

  // ===== CUSTOMER NOTIFICATIONS =====
  NOTIFICATIONS: `${API_BASE}/api/notifications`,
  NOTIFICATIONS_UNREAD_COUNT: `${API_BASE}/api/notifications/unread-count`,
  NOTIFICATION_MARK_READ: (id: number) => `${API_BASE}/api/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: `${API_BASE}/api/notifications/read-all`,
  NOTIFICATION_DELETE: (id: number) => `${API_BASE}/api/notifications/${id}`,

  // ===== ADMIN ORDERS =====
  ADMIN_ORDERS: `${API_BASE}/api/admin/orders`,
  ADMIN_ORDER_BY_ID: (id: number) => `${API_BASE}/api/admin/orders/${id}`,
  ADMIN_ORDER_STATUS: (id: number) => `${API_BASE}/api/admin/orders/${id}/status`,
  ADMIN_ORDERS_EXPORT: `${API_BASE}/api/admin/orders/export`,

  // ===== ADMIN VOUCHERS =====
  ADMIN_VOUCHERS: `${API_BASE}/api/admin/vouchers`,
  ADMIN_VOUCHER_BY_ID: (id: number) => `${API_BASE}/api/admin/vouchers/${id}`,

  // ===== ADMIN NOTIFICATIONS =====
  ADMIN_NOTIFICATIONS: `${API_BASE}/api/admin/notifications`,
  ADMIN_NOTIFICATION_BY_ID: (id: number) => `${API_BASE}/api/admin/notifications/${id}`,
  ADMIN_NOTIFICATIONS_STATS: `${API_BASE}/api/admin/notifications/stats`,

  // ===== ADMIN REVIEWS =====
  ADMIN_REVIEWS: `${API_BASE}/api/admin/reviews`,
  ADMIN_REVIEW_BY_ID: (id: number) => `${API_BASE}/api/admin/reviews/${id}`,
  ADMIN_REVIEW_REPLIES: `${API_BASE}/api/admin/reviews/replies`,

  // ===== ADMIN BLOG =====
  ADMIN_BLOGS: `${API_BASE}/api/admin/blogs`,
  ADMIN_BLOG_SEARCH: `${API_BASE}/api/admin/blogs/search`,
  ADMIN_BLOG_BY_ID: (id: number) => `${API_BASE}/api/admin/blogs/${id}`,

  // ===== ADMIN BLOG CATEGORIES =====
  ADMIN_BLOG_CATEGORIES: `${API_BASE}/api/admin/blog-categories`,

  // ===== CUSTOMER WALLET =====
  WALLET_BALANCE: `${API_BASE}/api/CWallet/balance`,
  WALLET_TRANSACTIONS: `${API_BASE}/api/CWallet/transactions`,
  WALLET_TOPUP: `${API_BASE}/api/CWallet/topup`,

  // ===== CUSTOMER BLOG =====
  BLOGS: `${API_BASE}/api/blogs`,
  BLOG_BY_ID: (id: number) => `${API_BASE}/api/blogs/${id}`,
  BLOG_RECENT: `${API_BASE}/api/blogs/recent`,
  BLOG_CATEGORIES: `${API_BASE}/api/blog-categories`,
  BLOG_FEATURED: `${API_BASE}/api/blogs/featured`,

  // ===== BLOG REVIEWS =====
  BLOG_REVIEWS: `${API_BASE}/api/blog-reviews`,
  BLOG_REVIEWS_BY_BLOG: (blogId: number) => `${API_BASE}/api/blog-reviews/blog/${blogId}`,

  // ===== ADMIN REVIEW BLOG =====
  ADMIN_REVIEW_BLOGS: `${API_BASE}/api/admin/reviews-blog`,
  ADMIN_REVIEW_BLOG_BLOCK: (id: number) => `${API_BASE}/api/admin/reviews-blog/${id}/block`,

  // ===== BLOG REVIEW REACTIONS =====
  BLOG_REVIEW_REACTIONS: `${API_BASE}/api/blog-review-reactions`,
  BLOG_REVIEW_REACTION_BY_ID: (reviewId: number) =>
    `${API_BASE}/api/blog-review-reactions/${reviewId}`,
};
