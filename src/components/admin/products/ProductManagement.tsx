"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";

import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import { Modal } from "../ui/modal";

import {
  AdminProductService,
  ProductAdmin,
} from "../../../../services/admin_services/admin.product.service";
import { ProductFormData } from "@/types/products";
import { mapAdminToFormData } from "@/utils/product.mapper";
export default function ProductManagementUI() {
  const [products, setProducts] = useState<ProductAdmin[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductFormData | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await AdminProductService.getAll({
        page,
        pageSize,
        keyword: keyword || undefined,
      });

      setProducts(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, keyword]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      {/* HEADER */}
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500">
            Quản lý danh sách sản phẩm
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => {
                setPage(1);
                setKeyword(e.target.value);
              }}
              placeholder="Tìm theo tên / SKU"
              className="h-10 w-64 rounded-lg border pl-9 pr-4 text-sm"
            />
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-white"
          >
            <Plus size={16} />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="py-10 text-center text-gray-400">
          Đang tải dữ liệu...
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={(product) => {
            setSelectedProduct(mapAdminToFormData(product)); // ✅ ProductFormData
            setOpenModal(true);
          }}
        />

      )}

      {/* PAGINATION */}
      <div className="mt-6 flex justify-between text-sm">
        <div className="text-gray-500">
          Trang {page} / {totalPages} · Tổng {totalItems} sản
          phẩm
        </div>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded border px-3 py-1"
          >
            ←
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded border px-3 py-1"
          >
            →
          </button>
        </div>
      </div>

      <Modal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedProduct(null);
        }}
        className="max-w-[820px] rounded-xl bg-white"
      >
        <ProductForm
          submitText={selectedProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
          product={selectedProduct}
          onSuccess={() => {
            setOpenModal(false);
            setSelectedProduct(null);
            loadProducts();
          }}
        />
      </Modal>

    </div>
  );
}
