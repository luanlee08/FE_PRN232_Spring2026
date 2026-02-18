"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { Send, Calendar, Users, User, Filter } from "lucide-react";
import {
  AdminNotificationService,
  SendNotificationRequest,
  TargetType,
} from "@/services/admin_services/admin.notification.service";
import { AVAILABLE_TEMPLATES } from "@/utils/notification.helpers";
import { PAYLOAD_EXAMPLES, validatePayload } from "@/utils/notification.payload";
import toast from "react-hot-toast";
import PayloadBuilder from "./PayloadBuilder";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Form state
  const [templateCode, setTemplateCode] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [payload, setPayload] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("All");
  const [targetUserIds, setTargetUserIds] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTemplateCode("");
    setTitle("");
    setMessage("");
    setPayload("");
    setTargetType("All");
    setTargetUserIds("");
    setIsScheduled(false);
    setScheduledFor("");
    setErrors({});
  };

  // Auto-fill example payload when template changes
  const handleTemplateChange = (value: string) => {
    setTemplateCode(value);

    // Auto-fill example payload based on template type
    const template = AVAILABLE_TEMPLATES.find((t) => t.code === value);
    if (template) {
      const category = template.category;

      if (category === "ORDER") {
        setPayload(PAYLOAD_EXAMPLES.order);
      } else if (category === "PROMOTION") {
        setPayload(PAYLOAD_EXAMPLES.promotion);
      } else if (category === "PAYMENT") {
        setPayload(PAYLOAD_EXAMPLES.payment);
      } else {
        setPayload(PAYLOAD_EXAMPLES.system);
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!templateCode) {
      newErrors.templateCode = "Vui lòng chọn template";
    }

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

    if (payload.trim()) {
      const payloadValidation = validatePayload(payload);
      if (!payloadValidation.isValid) {
        newErrors.payload = payloadValidation.error || "Payload không hợp lệ";
      } else if (payload.length > 1000) {
        newErrors.payload = "Payload không được vượt quá 1000 ký tự";
      }
    }

    if (targetType === "Specific" && !targetUserIds.trim()) {
      newErrors.targetUserIds = "Vui lòng nhập danh sách User IDs";
    }

    if (isScheduled && !scheduledFor) {
      newErrors.scheduledFor = "Vui lòng chọn thời gian lên lịch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: SendNotificationRequest = {
        templateCode,
        title: title.trim(),
        message: message.trim(),
        payload: payload.trim() || undefined,
        targetType,
        targetUserIds:
          targetType === "Specific"
            ? targetUserIds
              .split(",")
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id))
            : undefined,
        scheduledFor: isScheduled && scheduledFor ? scheduledFor : undefined,
      };

      const response = await AdminNotificationService.sendNotification(request);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isScheduled
            ? "Đã lên lịch gửi thông báo thành công!"
            : "Thông báo đã được gửi thành công!"
        );
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Send notification error:", error);
      toast.error(error.message || "Không thể gửi thông báo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-brand-500" />
            Gửi Thông Báo
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tạo và gửi thông báo đến người dùng
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Template Code */}
          <div>
            <Label htmlFor="templateCode">
              Template <span className="text-red-500">*</span>
            </Label>
            <Select
              options={AVAILABLE_TEMPLATES.map((t) => ({
                value: t.code,
                label: t.label,
              }))}
              placeholder="Chọn loại thông báo"
              onChange={handleTemplateChange}
              defaultValue={templateCode}
              className={errors.templateCode ? "border-red-500" : ""}
            />
            {errors.templateCode && (
              <p className="text-xs text-red-500 mt-1">{errors.templateCode}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Nhập tiêu đề thông báo (tối đa 255 ký tự)"
              defaultValue={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              className={errors.title ? "border-red-500" : ""}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title ? (
                <p className="text-xs text-red-500">{errors.title}</p>
              ) : (
                <p className="text-xs text-gray-400">Tối đa 255 ký tự</p>
              )}
              <p className="text-xs text-gray-400">{title.length}/255</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">
              Nội dung <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="message"
              placeholder="Nhập nội dung thông báo (tối đa 500 ký tự)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${errors.message
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                  : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
                }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.message ? (
                <p className="text-xs text-red-500">{errors.message}</p>
              ) : (
                <p className="text-xs text-gray-400">Tối đa 500 ký tự</p>
              )}
              <p className="text-xs text-gray-400">{message.length}/500</p>
            </div>
          </div>

          {/* Payload Builder (Optional) */}
          <PayloadBuilder
            value={payload}
            onChange={(json) => setPayload(json)}
            onValidationChange={(isValid, error) => {
              if (!isValid && error) {
                setErrors((prev) => ({ ...prev, payload: error }));
              } else {
                setErrors((prev) => {
                  const { payload, ...rest } = prev;
                  return rest;
                });
              }
            }}
          />
          {errors.payload && (
            <p className="text-xs text-red-500 mt-1">❌ {errors.payload}</p>
          )}

          {/* Target Type */}
          <div>
            <Label>
              Đối tượng nhận <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="All"
                  checked={targetType === "All"}
                  onChange={(e) => setTargetType(e.target.value as TargetType)}
                  className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                />
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Tất cả người dùng
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="Specific"
                  checked={targetType === "Specific"}
                  onChange={(e) => setTargetType(e.target.value as TargetType)}
                  className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                />
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Người dùng cụ thể
                </span>
              </label>
            </div>
          </div>

          {/* Target User IDs (if Specific) */}
          {targetType === "Specific" && (
            <div>
              <Label htmlFor="targetUserIds">
                Danh sách User IDs <span className="text-red-500">*</span>
              </Label>
              <Input
                id="targetUserIds"
                type="text"
                placeholder="VD: 1, 2, 5, 10 (cách nhau bởi dấu phẩy)"
                defaultValue={targetUserIds}
                onChange={(e) => setTargetUserIds(e.target.value)}
                error={!!errors.targetUserIds}
                className={errors.targetUserIds ? "border-red-500" : ""}
              />
              {errors.targetUserIds && (
                <p className="text-xs text-red-500 mt-1">{errors.targetUserIds}</p>
              )}
            </div>
          )}

          {/* Schedule Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lên lịch gửi
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gửi thông báo vào thời gian cụ thể
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-500/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Scheduled DateTime (if scheduled) */}
          {isScheduled && (
            <div>
              <Label htmlFor="scheduledFor">
                Thời gian gửi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                defaultValue={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                error={!!errors.scheduledFor}
                className={errors.scheduledFor ? "border-red-500" : ""}
              />
              {errors.scheduledFor && (
                <p className="text-xs text-red-500 mt-1">{errors.scheduledFor}</p>
              )}
            </div>
          )}
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
            startIcon={isSubmitting ? null : <Send className="w-4 h-4" />}
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
