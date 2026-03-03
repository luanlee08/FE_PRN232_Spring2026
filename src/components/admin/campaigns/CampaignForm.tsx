"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Save, Send, User, Users } from "lucide-react";
import { TemplatePreview, VariableChips } from "@/components/admin/shared/VariableChips";
import ImageUploader from "@/components/admin/shared/ImageUploader";
import ActionPicker, { ActionType } from "@/components/admin/shared/ActionPicker";
import type {
  CampaignDto,
  CampaignTargetType,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  TemplateDto,
} from "@/types/campaign";
import {
  createCampaign,
  sendCampaign,
  updateCampaign,
} from "@/services/admin_services/admin.campaign.service";
import { getActiveTemplates } from "@/services/admin_services/admin.template.service";

type Mode = "create" | "edit";
interface Props { mode: Mode; initial?: CampaignDto; }

// Friendly audience options — hides CampaignTargetType from user
const AUDIENCE_OPTIONS: {
  value: CampaignTargetType;
  icon: React.ReactNode;
  label: string;
  sub: string;
  showInput: boolean;
  inputPlaceholder?: string;
  inputLabel?: string;
}[] = [
  {
    value: "ALL",
    icon: <Users size={20} />,
    label: "Tất cả khách hàng",
    sub: "Gửi đến toàn bộ tài khoản trên hệ thống",
    showInput: false,
  },
  {
    value: "CUSTOM",
    icon: <User size={20} />,
    label: "Khách hàng cụ thể",
    sub: "Chọn từng người theo số tài khoản",
    showInput: true,
    inputLabel: "Số tài khoản (phân cách bằng dấu phẩy)",
    inputPlaceholder: "101, 204, 389",
  },
];

const LINK_OPTIONS = [
  { value: "none",    label: "Không có liên kết" },
  { value: "product", label: "Dẫn đến sản phẩm" },
  { value: "voucher", label: "Dẫn đến voucher" },
  { value: "url",     label: "Dẫn đến trang web khác" },
];

function templateLabel(t: TemplateDto): string {
  const map: Record<string, string> = {
    PROMOTION:        "Khuyến mãi chung",
    VOUCHER_AVAILABLE:"Thông báo voucher mới",
    VOUCHER_EXPIRING: "Voucher sắp hết hạn",
    WELCOME:          "Chào mừng thành viên",
    CUSTOM:           "Thông báo tự do",
    NEW_PRODUCT:      "Sản phẩm mới",
  };
  return map[t.templateCode] ?? t.titleTemplate;
}

