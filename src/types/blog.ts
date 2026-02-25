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

export type UpdateBlogRequest = CreateBlogRequest