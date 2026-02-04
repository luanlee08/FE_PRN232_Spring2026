export interface Blog {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  category: string;
  categoryId: number;
  author: string;
  status: "Bản nháp" | "Đã xuất bản";
  featured: boolean;
  isDeleted: boolean;
  createdAt: string;
}