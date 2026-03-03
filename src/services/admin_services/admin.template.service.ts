import { API_ENDPOINTS } from '@/configs/api-configs';
import axiosInstance from '@/lib/api/axios';
import type { TemplateDto, CreateTemplateRequest, UpdateTemplateRequest } from '@/types/campaign';

interface PagedResponse<T> {
  status: number;
  message: string;
  data: {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export async function getTemplates(params?: {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<PagedResponse<TemplateDto>> {
  const p = new URLSearchParams();
  if (params?.keyword !== undefined) p.append('keyword', params.keyword);
  if (params?.isActive !== undefined) p.append('isActive', String(params.isActive));
  if (params?.page)     p.append('page', String(params.page));
  if (params?.pageSize) p.append('pageSize', String(params.pageSize));
  const qs = p.toString() ? `?${p}` : '';
  const res = await axiosInstance.get<PagedResponse<TemplateDto>>(
    `${API_ENDPOINTS.ADMIN_TEMPLATES}${qs}`
  );
  return res.data;
}

export async function getActiveTemplates(): Promise<ApiResponse<TemplateDto[]>> {
  const res = await axiosInstance.get<ApiResponse<TemplateDto[]>>(
    API_ENDPOINTS.ADMIN_TEMPLATES_ACTIVE
  );
  return res.data;
}

export async function createTemplate(payload: CreateTemplateRequest): Promise<ApiResponse<number>> {
  const res = await axiosInstance.post<ApiResponse<number>>(
    API_ENDPOINTS.ADMIN_TEMPLATES,
    payload
  );
  return res.data;
}

export async function updateTemplate(id: number, payload: UpdateTemplateRequest): Promise<ApiResponse<boolean>> {
  const res = await axiosInstance.put<ApiResponse<boolean>>(
    API_ENDPOINTS.ADMIN_TEMPLATE_BY_ID(id),
    payload
  );
  return res.data;
}

export async function toggleTemplateStatus(id: number): Promise<ApiResponse<boolean>> {
  const res = await axiosInstance.patch<ApiResponse<boolean>>(
    API_ENDPOINTS.ADMIN_TEMPLATE_TOGGLE(id)
  );
  return res.data;
}
