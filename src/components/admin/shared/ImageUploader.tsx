"use client";

import { useRef, useState } from "react";
import { ImageIcon, Link2, Loader2, X } from "lucide-react";
import { uploadImage } from "@/services/admin_services/admin.media.service";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  /** Cloudinary folder — defaults to "campaigns" */
  folder?: string;
  /** Label shown above the uploader */
  label?: string;
}

/**
 * Dual-mode image picker:
 * - Upload from device (drag-drop or click) → uploads to Cloudinary → returns URL
 * - Paste a URL directly (secondary mode)
 */
export default function ImageUploader({
  value,
  onChange,
  folder = "campaigns",
  label = "Hình ảnh",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlMode, setUrlMode] = useState(false);   // toggle to paste-URL mode
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      setUrlMode(false);
    } catch {
      setError("Upload thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}{" "}
          <span className="font-normal text-gray-400">(tuỳ chọn)</span>
        </label>
        <button
          type="button"
          onClick={() => setUrlMode(v => !v)}
          className="flex items-center gap-1 text-xs text-brand-500 hover:underline"
        >
          <Link2 size={12} />
          {urlMode ? "Tải từ máy" : "Dán URL"}
        </button>
      </div>

      {/* URL-paste mode */}
      {urlMode ? (
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      ) : (
        /* Upload zone */
        <>
          {value ? (
            /* Preview with remove */
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="preview"
                className="h-36 w-full rounded-xl object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-red-50"
                title="Xoá ảnh"
              >
                <X size={14} className="text-red-500" />
              </button>
              {/* Replace button */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow hover:bg-gray-100"
              >
                Đổi ảnh
              </button>
            </div>
          ) : (
            /* Drop zone */
            <div
              onDragEnter={e => { e.preventDefault(); setDragging(true); }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
                dragging
                  ? "border-brand-400 bg-brand-50"
                  : "border-gray-200 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 size={22} className="animate-spin text-brand-500" />
                  <p className="text-xs text-gray-500">Đang tải lên...</p>
                </>
              ) : (
                <>
                  <ImageIcon size={22} className="text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Kéo thả ảnh vào đây hoặc{" "}
                    <span className="font-medium text-brand-500">chọn từ máy</span>
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG, WEBP, GIF · Tối đa 10 MB</p>
                </>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onInputChange}
            className="hidden"
          />
        </>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Tiny URL display when uploaded */}
      {!urlMode && value && (
        <p className="truncate text-xs text-gray-400" title={value}>{value}</p>
      )}
    </div>
  );
}
