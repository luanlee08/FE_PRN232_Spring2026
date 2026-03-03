/**
 * Shared variable-chip UX for notification / campaign / template forms.
 * Lets non-dev admins insert {{key}} tokens by clicking a chip,
 * instead of typing the raw syntax.
 */

export const VARIABLES: { key: string; label: string; hint: string }[] = [
  { key: "name",        label: "Tên khách hàng", hint: "Nguyễn Văn A" },
  { key: "amount",      label: "Số tiền",        hint: "100.000₫" },
  { key: "code",        label: "Mã khuyến mãi",  hint: "SALE50" },
  { key: "discount",    label: "% giảm giá",     hint: "30%" },
  { key: "productName", label: "Tên sản phẩm",   hint: "Áo thun basic" },
  { key: "expiryDate",  label: "Ngày hết hạn",   hint: "31/03/2026" },
  { key: "date",        label: "Ngày",           hint: "03/03/2026" },
];

// ── TemplatePreview ────────────────────────────────────────────────────────
/** Renders a template string — {{key}} tokens become coloured badges. */
export function TemplatePreview({ text }: { text: string }) {
  const parts = text.split(/({{[^}]+}})/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          const key = part.slice(2, -2);
          const v = VARIABLES.find(v => v.key === key);
          return (
            <span
              key={i}
              title={`Ví dụ: ${v?.hint ?? key}`}
              className="mx-0.5 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-600"
            >
              {v?.label ?? key}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── VariableChips ──────────────────────────────────────────────────────────
interface VariableChipsProps {
  /** Which field is currently focused — shown in the helper text */
  focusedField: "title" | "message";
  /** Called with the {{key}} token to insert */
  onInsert: (key: string) => void;
}

/**
 * Dashed box with one chip per variable.
 * Clicking a chip calls `onInsert(key)` so the parent can splice the token
 * at the current cursor position.
 */
export function VariableChips({ focusedField, onInsert }: VariableChipsProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
      <p className="mb-2 text-xs text-gray-400">
        Chèn thông tin tự động vào&nbsp;
        <span className="font-semibold text-brand-500">
          {focusedField === "title" ? "Tiêu đề" : "Nội dung"}
        </span>
        &nbsp;— bấm để chèn vào vị trí con trỏ:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {VARIABLES.map(v => (
          <button
            key={v.key}
            type="button"
            title={`Ví dụ: ${v.hint}`}
            onClick={() => onInsert(v.key)}
            className="flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 active:scale-95 transition-transform"
          >
            + {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
