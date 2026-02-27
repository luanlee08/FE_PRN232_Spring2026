export interface BlogAdmin {
  blogPostId: number;
  blogTitle: string;
  blogContent: string;
  blogThumbnail?: string;   
  categoryId: number;
  blogCategory: string;     
  isPublished: boolean;
  isFeatured: boolean;
  isDeleted: boolean;     
  createdAt: string;
}

export interface BlogCategory {
  blogCategoryId: number;
  blogCategoryName: string;
}

export interface BlogQuery {
  page: number;
  pageSize: number;
  keyword?: string;
}

export interface CreateBlogRequest {
  blogTitle: string;
  blogContent: string;
  categoryId: number;
  isPublished: boolean;
  isFeatured: boolean;
  isActive: boolean;
  thumbnail?: File;
}
export interface BlogPublic {
  blogPostId: number;
  blogTitle: string;
  blogExcerpt: string;
  blogContent: string;
  blogThumbnail: string | null;
  blogCategory: string;
  categoryId: number;
  authorEmail: string;
  createdAt: string;
}

export interface BlogCategory {
  blogCategoryId: number;
  blogCategoryName: string;
}

export interface PagedResponse<T> {
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

export interface ApiResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: T;
}
export type UpdateBlogRequest = CreateBlogRequest

export type ReviewBlog = {
  reviewBlogId: number;
  customerName: string;
  content: string;
  rating: number;
  createdAt: string;
  isBlocked?: boolean;
};