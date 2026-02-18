"use client";


import { Pencil } from "lucide-react";
import { ProductAdmin } from "@/services/admin_services/admin.product.service";


interface Props {
  products: ProductAdmin[];
  onEdit?: (product: ProductAdmin) => void;
}


export default function ProductTable({ products, onEdit }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1400px] text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th>STT</th>
            <th>SKU</th>
            <th>Tên sản phẩm</th>
            <th>Ảnh</th>
            <th>Danh mục</th>
            <th>Thương hiệu</th>
            <th>Giá</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th className="text-right pr-4">Hành động</th>
          </tr>
        </thead>


        <tbody>
          {products.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="py-10 text-center text-gray-400"
              >
                Không có sản phẩm
              </td>
            </tr>
          )}


          {products.map((p, index) => (
            <tr
              key={p.id}
              className="border-b hover:bg-gray-50"
            >
              <td>{index + 1}</td>
              <td className="font-mono text-xs">{p.sku}</td>
              <td className="font-medium">{p.name}</td>


              <td>
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-10 w-10 rounded object-cover border"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-gray-400">
                    📦
                  </div>
                )}
              </td>


              <td>{p.categoryName}</td>
              <td>{p.brandName}</td>


              <td className="font-medium text-emerald-600">
                {p.price.toLocaleString()}₫
              </td>


              <td>
                {p.status === "Available" && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                    Đang bán
                  </span>
                )}


                {p.status === "OutOfStock" && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                    Hết hàng
                  </span>
                )}


                {p.status === "Discontinued" && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    Ngừng kinh doanh
                  </span>
                )}
              </td>


              <td>{p.createdAt}</td>
              <td>{p.updatedAt ?? "-"}</td>


              <td className="text-right pr-4">
                <button
                  onClick={() => onEdit?.(p)}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  <Pencil size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}





