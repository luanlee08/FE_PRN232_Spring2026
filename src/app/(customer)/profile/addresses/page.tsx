"use client";

import { Footer } from "@/components/customer/footer";
import { MapPin, Plus, Edit, Trash2, CheckCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { CustomerAddressService } from "@/services/customer_services/customer.address.service";
import { AddressResponse, AddressRequest, AddressUpdateRequest } from "@/types/address";
import { LocationService, Province, District, Ward } from "@/services/location.service";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<AddressRequest>({
    recipientName: "",
    phoneNumber: "",
    addressLine: "",
    district: "",
    ward: "",
    city: "",
    isDefault: false,
  });

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập để quản lý địa chỉ");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await CustomerAddressService.getAll();
      if (res.status === 200 && res.data) {
        setAddresses(res.data);
      }
    } catch {
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchAddresses]);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      const data = await LocationService.getProvinces();
      setProvinces(data);
    };
    loadProvinces();
  }, []);

  // Load districts when province selected
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedProvinceCode) {
        const data = await LocationService.getDistricts(selectedProvinceCode);
        setDistricts(data);
      } else {
        setDistricts([]);
        setWards([]);
      }
    };
    loadDistricts();
  }, [selectedProvinceCode]);

  // Load wards when district selected
  useEffect(() => {
    const loadWards = async () => {
      if (selectedDistrictCode) {
        const data = await LocationService.getWards(selectedDistrictCode);
        setWards(data);
      } else {
        setWards([]);
      }
    };
    loadWards();
  }, [selectedDistrictCode]);

  // Modal handlers
  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      recipientName: "",
      phoneNumber: "",
      addressLine: "",
      district: "",
      ward: "",
      city: "",
      isDefault: addresses.length === 0, // First address is default
    });
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
    setDistricts([]);
    setWards([]);
    setShowModal(true);
  };

  const openEditModal = async (address: AddressResponse) => {
    setEditingAddress(address);
    setFormData({
      recipientName: address.recipientName || "",
      phoneNumber: address.phoneNumber || "",
      addressLine: address.addressLine,
      district: address.district || "",
      ward: address.ward || "",
      city: address.city,
      provinceId: address.provinceId,
      districtId: address.districtId,
      wardCode: address.wardCode,
      isDefault: address.isDefault,
    });

    // Populate dropdowns by matching text names (provinces.open-api.vn codes)
    if (address.city) {
      const matchedProvince = provinces.find(
        (p) => p.name === address.city || p.full_name === address.city,
      );
      if (matchedProvince) {
        setSelectedProvinceCode(matchedProvince.code);
        const districtList = await LocationService.getDistricts(matchedProvince.code);
        setDistricts(districtList);

        if (address.district) {
          const matchedDistrict = districtList.find(
            (d) => d.name === address.district || d.full_name === address.district,
          );
          if (matchedDistrict) {
            setSelectedDistrictCode(matchedDistrict.code);
            const wardList = await LocationService.getWards(matchedDistrict.code);
            setWards(wardList);

            if (address.ward) {
              const matchedWard = wardList.find(
                (w) => w.name === address.ward || w.full_name === address.ward,
              );
              if (matchedWard) setSelectedWardCode(String(matchedWard.code));
            }
          }
        }
      } else {
        setSelectedProvinceCode(null);
        setSelectedDistrictCode(null);
        setSelectedWardCode(null);
        setDistricts([]);
        setWards([]);
      }
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData({
      recipientName: "",
      phoneNumber: "",
      addressLine: "",
      district: "",
      ward: "",
      city: "",
      isDefault: false,
    });
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
    setDistricts([]);
    setWards([]);
  };

  // Handlers for location selects
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    setSelectedProvinceCode(code || null);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
    setDistricts([]);
    setWards([]);

    const province = provinces.find((p) => p.code === code);
    if (province) {
      const provinceName = province.name;
      setFormData((prev) => ({
        ...prev,
        city: provinceName,
        provinceId: undefined,
        district: "",
        districtId: undefined,
        ward: "",
        wardCode: undefined,
      }));
      // Silently resolve GHN Province ID from backend cache
      LocationService.resolveGHNProvince(provinceName).then((ghn) => {
        if (ghn) setFormData((prev) => ({ ...prev, provinceId: ghn.provinceId }));
      });
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    setSelectedDistrictCode(code || null);
    setSelectedWardCode(null);
    setWards([]);

    const district = districts.find((d) => d.code === code);
    if (district) {
      const districtName = district.name;
      setFormData((prev) => ({
        ...prev,
        district: districtName,
        districtId: undefined,
        ward: "",
        wardCode: undefined,
      }));
      // Silently resolve GHN District ID from backend cache
      setFormData((prev) => {
        if (prev.provinceId) {
          LocationService.resolveGHNDistrict(prev.provinceId, districtName).then((ghn) => {
            if (ghn) setFormData((p) => ({ ...p, districtId: ghn.districtId }));
          });
        }
        return prev;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        district: "",
        districtId: undefined,
        ward: "",
        wardCode: undefined,
      }));
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    const ward = wards.find((w) => w.code === code);
    if (ward) {
      const wardName = ward.name;
      setSelectedWardCode(String(code));
      setFormData((prev) => ({ ...prev, ward: wardName, wardCode: undefined }));
      // Silently resolve GHN Ward Code from backend cache
      setFormData((prev) => {
        if (prev.districtId) {
          LocationService.resolveGHNWard(prev.districtId, wardName).then((ghn) => {
            if (ghn) setFormData((p) => ({ ...p, wardCode: ghn.wardCode }));
          });
        }
        return prev;
      });
    }
  };

  // CRUD operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.recipientName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.addressLine.trim() ||
      !formData.city.trim() ||
      !formData.district?.trim() ||
      !formData.ward?.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    // Validate phone number - must start with 0 or +84
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      toast.error("Số điện thoại không hợp lệ (bắt đầu bằng 0 hoặc +84, 10-11 số)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAddress) {
        // Update — include addressId in body to match backend ID consistency check
        const updateData: AddressUpdateRequest = {
          ...formData,
          addressId: editingAddress.addressId,
        };
        const res = await CustomerAddressService.update(editingAddress.addressId, updateData);
        if (res.status === 200) {
          toast.success("Cập nhật địa chỉ thành công");
          fetchAddresses();
          closeModal();
        }
      } else {
        // Create
        const res = await CustomerAddressService.create(formData);
        if (res.status === 201 || res.status === 200) {
          toast.success("Thêm địa chỉ thành công");
          fetchAddresses();
          closeModal();
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      const res = await CustomerAddressService.delete(addressId);
      if (res.status === 200) {
        toast.success("Đã xóa địa chỉ");
        fetchAddresses();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      const res = await CustomerAddressService.setDefault(addressId);
      if (res.status === 200) {
        toast.success("Đã đặt làm địa chỉ mặc định");
        fetchAddresses();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể đặt làm mặc định");
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-[#222] hover:text-[#FF6B35] transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-[#222]">Địa chỉ giao hàng</h1>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E55A24] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Thêm địa chỉ mới
          </button>
        </div>

        {/* Empty state */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-[#222] mb-2">Chưa có địa chỉ giao hàng</h3>
            <p className="text-gray-600 mb-6">Thêm địa chỉ để tiện thanh toán nhanh hơn</p>
            <button
              onClick={openAddModal}
              className="bg-[#FF6B35] hover:bg-[#E55A24] text-white px-6 py-3 rounded-lg transition-colors"
            >
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.addressId}
                className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-[#FF6B35] transition-colors relative"
              >
                {/* Default badge */}
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 bg-[#FF6B35] text-white text-xs px-3 py-1 rounded-full">
                      <CheckCircle size={14} />
                      Mặc định
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[#222]">
                        {address.recipientName || "Không có tên"}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {address.phoneNumber || "Không có SĐT"}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{address.addressLine}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {address.ward && `${address.ward}, `}
                    {address.district && `${address.district}, `}
                    {address.city}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(address)}
                    className="flex items-center gap-1 text-[#FF6B35] hover:bg-[#FFF5F2] px-3 py-2 rounded transition-colors text-sm"
                  >
                    <Edit size={16} />
                    Sửa
                  </button>

                  {!address.isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(address.addressId)}
                        className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded transition-colors text-sm"
                      >
                        <CheckCircle size={16} />
                        Đặt mặc định
                      </button>
                      <button
                        onClick={() => handleDelete(address.addressId)}
                        className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded transition-colors text-sm ml-auto"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#222] mb-4">
              {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                  Tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="Nhập tên người nhận"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProvinceCode || ""}
                  onChange={handleProvinceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                  required
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDistrictCode || ""}
                  onChange={handleDistrictChange}
                  disabled={!selectedProvinceCode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedWardCode || ""}
                  onChange={handleWardChange}
                  disabled={!selectedDistrictCode}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                  disabled={addresses.length === 0}
                />
                <label htmlFor="isDefault" className="text-sm text-[#222]">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[#222] hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FF6B35] hover:bg-[#E55A24] text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang lưu..." : editingAddress ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
