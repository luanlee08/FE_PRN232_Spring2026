"use client";

import React, { useState, useEffect, useRef } from "react";
import { VariableChips } from "@/components/admin/shared/VariableChips";
import ImageUploader from "@/components/admin/shared/ImageUploader";
import ActionPicker, { ActionType } from "@/components/admin/shared/ActionPicker";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Select from "../form/Select";
import {
  Send,
  Calendar,
  Users,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  AdminNotificationService,
  SendNotificationRequest,
  TargetType,
  TemplateOptionDto,
  AccountSearchResultDto,
} from "@/services/admin_services/admin.notification.service";
import type { AdminNotificationType } from "@/types/notification";
import UserSearchSelect from "./UserSearchSelect";
import NotificationPreview from "./NotificationPreview";
import toast from "react-hot-toast";

/* ─────────────────── Constants ─────────────────── */

const NOTIFICATION_TYPE_OPTIONS: { value: AdminNotificationType; label: string }[] = [
  { value: "new_product", label: "🛍️ Sản phẩm mới" },
  { value: "voucher", label: "🎟️ Voucher" },
  { value: "promotion", label: "📢 Khuyến mãi" },
  { value: "system", label: "⚙️ Thông báo hệ thống" },
  { value: "custom", label: "✏️ Tùy chỉnh" },
];

