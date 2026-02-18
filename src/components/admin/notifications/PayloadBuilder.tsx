"use client";

import React, { useState, useEffect } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { Code, Package, ShoppingCart, Gift, Bell } from "lucide-react";

export type PayloadType = "order" | "product" | "promotion" | "system" | "none";

interface PayloadBuilderProps {
  value?: string;
  onChange: (jsonPayload: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

interface PayloadFormData {
  type: PayloadType;
  orderId?: string;
  productId?: string;
  promotionId?: string;
  link?: string;
}

const PayloadBuilder: React.FC<PayloadBuilderProps> = ({
  value,
  onChange,
  onValidationChange,
}) => {
  const [mode, setMode] = useState<"builder" | "json">("builder");
  const [formData, setFormData] = useState<PayloadFormData>({
    type: "none",
  });
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");

  // Initialize from existing value
  useEffect(() => {
    if (value && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.type) {
          setFormData({
            type: parsed.type,
            orderId: parsed.orderId?.toString(),
            productId: parsed.productId?.toString(),
            promotionId: parsed.promotionId?.toString(),
            link: parsed.link,
          });
        }
        setJsonText(value);
      } catch (e) {
        setJsonText(value);
      }
    }
  }, [value]);

  // Generate JSON from form data
  const generateJson = (data: PayloadFormData): string => {
    if (data.type === "none") {
      return "";
    }

    const payload: any = {
      type: data.type,
    };

    switch (data.type) {
      case "order":
        if (data.orderId) payload.orderId = parseInt(data.orderId);
        if (data.link) payload.link = data.link;
        break;
      case "product":
        if (data.productId) payload.productId = parseInt(data.productId);
        if (data.link) payload.link = data.link;
        break;
      case "promotion":
        if (data.promotionId) payload.promotionId = parseInt(data.promotionId);
        if (data.link) payload.link = data.link;
        break;
      case "system":
        if (data.link) payload.link = data.link;
        break;
    }

    return JSON.stringify(payload, null, 2);
  };

  // Update form data and notify parent
  const updateFormData = (updates: Partial<PayloadFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);

    const json = generateJson(newData);
    setJsonText(json);
    onChange(json);
    
