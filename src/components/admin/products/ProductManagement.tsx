"use client";


import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";


import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import { Modal } from "../ui/modal";
import { LookupItem } from "../../../../services/admin_services/admin.lookup.service";


import {
  AdminProductService,
  ProductAdmin,
} from "../../../../services/admin_services/admin.product.service";
import {
  AdminLookupService
} from "../../../../services/admin_services/admin.lookup.service";
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
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [brands, setBrands] = useState<LookupItem[]>([]);
  const [materials, setMaterials] = useState<LookupItem[]>([]);
  const [origins, setOrigins] = useState<LookupItem[]>([]);
  const [ages, setAges] = useState<LookupItem[]>([]);
  const [sexes, setSexes] = useState<LookupItem[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);


  const loadLookups = async () => {
    const [
      categories,
      brands,
      materials,
      origins,
      ages,
      sexes,
    ] = await Promise.all([
      AdminLookupService.getCategories(),
      AdminLookupService.getBrands(),
      AdminLookupService.getMaterials(),
      AdminLookupService.getOrigins(),
      AdminLookupService.getAges(),
      AdminLookupService.getSexes(),
    ]);


    setCategories(categories);
    setBrands(brands);
    setMaterials(materials);
    setOrigins(origins);
    setAges(ages);
    setSexes(sexes);
  };


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


  useEffect(() => {
    loadLookups();
  }, []);


  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
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
            className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            <Plus size={14} />
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
        className="max-w-[700px] w-full rounded-xl bg-white p-6"
      >
        <ProductForm
          submitText={selectedProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
          product={selectedProduct}
          categories={categories}
          brands={brands}
          materials={materials}
          origins={origins}
          ages={ages}
          sexes={sexes}
          onSuccess={() => {
            setOpenModal(false);
            setSelectedProduct(null);
            loadProducts();
          }}
          onCancel={() => {
            setOpenModal(false);
            setSelectedProduct(null);
          }}
        />


      </Modal>


    </div>
  );
}





