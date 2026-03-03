"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  AdminProductService,
  type ProductAdmin,
} from "@/services/admin_services/admin.product.service";
import {
  AdminVoucherService,
  type VoucherAdmin,
} from "@/services/admin_services/admin.voucher.service";

/**
 * ActionPicker — visual "what happens when user taps the notification" picker.
 * Products and vouchers are searchable inline — staff never needs to leave the form.
 */

export type ActionType = "none" | "product" | "voucher" | "url";

interface ActionOption {
  value: ActionType;
  emoji: string;
  label: string;
  description: string;
}

const OPTIONS: ActionOption[] = [
  {
    value: "none",
    emoji: "🔕",
    label: "Không điều hướng",
    description: "Thông báo chỉ hiển thị, không mở trang nào khi bấm vào.",
  },
  {
    value: "product",
    emoji: "🛍️",
    label: "Dẫn đến sản phẩm",
    description: "Người dùng bấm vào sẽ được mở thẳng trang chi tiết sản phẩm.",
  },
  {
    value: "voucher",
    emoji: "🎟️",
    label: "Dẫn đến voucher",
    description: "Người dùng bấm vào sẽ thấy chi tiết và nút áp dụng voucher.",
  },
  {
    value: "url",
    emoji: "🔗",
    label: "Dẫn đến trang web",
    description: "Mở một trang bất kỳ trong hệ thống khi người dùng bấm vào.",
  },
];

interface ActionPickerProps {
  actionType: ActionType;
  actionTarget: string;
  onTypeChange: (type: ActionType) => void;
  onTargetChange: (target: string) => void;
  error?: string;
}