export default function CampaignForm({ mode, initial }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [saving, setSaving] = useState<"draft" | "send" | null>(null);
  const [error, setError]   = useState("");

  // Variable insertion
  const titleRef = useRef<HTMLInputElement>(null);
  const msgRef   = useRef<HTMLTextAreaElement>(null);
  const [focusedField, setFocusedField] = useState<"title" | "message">("title");

  const insertVar = (key: string) => {
    const token = `{{${key}}}`;
    if (focusedField === "title" && titleRef.current) {
      const el = titleRef.current;
      const s = el.selectionStart ?? title.length;
      const e = el.selectionEnd   ?? title.length;
      setTitle(title.slice(0, s) + token + title.slice(e));
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + token.length, s + token.length); });
    } else if (msgRef.current) {
      const el = msgRef.current;
      const s = el.selectionStart ?? message.length;
      const e = el.selectionEnd   ?? message.length;
      setMessage(message.slice(0, s) + token + message.slice(e));
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + token.length, s + token.length); });
    }
  };

  // ── Form fields ──────────────────────────────────────────────────────────
  const [title, setTitle]         = useState(initial?.titleOverride ?? "");
  const [message, setMessage]     = useState(initial?.messageOverride ?? "");
  const [templateCode, setTemplateCode] = useState(initial?.templateCode ?? "");
  const [audience, setAudience]   = useState<CampaignTargetType>(initial?.targetType ?? "ALL");
  const [audienceInput, setAudienceInput] = useState(initial?.targetValues?.join(", ") ?? "");
  const [imageUrl, setImageUrl]   = useState(initial?.imageUrl ?? "");
  const [linkType, setLinkType]   = useState<ActionType>((initial?.actionType as ActionType) ?? "none");
  const [linkTarget, setLinkTarget] = useState(initial?.actionTarget ?? "");
  const [scheduledAt, setScheduled] = useState(
    initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : ""
  );

  useEffect(() => {
    getActiveTemplates().then(r => setTemplates(r.data ?? [])).catch(() => {});
  }, []);

  const handleTemplateChange = (code: string) => {
    setTemplateCode(code);
    const t = templates.find(t => t.templateCode === code);
    if (t) {
      if (!title)   setTitle(t.titleTemplate);
      if (!message) setMessage(t.messageTemplate);
    }
  };

  const parseTargetValues = (): string[] => {
    if (audience === "ALL") return [];
    return audienceInput.split(",").map(v => v.trim()).filter(Boolean);
  };

  const buildPayload = (): CreateCampaignRequest | UpdateCampaignRequest => ({
    campaignName: title.trim() || "Thông báo " + new Date().toLocaleDateString("vi-VN"),
    sourceType: "ADMIN",
    targetType: audience,
    targetValues: parseTargetValues(),
    templateCode: templateCode || undefined,
    titleOverride:   title.trim()   || undefined,
    messageOverride: message.trim() || undefined,
    imageUrl:    imageUrl.trim()    || undefined,
    actionType:  linkType !== "none" ? linkType : undefined,
    actionTarget: linkType !== "none" ? linkTarget.trim() || undefined : undefined,
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
  });

  const handleAction = async (action: "draft" | "send") => {
    setError("");
    if (!templateCode && (!title.trim() || !message.trim())) {
      setError("Vui lòng chọn mẫu thông báo, hoặc nhập đủ cả Tiêu đề và Nội dung.");
      return;
    }
    setSaving(action);
    try {
      let campaignId: number;
      if (mode === "create") {
        const res = await createCampaign(buildPayload() as CreateCampaignRequest);
        if (!res.data?.campaignId) throw new Error("Không nhận được ID chiến dịch từ server.");
        campaignId = res.data.campaignId;
      } else {
        const res = await updateCampaign(initial!.campaignId, buildPayload() as UpdateCampaignRequest);
        campaignId = res.data?.campaignId ?? initial!.campaignId;
      }
      if (action === "send") await sendCampaign(campaignId);
      router.push("/admin/campaigns");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSaving(null);
    }
  };

  const currentAudience = AUDIENCE_OPTIONS.find(a => a.value === audience)!;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-10">
      {/* Back */}
      <button type="button" onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={15} /> Quay lại danh sách
      </button>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Section 1: Nội dung ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center gap-2">
          <Bell size={18} className="text-brand-500" />
          <h3 className="font-semibold text-gray-800 dark:text-white">Nội dung thông báo</h3>
        </div>

        {templates.length > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-gray-500">Dùng mẫu có sẵn (tuỳ chọn)</label>
            <select
              value={templateCode}
              onChange={e => handleTemplateChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">— Không dùng mẫu —</option>
              {templates.map(t => (
                <option key={t.templateCode} value={t.templateCode}>
                  {templateLabel(t)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tiêu đề <span className="text-red-400">*</span>
            </label>
            <input ref={titleRef} type="text" value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={() => setFocusedField("title")}
              placeholder="Ví dụ: Flash Sale — Giảm 50% hôm nay!"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>

          <VariableChips focusedField={focusedField} onInsert={insertVar} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Nội dung</label>
            <textarea ref={msgRef} rows={3} value={message}
              onChange={e => setMessage(e.target.value)}
              onFocus={() => setFocusedField("message")}
              placeholder="Mô tả ngắn về thông báo này..."
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>

          <ImageUploader value={imageUrl} onChange={setImageUrl} folder="campaigns" />

          <ActionPicker
            actionType={linkType}
            actionTarget={linkTarget}
            onTypeChange={setLinkType}
            onTargetChange={setLinkTarget}
          />
        </div>

        {/* Live preview */}
        {(title || message) && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Xem trước</p>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
                <Bell size={18} className="text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  <TemplatePreview text={title || "Tiêu đề"} />
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  <TemplatePreview text={message || "Nội dung thông báo..."} />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Đối tượng ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.03]">
        <h3 className="mb-4 font-semibold text-gray-800 dark:text-white">Gửi đến</h3>
        <div className="space-y-3">
          {AUDIENCE_OPTIONS.map(opt => (
            <label key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                audience === opt.value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
              }`}>
              <input type="radio" name="audience" value={opt.value}
                checked={audience === opt.value}
                onChange={() => setAudience(opt.value)}
                className="sr-only" />
              <span className={`mt-0.5 ${audience === opt.value ? "text-brand-500" : "text-gray-400"}`}>
                {opt.icon}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  audience === opt.value ? "text-brand-700 dark:text-brand-300" : "text-gray-800 dark:text-white"
                }`}>{opt.label}</p>
                <p className="mt-0.5 text-xs text-gray-400">{opt.sub}</p>
                {audience === opt.value && opt.showInput && (
                  <>
                    <input type="text" value={audienceInput}
                      onChange={e => setAudienceInput(e.target.value)}
                      placeholder={opt.inputPlaceholder}
                      className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                    <p className="mt-1 text-xs text-gray-400">{opt.inputLabel}</p>
                  </>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Section 3: Thời gian ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.03]">
        <h3 className="mb-1 font-semibold text-gray-800 dark:text-white">Thời gian gửi</h3>
        <p className="mb-4 text-xs text-gray-400">Để trống nếu muốn gửi ngay hoặc lưu nháp trước.</p>
        <input type="datetime-local" value={scheduledAt}
          onChange={e => setScheduled(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        {scheduledAt && (
          <p className="mt-2 text-xs text-blue-500">
            📅 Sẽ tự động gửi vào {new Date(scheduledAt).toLocaleString("vi-VN")}
          </p>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button type="button" onClick={() => handleAction("draft")}
          disabled={saving !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300">
          <Save size={16} />
          {saving === "draft" ? "Đang lưu..." : "Lưu nháp"}
        </button>
        <button type="button" onClick={() => handleAction("send")}
          disabled={saving !== null}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
          <Send size={16} />
          {saving === "send"
            ? "Đang gửi..."
            : mode === "create" ? "Tạo & Gửi ngay" : "Lưu & Gửi ngay"}
        </button>
      </div>
    </div>
  );
}
