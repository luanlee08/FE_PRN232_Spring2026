import { MaterialAdmin } 
  from "@/services/admin_services/admin.material.service";

interface Props {
  data: MaterialAdmin[];
  loading: boolean;
  onEdit?: (item: MaterialAdmin) => void;
}

export default function MaterialTable({
  data,
  loading,
  onEdit,
}: Props) {

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-400">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">

        <thead className="bg-gray-50">
          <tr className="text-left text-gray-500">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Tên</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.materialId}
              className="border-t hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                {item.materialId}
              </td>

              <td className="px-4 py-3 font-medium">
                {item.materialName}
              </td>

              <td className="px-4 py-3">
                {item.isDeleted ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    Không hoạt động
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                    Hoạt động
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit?.(item)}
                  className="rounded-lg p-2 text-indigo-500 hover:bg-indigo-50"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}