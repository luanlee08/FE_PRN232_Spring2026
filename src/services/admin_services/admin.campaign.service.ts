import { API_ENDPOINTS } from '@/configs/api-configs';
import axiosInstance from '@/lib/api/axios';
import type {
  CampaignDto,
  CampaignDetailDto,
  CampaignQuery,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  RecordActionRequest,
} from '@/types/campaign';

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

/** BE returns the full CampaignResponse object (not a bare id) on create/update/duplicate */
interface CampaignResponseData {
  campaignId: number;
  [key: string]: unknown;
}

function buildQuery(q: CampaignQuery): string {
  const params = new URLSearchParams();
  if (q.keyword)    params.append('keyword', q.keyword);
  if (q.status)     params.append('status', q.status);
  if (q.sourceType) params.append('sourceType', q.sourceType);
  if (q.fromDate)   params.append('fromDate', q.fromDate);
  if (q.toDate)     params.append('toDate', q.toDate);
  if (q.page)       params.append('page', String(q.page));
  if (q.pageSize)   params.append('pageSize', String(q.pageSize));
  return params.toString() ? `?${params.toString()}` : '';
}

export async function getCampaigns(query: CampaignQuery = {}): Promise<PagedResponse<CampaignDto>> {
  const res = await axiosInstance.get<PagedResponse<CampaignDto>>(
    `${API_ENDPOINTS.ADMIN_CAMPAIGNS}${buildQuery(query)}`
  );
  return res.data;
}

export async function getCampaignById(id: number): Promise<ApiResponse<CampaignDetailDto>> {
  const res = await axiosInstance.get<ApiResponse<CampaignDetailDto>>(
    API_ENDPOINTS.ADMIN_CAMPAIGN_BY_ID(id)
  );
  return res.data;
}

export async function createCampaign(payload: CreateCampaignRequest): Promise<ApiResponse<CampaignResponseData>> {
  const res = await axiosInstance.post<ApiResponse<CampaignResponseData>>(
    API_ENDPOINTS.ADMIN_CAMPAIGNS,
    payload
  );
  return res.data;
}

export async function updateCampaign(id: number, payload: UpdateCampaignRequest): Promise<ApiResponse<CampaignResponseData>> {
  const res = await axiosInstance.put<ApiResponse<CampaignResponseData>>(
    API_ENDPOINTS.ADMIN_CAMPAIGN_BY_ID(id),
    payload
  );
  return res.data;
}

export async function deleteCampaign(id: number): Promise<ApiResponse<boolean>> {
  const res = await axiosInstance.delete<ApiResponse<boolean>>(
    API_ENDPOINTS.ADMIN_CAMPAIGN_BY_ID(id)
  );
  return res.data;
}

export async function sendCampaign(id: number): Promise<ApiResponse<boolean>> {
  const res = await axiosInstance.post<ApiResponse<boolean>>(
    API_ENDPOINTS.ADMIN_CAMPAIGN_SEND(id)
  );
  return res.data;
}

export async function duplicateCampaign(id: number): Promise<ApiResponse<CampaignResponseData>> {
  const res = await axiosInstance.post<ApiResponse<CampaignResponseData>>(
    API_ENDPOINTS.ADMIN_CAMPAIGN_DUPLICATE(id)
  );
  return res.data;
}

export async function recordDeliveryAction(payload: RecordActionRequest): Promise<ApiResponse<boolean>> {
  const res = await axiosInstance.post<ApiResponse<boolean>>(
    API_ENDPOINTS.RECORD_DELIVERY_ACTION,
    payload
  );
  return res.data;
}
