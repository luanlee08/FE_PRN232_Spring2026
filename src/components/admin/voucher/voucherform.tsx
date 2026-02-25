"use client";

import { useState, useEffect } from "react";
import { AdminVoucherService, VoucherAdmin } from "@/services/admin_services/admin.voucher.service";

interface Props {
  submitText?: string;
  initialData?: VoucherAdmin | null;
  onSuccess?: () => void;
}

export default function VoucherForm({ submitText = "Lưu Voucher", initialData, onSuccess }: Props) {
  const [voucherCode, setVoucherCode] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">("");
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState<number | "">("");
  const [isStackable, setIsStackable] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bind edit data
  useEffect(() => {
    if (initialData) {
      setVoucherCode(initialData.voucherCode);
      setDiscountType(initialData.discountType);
      setDiscountValue(initialData.discountValue);
      setMaxDiscountAmount(initialData.maxDiscountAmount ?? "");
      setMinOrderAmount(initialData.minOrderAmount ?? "");
      setUsageLimitPerUser(initialData.usageLimitPerUser ?? "");
      setIsStackable(initialData.isStackable);
      setStartDate(initialData.startDate.slice(0, 16)); // format for datetime-local
      setEndDate(initialData.endDate.slice(0, 16));
      setStatus(initialData.status);
      setIsDeleted(initialData.isDeleted);
    } else {
      setVoucherCode("");
      setDiscountType("Percentage");
      setDiscountValue("");
      setMaxDiscountAmount("");
      setMinOrderAmount("");
      setUsageLimitPerUser("");
      setIsStackable(false);
      setStartDate("");
      setEndDate("");
      setStatus("Active");
      setIsDeleted(false);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!voucherCode.trim() || discountValue === "" || !startDate || !endDate) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);

    try {
      if (initialData) {
        await AdminVoucherService.update(initialData.voucherId, {
          voucherCode: voucherCode.trim(),
          discountType,
          discountValue: Number(discountValue),
          maxDiscountAmount: maxDiscountAmount !== "" ? Number(maxDiscountAmount) : undefined,
          minOrderAmount: minOrderAmount !== "" ? Number(minOrderAmount) : undefined,
          usageLimitPerUser: usageLimitPerUser !== "" ? Number(usageLimitPerUser) : undefined,
          isStackable,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status,
          isDeleted,
        });
      } else {
        await AdminVoucherService.create({
          voucherTypeId: 1,
          voucherCode: voucherCode.trim(),
          discountType,
          discountValue: Number(discountValue),
          maxDiscountAmount: maxDiscountAmount !== "" ? Number(maxDiscountAmount) : undefined,
          minOrderAmount: minOrderAmount !== "" ? Number(minOrderAmount) : undefined,
          usageLimitPerUser: usageLimitPerUser !== "" ? Number(usageLimitPerUser) : undefined,
          isStackable,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status,
        });
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
      {/* Voucher Code */}
      <div>
        <label className="mb-1 block font-medium">
          Mã voucher <span className="text-red-500">*</span>
        </label>
        <input
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
          placeholder="VD: SUMMER2026"
          className="w-full rounded-lg border px-3 py-2 font-mono uppercase"
        />
      </div>

      {/* Discount Type & Value */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-medium">
            Loại giảm giá <span className="text-red-500">*</span>
          </label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="Percentage">Phần trăm (%)</option>
            <option value="Fixed">Cố định (VNĐ)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Giá trị giảm <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step={discountType === "Percentage" ? 1 : 1000}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value ? Number(e.target.value) : "")}
            placeholder={discountType === "Percentage" ? "VD: 10" : "VD: 50000"}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      {/* Min Order & Max Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-medium">Đơn tối thiểu (VNĐ)</label>
          <input
            type="number"
            min={0}
            step={1000}
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="VD: 200000"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Giảm tối đa (VNĐ)</label>
          <input
            type="number"
            min={0}
            step={1000}
            value={maxDiscountAmount}
            onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="VD: 100000"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      {/* Usage Limit */}
      <div>
        <label className="mb-1 block font-medium">Giới hạn lượt dùng / người</label>
        <input
          type="number"
          min={0}
          value={usageLimitPerUser}
          onChange={(e) => setUsageLimitPerUser(e.target.value ? Number(e.target.value) : "")}
          placeholder="Để trống = không giới hạn"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-medium">
            Ngày bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Ngày kết thúc <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      {/* Stackable */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isStackable"
          checked={isStackable}
          onChange={(e) => setIsStackable(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="isStackable" className="font-medium">
          Cho phép cộng dồn với voucher khác
        </label>
      </div>

      {/* Status */}
      <div>
        <label className="mb-1 block font-medium">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="Active">Hoạt động</option>
          <option value="Inactive">Không hoạt động</option>
        </select>
      </div>

      {/* IsDeleted (only for edit) */}
      {initialData && (
        <div>
          <label className="mb-1 block font-medium">Hiển thị</label>
          <select
            value={isDeleted ? "deleted" : "visible"}
            onChange={(e) => setIsDeleted(e.target.value === "deleted")}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="visible">Hiển thị</option>
            <option value="deleted">Đã xóa</option>
          </select>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onSuccess}
          className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-100"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : submitText}
        </button>
      </div>
    </form>
  );
}