/* ─────────────────── Props ─────────────────── */

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ─────────────────── Component ─────────────────── */

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  /* ── Form state ── */
  const [templateCode, setTemplateCode] = useState<string>("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [notificationType, setNotificationType] = useState<AdminNotificationType>("custom");
  const [actionType, setActionType] = useState<ActionType>("none");
  const [actionTarget, setActionTarget] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("All");
  const [selectedUsers, setSelectedUsers] = useState<AccountSearchResultDto[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");

  /* ── Server data ── */
  const [templates, setTemplates] = useState<TemplateOptionDto[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  /* ── UI state ── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  /* ── Variable insertion ── */
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

  /* ── Load templates on open ── */
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }
    const load = async () => {
      setIsLoadingTemplates(true);
      try {
        const res = await AdminNotificationService.getTemplates();
        if (res.status === 200 && res.data) {
          setTemplates(res.data);
        }
      } catch {
        // silently ignore, templates list is optional
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    load();
  }, [isOpen]);

  const resetForm = () => {
    setTemplateCode("");
    setTitle("");
    setMessage("");
    setImageUrl("");
    setNotificationType("custom");
    setActionType("none");
    setActionTarget("");
    setTargetType("All");
    setSelectedUsers([]);
    setIsScheduled(false);
    setScheduledFor("");
    setErrors({});
    setShowAdvanced(false);
  };

  /* ── Template auto-fill + notification type sync ── */
  const handleTemplateChange = (value: string) => {
    setTemplateCode(value);
    if (!value) return;
    const tpl = templates.find((t) => t.templateCode === value);
    if (tpl) {
      setTitle(tpl.title);
      setMessage(tpl.message);
    }
    // Auto-sync notificationType based on template code pattern
    const code = value.toUpperCase();
    if (code.startsWith("ORDER_") || code.startsWith("SHIPPING") || code.startsWith("REVIEW_")) {
      setNotificationType("system");
    } else if (code.includes("VOUCHER") || code.includes("PROMO")) {
      setNotificationType("voucher");
    } else if (code.includes("PAYMENT") || code.includes("WALLET") || code.includes("REFUND")) {
      setNotificationType("system");
    } else if (code.includes("PRODUCT") || code.includes("NEW_")) {
      setNotificationType("new_product");
    } else if (code.includes("ANNOUNCE") || code.includes("SALE") || code.includes("CAMPAIGN")) {
      setNotificationType("promotion");
    }
    // else: keep the user’s current selection
  };

  /* ── Validation ── */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    } else if (title.length > 255) {
      newErrors.title = "Tiêu đề không được vượt quá 255 ký tự";
    }

    if (!message.trim()) {
      newErrors.message = "Vui lòng nhập nội dung";
    } else if (message.length > 500) {
      newErrors.message = "Nội dung không được vượt quá 500 ký tự";
    }

    if (actionType !== "none" && !actionTarget.trim()) {
      newErrors.actionTarget = "Vui lòng nhập đích liên kết";
    }

    if (targetType === "User" && selectedUsers.length === 0) {
      newErrors.targetUsers = "Vui lòng chọn ít nhất 1 người dùng";
    }

    if (isScheduled && !scheduledFor) {
      newErrors.scheduledFor = "Vui lòng chọn thời gian lên lịch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      const request: SendNotificationRequest = {
        templateCode: templateCode || undefined,
        title: title.trim(),
        message: message.trim(),
        imageUrl: imageUrl.trim() || undefined,
        actionType: actionType !== "none" ? actionType : undefined,
        actionTarget: actionType !== "none" ? actionTarget.trim() || undefined : undefined,
        targetType,
        targetUserIds: targetType === "User" ? selectedUsers.map((u) => u.accountId) : undefined,
        // Convert local datetime string to ISO UTC so the BE Hangfire scheduler
        // receives the correct timezone regardless of where the server runs
        scheduledFor: isScheduled && scheduledFor
          ? new Date(scheduledFor).toISOString()
          : undefined,
      };

      const response = await AdminNotificationService.sendNotification(request);

      if (response.status === 200 || response.status === 201 || response.status === 202) {
        toast.success(
          response.status === 202
            ? "Đã lên lịch gửi thông báo thành công!"
            : `Đã gửi thông báo thành công! (${response.data ?? 0} người nhận)`,
        );
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi gửi thông báo");
      }
    } catch (error: any) {
      console.error("Send notification error:", error);
      toast.error(error?.response?.data?.message || error.message || "Không thể gửi thông báo");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Helpers ── */
  const templateOptions = [
    { value: "", label: "— Không dùng template —" },
    ...templates.map((t) => ({ value: t.templateCode, label: `${t.templateCode} — ${t.title}` })),
  ];

  /* ─────────────────── Render ─────────────────── */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl mx-4 max-h-[92vh] overflow-y-auto"
    >
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
            <Send className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gửi Thông Báo</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tạo và gửi thông báo đến người dùng — không cần viết code
            </p>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ─── Left Panel: Form ─── */}
          <div className="space-y-5">

            {/* ── Section 1: Nội dung ── */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 text-xs flex items-center justify-center font-bold">1</span>
                Nội dung thông báo
              </h3>

              {/* Template (optional) */}
              <div>
                <Label>
                  Template{" "}
                  <span className="text-gray-400 font-normal text-xs">(tùy chọn — tự điền tiêu đề &amp; nội dung)</span>
                </Label>
                {isLoadingTemplates ? (
                  <div className="flex items-center gap-2 h-10 text-sm text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tải template...
                  </div>
                ) : (
                  <Select
                    options={templateOptions}
                    placeholder="Không dùng template"
                    onChange={handleTemplateChange}
                    defaultValue={templateCode}
                  />
                )}
                {templateCode && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
                    ✓ Đã điền sẵn nội dung từ template. Bạn có thể chỉnh bên dưới.
                  </p>
                )}
              </div>

              {/* Loại thông báo */}
              <div>
                <Label>Loại thông báo <span className="text-red-500">*</span></Label>
                <Select
                  options={NOTIFICATION_TYPE_OPTIONS}
                  placeholder="Chọn loại"
                  onChange={(v) => setNotificationType(v as AdminNotificationType)}
                  defaultValue={notificationType}
                />
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="notif-title">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <input
                  ref={titleRef}
                  id="notif-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setFocusedField("title")}
                  placeholder="VD: Sản phẩm mới vừa về! 🔥"
                  maxLength={255}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                    errors.title
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                      : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title ? (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  ) : (
                    <span />
                  )}
                  <p className={`text-xs ml-auto ${title.length > 230 ? "text-orange-500" : "text-gray-400"}`}>
                    {title.length}/255
                  </p>
                </div>
              </div>

              {/* Variable chips */}
              <VariableChips focusedField={focusedField} onInsert={insertVar} />

              {/* Message */}
              <div>
                <Label htmlFor="notif-message">
                  Nội dung <span className="text-red-500">*</span>
                </Label>
                <textarea
                  ref={msgRef}
                  id="notif-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setFocusedField("message")}
                  placeholder="VD: Bộ sưu tập hè 2026 đã có mặt — Giảm đến 40% trong hôm nay!"
                  rows={3}
                  maxLength={500}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                    errors.message
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                      : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.message ? (
                    <p className="text-xs text-red-500">{errors.message}</p>
                  ) : (
                    <span />
                  )}
                  <p className={`text-xs ml-auto ${message.length > 450 ? "text-orange-500" : "text-gray-400"}`}>
                    {message.length}/500
                  </p>
                </div>
              </div>

              {/* Image */}
              <ImageUploader value={imageUrl} onChange={setImageUrl} folder="notifications" />
            </section>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* ── Section 2: Hành động khi click ── */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 text-xs flex items-center justify-center font-bold">2</span>
                Khi bấm vào thông báo
              </h3>
              <ActionPicker
                actionType={actionType}
                actionTarget={actionTarget}
                onTypeChange={setActionType}
                onTargetChange={setActionTarget}
                error={errors.actionTarget}
              />
            </section>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* ── Section 3: Đối tượng nhận ── */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 text-xs flex items-center justify-center font-bold">3</span>
                <Users className="w-4 h-4" />
                Đối tượng nhận
              </h3>

              <div className="flex gap-3">
                {/* All */}
                <label
                  className={`flex-1 flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition text-sm ${
                    targetType === "All"
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === "All"}
                    onChange={() => { setTargetType("All"); setSelectedUsers([]); }}
                    className="sr-only"
                  />
                  <Users className="w-4 h-4 shrink-0" />
                  Tất cả người dùng
                </label>

                {/* Specific users */}
                <label
                  className={`flex-1 flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition text-sm ${
                    targetType === "User"
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === "User"}
                    onChange={() => setTargetType("User")}
                    className="sr-only"
                  />
                  <User className="w-4 h-4 shrink-0" />
                  Chọn cụ thể
                </label>
              </div>

              {/* User search multi-select */}
              {targetType === "User" && (
                <div>
                  <UserSearchSelect
                    selectedUsers={selectedUsers}
                    onChange={setSelectedUsers}
                  />
                  {errors.targetUsers && (
                    <p className="text-xs text-red-500 mt-1">{errors.targetUsers}</p>
                  )}
                </div>
              )}
            </section>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* ── Section 4: Hẹn giờ (collapsible) ── */}
            <section>
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Hẹn giờ gửi
                  {isScheduled && scheduledFor && (
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-normal">
                      (đã bật)
                    </span>
                  )}
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3 px-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-brand-500 transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Lên lịch gửi</span>
                  </label>

                  {isScheduled && (
                    <div>
                      <Label htmlFor="notif-scheduled">Thời gian gửi <span className="text-red-500">*</span></Label>
                      <input
                        id="notif-scheduled"
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                          errors.scheduledFor
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                            : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
                        }`}
                      />
                      {errors.scheduledFor && (
                        <p className="text-xs text-red-500 mt-1">{errors.scheduledFor}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ─── Right Panel: Preview ─── */}
          <div className="lg:sticky lg:top-0 lg:self-start">
            <NotificationPreview
              title={title}
              message={message}
              imageUrl={imageUrl}
              notificationType={notificationType}
              actionType={actionType}
              actionTarget={actionTarget}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button size="md" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )
            }
          >
            {isSubmitting
              ? "Đang gửi..."
              : isScheduled
                ? "Lên lịch gửi"
                : "Gửi ngay"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SendNotificationModal;