/* ─── Product search sub-component ─── */
function ProductSearch({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (id: string, label?: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductAdmin | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback((kw: string) => {
    if (!kw.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    AdminProductService.getAll({ page: 1, pageSize: 8, keyword: kw })
      .then(res => {
        setResults(res.data.items);
        setOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const handleInput = (kw: string) => {
    setQuery(kw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(kw), 350);
  };

  const pick = (p: ProductAdmin) => {
    setSelected(p);
    setQuery("");
    setOpen(false);
    onChange(String(p.id), p.name);
  };

  const clear = () => {
    setSelected(null);
    setQuery("");
    onChange("", "");
  };

  // If parent clears the value externally
  useEffect(() => {
    if (!value) setSelected(null);
  }, [value]);

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected chip */}
      {selected ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-white p-3 dark:border-brand-800 dark:bg-gray-800">
          {selected.imageUrl ? (
            <img src={selected.imageUrl} alt={selected.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg dark:bg-gray-700">🛍️</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-800 dark:text-white">{selected.name}</p>
            <p className="text-xs text-gray-400">ID: {selected.id} · {selected.categoryName}</p>
          </div>
          <button type="button" onClick={clear} className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
          </button>
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => query.trim() && setOpen(true)}
            placeholder="Tìm theo tên hoặc SKU sản phẩm..."
            className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
              error
                ? "border-red-400 focus:ring-red-500/10"
                : "border-blue-200 focus:border-blue-400 focus:ring-blue-500/10 dark:border-gray-600"
            }`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {loading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            )}
          </span>

          {/* Dropdown */}
          {open && results.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {results.map(p => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={() => pick(p)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="h-9 w-9 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">🛍️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-800 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400">ID: {p.id} · {p.categoryName} · {p.sku}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {open && !loading && query.trim() && results.length === 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              Không tìm thấy sản phẩm nào.
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─── Voucher search sub-component ─── */
function VoucherSearch({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (code: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VoucherAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<VoucherAdmin | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback((kw: string) => {
    if (!kw.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    AdminVoucherService.get({ page: 1, pageSize: 8, voucherCode: kw })
      .then(res => {
        setResults(res?.items ?? []);
        setOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const handleInput = (kw: string) => {
    setQuery(kw);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(kw), 350);
  };

  const pick = (v: VoucherAdmin) => {
    setSelected(v);
    setQuery("");
    setOpen(false);
    onChange(v.voucherCode);
  };

  const clear = () => {
    setSelected(null);
    setQuery("");
    onChange("");
  };

  useEffect(() => {
    if (!value) setSelected(null);
  }, [value]);

  const discountLabel = (v: VoucherAdmin) =>
    v.discountType === "Percentage"
      ? `-${v.discountValue}%`
      : `-${v.discountValue.toLocaleString("vi-VN")}₫`;

  return (
    <div ref={containerRef} className="space-y-2">
      {selected ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-white p-3 dark:border-brand-800 dark:bg-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-xl dark:bg-yellow-900/20">🎟️</div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">{selected.voucherCode}</p>
            <p className="text-xs text-gray-400">{selected.voucherTypeName} · {discountLabel(selected)}</p>
          </div>
          <button type="button" onClick={clear} className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onFocus={() => query.trim() && setOpen(true)}
            placeholder="Tìm theo mã voucher (VD: SALE50)..."
            className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
              error
                ? "border-red-400 focus:ring-red-500/10"
                : "border-blue-200 focus:border-blue-400 focus:ring-blue-500/10 dark:border-gray-600"
            }`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {loading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            )}
          </span>

          {open && results.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {results.map(v => (
                <li key={v.voucherId}>
                  <button
                    type="button"
                    onMouseDown={() => pick(v)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span className="text-xl shrink-0">🎟️</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold text-gray-800 dark:text-white">{v.voucherCode}</p>
                      <p className="text-xs text-gray-400">{v.voucherTypeName} · {discountLabel(v)} · HSD: {new Date(v.endDate).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      v.status === "Active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-700"
                    }`}>{v.status === "Active" ? "Đang dùng" : v.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {open && !loading && query.trim() && results.length === 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              Không tìm thấy voucher nào.
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─── Main ActionPicker ─── */
export default function ActionPicker({
  actionType,
  actionTarget,
  onTypeChange,
  onTargetChange,
  error,
}: ActionPickerProps) {
  const selected = OPTIONS.find(o => o.value === actionType)!;

  return (
    <div className="space-y-3">
      {/* Option cards */}
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onTypeChange(opt.value); onTargetChange(""); }}
            className={`flex items-start gap-2.5 rounded-xl border-2 p-3 text-left transition-all ${
              actionType === opt.value
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
          >
            <span className="mt-0.5 text-xl leading-none">{opt.emoji}</span>
            <div>
              <p className={`text-sm font-medium leading-tight ${
                actionType === opt.value
                  ? "text-brand-700 dark:text-brand-300"
                  : "text-gray-800 dark:text-white"
              }`}>
                {opt.label}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-gray-400">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Contextual section — slides in when an actionable type is selected */}
      {actionType !== "none" && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
          <p className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
            {selected.emoji}{" "}
            {actionType === "product" && "Chọn sản phẩm"}
            {actionType === "voucher" && "Chọn voucher"}
            {actionType === "url" && "Đường dẫn"}
            <span className="ml-1 text-red-400">*</span>
          </p>

          {/* Product inline search */}
          {actionType === "product" && (
            <ProductSearch
              value={actionTarget}
              onChange={(id) => onTargetChange(id)}
              error={error}
            />
          )}

          {/* Voucher inline search */}
          {actionType === "voucher" && (
            <VoucherSearch
              value={actionTarget}
              onChange={onTargetChange}
              error={error}
            />
          )}

          {/* URL plain input */}
          {actionType === "url" && (
            <>
              <input
                type="text"
                value={actionTarget}
                onChange={e => onTargetChange(e.target.value)}
                placeholder="/promotions/summer-2026"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  error
                    ? "border-red-400 focus:ring-red-500/10"
                    : "border-blue-200 focus:border-blue-400 focus:ring-blue-500/10 dark:border-gray-600"
                }`}
              />
              <p className="mt-1.5 text-xs text-blue-500 dark:text-blue-400">
                💡 Dùng đường dẫn bắt đầu bằng / (ví dụ: /products hoặc /vouchers).
              </p>
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </>
          )}

          {/* Live preview chip (for url only — product/voucher show their own chip) */}
          {actionType === "url" && actionTarget.trim() && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-500">
              <span className="text-gray-400">Khi bấm vào →</span>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                Mở trang {actionTarget.trim()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* "No action" note */}
      {actionType === "none" && (
        <p className="text-xs text-gray-400">
          🔕 Thông báo sẽ chỉ hiển thị — không mở trang nào khi người dùng bấm vào.
        </p>
      )}
    </div>
  );
}