    // Validate
    if (json) {
      try {
        JSON.parse(json);
        setJsonError("");
        onValidationChange?.(true);
      } catch (e) {
        setJsonError("JSON không hợp lệ");
        onValidationChange?.(false, "JSON không hợp lệ");
      }
    } else {
      setJsonError("");
      onValidationChange?.(true);
    }
  };

  // Handle JSON text change
  const handleJsonChange = (text: string) => {
    setJsonText(text);
    onChange(text);

    if (!text.trim()) {
      setJsonError("");
      onValidationChange?.(true);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setJsonError("");
      onValidationChange?.(true);

      // Try to sync back to form
      if (parsed.type) {
        setFormData({
          type: parsed.type,
          orderId: parsed.orderId?.toString(),
          productId: parsed.productId?.toString(),
          promotionId: parsed.promotionId?.toString(),
          link: parsed.link,
        });
      }
    } catch (e: any) {
      setJsonError(e.message || "JSON không hợp lệ");
      onValidationChange?.(false, "JSON không hợp lệ");
    }
  };

  // Get placeholder based on type
  const getPlaceholder = (): string => {
    switch (formData.type) {
      case "order":
        return 'Ví dụ: {"type": "order", "orderId": 123, "link": "/orders/123"}';
      case "product":
        return 'Ví dụ: {"type": "product", "productId": 456, "link": "/products/456"}';
      case "promotion":
        return 'Ví dụ: {"type": "promotion", "promotionId": 789, "link": "/promotions/789"}';
      case "system":
        return 'Ví dụ: {"type": "system", "link": "/notifications"}';
      default:
        return 'Ví dụ: {"type": "order", "orderId": 123}';
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <Label>
          Payload JSON <span className="text-gray-400">(Tùy chọn)</span>
        </Label>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("builder")}
            className={`px-3 py-1.5 text-xs font-medium transition ${
              mode === "builder"
                ? "bg-brand-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            📝 Form Builder
          </button>
          <button
            type="button"
            onClick={() => setMode("json")}
            className={`px-3 py-1.5 text-xs font-medium transition ${
              mode === "json"
                ? "bg-brand-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            &lt;/&gt; JSON Editor
          </button>
        </div>
      </div>

      {/* Builder Mode */}
      {mode === "builder" && (
        <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          {/* Type Selection */}
          <div>
            <Label htmlFor="payloadType">Loại Payload</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
              <button
                type="button"
                onClick={() => updateFormData({ type: "none", orderId: undefined, productId: undefined, promotionId: undefined, link: undefined })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                  formData.type === "none"
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="text-2xl">⭕</div>
                <span className="text-xs font-medium">Không có</span>
              </button>

              <button
                type="button"
                onClick={() => updateFormData({ type: "order", productId: undefined, promotionId: undefined })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                  formData.type === "order"
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xs font-medium">Đơn hàng</span>
              </button>

              <button
                type="button"
                onClick={() => updateFormData({ type: "product", orderId: undefined, promotionId: undefined })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                  formData.type === "product"
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <Package className="w-6 h-6" />
                <span className="text-xs font-medium">Sản phẩm</span>
              </button>

              <button
                type="button"
                onClick={() => updateFormData({ type: "promotion", orderId: undefined, productId: undefined })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                  formData.type === "promotion"
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <Gift className="w-6 h-6" />
                <span className="text-xs font-medium">Khuyến mãi</span>
              </button>

              <button
                type="button"
                onClick={() => updateFormData({ type: "system", orderId: undefined, productId: undefined, promotionId: undefined })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                  formData.type === "system"
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <Bell className="w-6 h-6" />
                <span className="text-xs font-medium">Hệ thống</span>
              </button>
            </div>
          </div>

          {/* Dynamic Fields Based on Type */}
          {formData.type !== "none" && (
            <div className="space-y-3">
              {/* Order ID */}
              {formData.type === "order" && (
                <div>
                  <Label htmlFor="orderId">Mã Đơn Hàng</Label>
                  <Input
                    id="orderId"
                    type="number"
                    placeholder="Nhập ID đơn hàng (VD: 123)"
                    defaultValue={formData.orderId || ""}
                    onChange={(e) => updateFormData({ orderId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Đường dẫn sẽ là: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">/orders/{formData.orderId || "123"}</code>
                  </p>
                </div>
              )}

              {/* Product ID */}
              {formData.type === "product" && (
                <div>
                  <Label htmlFor="productId">Mã Sản Phẩm</Label>
                  <Input
                    id="productId"
                    type="number"
                    placeholder="Nhập ID sản phẩm (VD: 456)"
                    defaultValue={formData.productId || ""}
                    onChange={(e) => updateFormData({ productId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Đường dẫn sẽ là: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">/products/{formData.productId || "456"}</code>
                  </p>
                </div>
              )}

              {/* Promotion ID */}
              {formData.type === "promotion" && (
                <div>
                  <Label htmlFor="promotionId">Mã Khuyến Mãi</Label>
                  <Input
                    id="promotionId"
                    type="number"
                    placeholder="Nhập ID khuyến mãi (VD: 789)"
                    defaultValue={formData.promotionId || ""}
                    onChange={(e) => updateFormData({ promotionId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Đường dẫn sẽ là: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">/promotions/{formData.promotionId || "789"}</code>
                  </p>
                </div>
              )}

              {/* Custom Link (All Types) */}
              <div>
                <Label htmlFor="payloadLink">Đường Dẫn Tùy Chỉnh</Label>
                <Input
                  id="payloadLink"
                  type="text"
                  placeholder={`/custom-page (Mặc định: auto-generate từ ${formData.type})`}
                  defaultValue={formData.link || ""}
                  onChange={(e) => updateFormData({ link: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Để trống để tự động tạo đường dẫn từ ID
                </p>
              </div>
            </div>
          )}

          {/* JSON Preview */}
          {formData.type !== "none" && (
            <div>
              <Label>Xem trước JSON</Label>
              <pre className="mt-2 p-3 rounded-lg bg-gray-900 text-green-400 text-xs font-mono overflow-x-auto">
                {jsonText || "{}"}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* JSON Mode */}
      {mode === "json" && (
        <div>
          <textarea
            placeholder={getPlaceholder()}
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={8}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm font-mono shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
              jsonError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
            }`}
          />
          {jsonError && (
            <p className="text-xs text-red-500 mt-1">❌ {jsonError}</p>
          )}
          {!jsonError && jsonText && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              ✅ JSON hợp lệ
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Dữ liệu JSON để deep linking (tối đa 1000 ký tự) · {jsonText.length}/1000
          </p>
        </div>
      )}
    </div>
  );
};

export default PayloadBuilder;
