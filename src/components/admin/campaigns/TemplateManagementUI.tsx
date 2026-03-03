"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Power, Search } from "lucide-react";
import { Modal } from "@/components/admin/ui/modal";
import type { CreateTemplateRequest, TemplateDto, UpdateTemplateRequest } from "@/types/campaign";
import {
  createTemplate,
  getTemplates,
  toggleTemplateStatus,
  updateTemplate,
} from "@/services/admin_services/admin.template.service";

import { TemplatePreview, VariableChips } from "@/components/admin/shared/VariableChips";

export default function TemplateManagementUI() {
  const [items, setItems]       = useState<TemplateDto[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [keyword, setKeyword]   = useState("");
  const [page, setPage]         = useState(1);
  const pageSize = 15;

  // Modal
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<TemplateDto | null>(null);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState("");

  // Form state
  const [tCode, setTCode]       = useState("");
  const [tTitle, setTTitle]     = useState("");
  const [tMsg, setTMsg]         = useState("");
  const [tActive, setTActive]   = useState(true);

  // Variable insertion
  const titleRef = useRef<HTMLInputElement>(null);
  const msgRef   = useRef<HTMLTextAreaElement>(null);
  const [focusedField, setFocusedField] = useState<"title" | "message">("title");

  const insertVar = (key: string) => {
    const token = `{{${key}}}`;
    if (focusedField === "title" && titleRef.current) {
      const el = titleRef.current;
      const start = el.selectionStart ?? tTitle.length;
      const end   = el.selectionEnd   ?? tTitle.length;
      setTTitle(tTitle.slice(0, start) + token + tTitle.slice(end));
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length); });
    } else if (msgRef.current) {
      const el = msgRef.current;
      const start = el.selectionStart ?? tMsg.length;
      const end   = el.selectionEnd   ?? tMsg.length;
      setTMsg(tMsg.slice(0, start) + token + tMsg.slice(end));
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length); });
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getTemplates({ keyword: keyword || undefined, page, pageSize });
      setItems(r.data?.items ?? []);
      setTotal(r.data?.totalCount ?? 0);
    } catch (e) {
      console.error("Templates error:", e);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setTCode(""); setTTitle(""); setTMsg(""); setTActive(true);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (t: TemplateDto) => {
    setEditing(t);
    setTCode(t.templateCode); setTTitle(t.titleTemplate);
    setTMsg(t.messageTemplate); setTActive(t.isActive);
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!tTitle.trim() || !tMsg.trim()) { setFormError("Tiêu đề và nội dung là bắt buộc"); return; }
    setSaving(true);
    try {
      if (editing) {
        const payload: UpdateTemplateRequest = {
          templateCode: editing.templateCode,
          titleTemplate: tTitle.trim(),
          messageTemplate: tMsg.trim(),
          isActive: tActive,
        };
        await updateTemplate(editing.templateId, payload);
      } else {
        if (!tCode.trim()) { setFormError("Template Code là bắt buộc"); setSaving(false); return; }
        const payload: CreateTemplateRequest = {
          templateCode: tCode.trim().toUpperCase(),
          titleTemplate: tTitle.trim(),
          messageTemplate: tMsg.trim(),
          isActive: tActive,
        };
        await createTemplate(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setFormError("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (t: TemplateDto) => {
    try {
      await toggleTemplateStatus(t.templateId);
      fetchData();
    } catch { alert("Thay đổi trạng thái thất bại"); }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.03]">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm template..."
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(1); }}
              className="h-10 rounded-lg border border-gray-200 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <span className="text-sm text-gray-400">Tổng: {total}</span>
        </div>
        <button
          onClick={openCreate}
          className="flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus size={16} /> Thêm template
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-3 font-medium">Template Code</th>
              <th className="pb-3 font-medium">Tiêu đề</th>
              <th className="pb-3 font-medium">Nội dung</th>
              <th className="pb-3 font-medium">Trạng thái</th>
              <th className="pb-3 font-medium">Ngày tạo</th>
              <th className="pb-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">Đang tải...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">Chưa có template</td></tr>
            ) : items.map(t => (
              <tr key={t.templateId} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 pr-4 font-mono text-xs font-medium text-blue-600">
                  {t.templateCode}
                </td>
                <td className="py-3 pr-4 font-medium text-gray-800 dark:text-white max-w-[200px] truncate">
                  <TemplatePreview text={t.titleTemplate} />
                </td>
                <td className="py-3 pr-4 max-w-[280px] truncate text-gray-600 text-xs">
                  <TemplatePreview text={t.messageTemplate} />
                </td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {t.isActive ? "Kích hoạt" : "Tắt"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Chỉnh sửa"
                      onClick={() => openEdit(t)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      title={t.isActive ? "Tắt template" : "Kích hoạt template"}
                      onClick={() => handleToggle(t)}
                      className={`rounded p-1.5 hover:bg-gray-100 ${
                        t.isActive ? "text-green-500 hover:text-red-400" : "text-gray-400 hover:text-green-500"
                      }`}
                    >
                      <Power size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Tổng {total} templates</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-40">
              ‹
            </button>
            <span>Trang {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-40">
              ›
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-lg p-6">
        <h2 className="mb-5 text-base font-semibold text-gray-800 dark:text-white">
          {editing ? "Chỉnh sửa template" : "Tạo template mới"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>
          )}
          {!editing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Template Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tCode}
                onChange={e => setTCode(e.target.value)}
                placeholder="PROMO_FLASH_SALE"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-brand-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">Sẽ tự động chuyển thành UPPERCASE</p>
            </div>
          )}
          {editing && (
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-500">Code: </span>
              <span className="font-mono text-sm font-medium text-blue-600">{editing.templateCode}</span>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={tTitle}
              onChange={e => setTTitle(e.target.value)}
              onFocus={() => setFocusedField("title")}
              placeholder="Ví dụ: Chào mừng bạn đến với LorKingDom!"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* ── Variable chips ─────────────────────────────────────── */}
          <VariableChips focusedField={focusedField} onInsert={insertVar} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={msgRef}
              rows={3}
              value={tMsg}
              onChange={e => setTMsg(e.target.value)}
              onFocus={() => setFocusedField("message")}
              placeholder="Nội dung thông báo..."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Live preview */}
          {(tTitle || tMsg) && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <p className="mb-1.5 text-xs font-medium text-blue-500">Xem trước</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug">
                <TemplatePreview text={tTitle || "…"} />
              </p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                <TemplatePreview text={tMsg || "…"} />
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tActive"
              checked={tActive}
              onChange={e => setTActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-500"
            />
            <label htmlFor="tActive" className="text-sm text-gray-600">Kích hoạt ngay</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo template"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
