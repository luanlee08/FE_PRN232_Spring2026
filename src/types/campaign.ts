// Campaign management types — mirrors BLL/DTOs/Campaigns/*

export type CampaignStatus = 'Draft' | 'Scheduled' | 'Processing' | 'Completed' | 'Failed';
export type CampaignTargetType = 'ALL' | 'GROUP' | 'CUSTOM' | 'SINGLE';
export type CampaignSourceType = 'ADMIN' | 'SYSTEM' | 'WORKER';
export type DeliveryActionType = 'Read' | 'Click';

export interface CampaignDto {
  campaignId: number;
  campaignName: string;
  templateCode?: string;
  titleOverride?: string;
  messageOverride?: string;
  sourceType: CampaignSourceType;
  targetType: CampaignTargetType;
  status: CampaignStatus;
  scheduledAt?: string;           // ISO date string
  eventKey?: string;
  imageUrl?: string;
  actionType?: string;
  actionTarget?: string;
  createdByAccountId: number;
  createdByAccountName?: string;
  createdAt: string;
  updatedAt?: string;

  // analytics
  totalRecipients: number;
  totalSent: number;
  totalRead: number;
  totalClicked: number;
  ctrPercent: number;

  targetValues: string[];
}

export interface RecipientRow {
  deliveryId: number;
  accountId: number;
  accountName?: string;
  accountEmail?: string;
  deliveryStatus: 'Unread' | 'Read';
  deliveredAt: string;
  readAt?: string;
  clickedAt?: string;
}

export interface TimelinePoint {
  date: string;   // "yyyy-MM-dd"
  clicks: number;
  reads: number;
}

export interface CampaignDetailDto extends CampaignDto {
  recipients: RecipientRow[];
  clickTimeline: TimelinePoint[];
}

export interface CreateCampaignRequest {
  campaignName: string;
  templateCode?: string;
  titleOverride?: string;
  messageOverride?: string;
  sourceType: CampaignSourceType;
  targetType: CampaignTargetType;
  targetValues: string[];
  scheduledAt?: string;
  eventKey?: string;
  imageUrl?: string;
  actionType?: string;
  actionTarget?: string;
}

export interface UpdateCampaignRequest {
  campaignName?: string;
  templateCode?: string;
  titleOverride?: string;
  messageOverride?: string;
  targetType?: CampaignTargetType;
  targetValues?: string[];
  scheduledAt?: string;
  imageUrl?: string;
  actionType?: string;
  actionTarget?: string;
}

export interface CampaignQuery {
  keyword?: string;
  status?: CampaignStatus;
  sourceType?: CampaignSourceType;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface RecordActionRequest {
  deliveryId: number;
  actionType: DeliveryActionType;
  actionTarget?: string;
}

// ── Template types ──────────────────────────────────────────────────────────
export interface TemplateDto {
  templateId: number;
  templateCode: string;
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTemplateRequest {
  templateCode: string;
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;
}

export interface UpdateTemplateRequest {
  templateCode: string;
  titleTemplate: string;
  messageTemplate: string;
  isActive?: boolean;
}
