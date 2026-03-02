"use client";

import { useEffect, useState } from "react";
import ReviewBlogTable from "./ReviewBlogTable";
import { reviewBlogService, ReviewBlogAdmin } from "@/services/admin_services/admin.blogReview.service";

export default function ReviewBlogManagementUI() {
  const [data, setData] = useState<ReviewBlogAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reviewBlogService.getAll(page, pageSize);
      setData(res?.data?.items ?? []);
      setTotal(res?.data?.totalCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleToggleBlock = async (item: ReviewBlogAdmin) => {
    await reviewBlogService.block(
      item.reviewBlogId,
      !item.isBlocked
    );
    fetchData();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Quản lý Review Blog
        </h1>
        <p className="text-sm text-gray-500">
          Kiểm duyệt và chặn review vi phạm
        </p>
      </div>

      <ReviewBlogTable
        data={data}
        loading={loading}
        onToggleBlock={handleToggleBlock}
      />

      {/* PAGINATION */}
      <div className="mt-6 flex justify-between text-sm text-gray-500">
        <span>
          Trang {page} · Tổng {total} review
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            ←
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}