"use client";

import { Footer } from "@/components/customer/footer";
import { MapPin, Plus, Edit2, Trash2, Check, ArrowLeft, X, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { CustomerAddressService } from "@/services/customer_services/customer.address.service";
import { AddressResponse, AddressRequest, AddressUpdateRequest } from "@/types/address";
import { LocationService, Province, District, Ward } from "@/services/location.service";
import toast from "react-hot-toast";
import Link from "next/link";

/* ─── shared input style ─── */
const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition bg-white disabled:bg-gray-50 disabled:cursor-not-allowed";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  /* location */
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

  /* form */
  const emptyForm = (): AddressRequest => ({
    recipientName: "", phoneNumber: "", addressLine: "",
    district: "", ward: "", city: "", isDefault: false,
  });
  const [formData, setFormData] = useState<AddressRequest>(emptyForm());

  /* auth guard */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập để quản lý địa chỉ");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  /* fetch */
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await CustomerAddressService.getAll();
      if (res.status === 200 && res.data) setAddresses(res.data);
    } catch {
      toast.error("Không thể tải danh sách địa chỉ");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) fetchAddresses(); }, [isAuthenticated, fetchAddresses]);

  /* provinces */
  useEffect(() => { LocationService.getProvinces().then(setProvinces); }, []);

  useEffect(() => {
    if (selectedProvinceCode) LocationService.getDistricts(selectedProvinceCode).then(setDistricts);
    else { setDistricts([]); setWards([]); }
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (selectedDistrictCode) LocationService.getWards(selectedDistrictCode).then(setWards);
    else setWards([]);
  }, [selectedDistrictCode]);

  /* modal */
  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({ ...emptyForm(), isDefault: addresses.length === 0 });
    setSelectedProvinceCode(null); setSelectedDistrictCode(null); setSelectedWardCode(null);
    setDistricts([]); setWards([]);
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
    if (address.city) {
      const matched = provinces.find(p => p.name === address.city || p.full_name === address.city);
      if (matched) {
        setSelectedProvinceCode(matched.code);
        const dl = await LocationService.getDistricts(matched.code);
        setDistricts(dl);
        if (address.district) {
          const md = dl.find(d => d.name === address.district || d.full_name === address.district);
          if (md) {
            setSelectedDistrictCode(md.code);
            const wl = await LocationService.getWards(md.code);
            setWards(wl);
            if (address.ward) {
              const mw = wl.find(w => w.name === address.ward || w.full_name === address.ward);
              if (mw) setSelectedWardCode(String(mw.code));
            }
          }
        }
      } else { setSelectedProvinceCode(null); setSelectedDistrictCode(null); setSelectedWardCode(null); setDistricts([]); setWards([]); }
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false); setEditingAddress(null); setFormData(emptyForm());
    setSelectedProvinceCode(null); setSelectedDistrictCode(null); setSelectedWardCode(null);
    setDistricts([]); setWards([]);
  };

  /* location handlers */
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    setSelectedProvinceCode(code || null);
    setSelectedDistrictCode(null); setSelectedWardCode(null);
    setDistricts([]); setWards([]);
    const province = provinces.find(p => p.code === code);
    if (province) {
      const name = province.name;
      setFormData(prev => ({ ...prev, city: name, provinceId: undefined, district: "", districtId: undefined, ward: "", wardCode: undefined }));
      LocationService.resolveGHNProvince(name).then(ghn => { if (ghn) setFormData(prev => ({ ...prev, provinceId: ghn.provinceId })); });
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    setSelectedDistrictCode(code || null); setSelectedWardCode(null); setWards([]);
    const district = districts.find(d => d.code === code);
    if (district) {
      const name = district.name;
      setFormData(prev => ({ ...prev, district: name, districtId: undefined, ward: "", wardCode: undefined }));
      setFormData(prev => {
        if (prev.provinceId) LocationService.resolveGHNDistrict(prev.provinceId, name).then(ghn => { if (ghn) setFormData(p => ({ ...p, districtId: ghn.districtId })); });
        return prev;
      });
    } else { setFormData(prev => ({ ...prev, district: "", districtId: undefined, ward: "", wardCode: undefined })); }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    const ward = wards.find(w => w.code === code);
    if (ward) {
      const name = ward.name;
      setSelectedWardCode(String(code));
      setFormData(prev => ({ ...prev, ward: name, wardCode: undefined }));
      setFormData(prev => {
        if (prev.districtId) LocationService.resolveGHNWard(prev.districtId, name).then(ghn => { if (ghn) setFormData(p => ({ ...p, wardCode: ghn.wardCode })); });
        return prev;
      });
    }
  };

  /* CRUD */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName.trim() || !formData.phoneNumber.trim() || !formData.addressLine.trim() || !formData.city.trim() || !formData.district?.trim() || !formData.ward?.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ"); return;
    }
    if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phoneNumber.trim())) {
      toast.error("Số điện thoại không hợp lệ (bắt đầu 0 hoặc +84, 10–11 số)"); return;
    }
    setIsSubmitting(true);
    try {
      if (editingAddress) {
        const res = await CustomerAddressService.update(editingAddress.addressId, { ...formData, addressId: editingAddress.addressId } as AddressUpdateRequest);
        if (res.status === 200) { toast.success("Cập nhật địa chỉ thành công"); fetchAddresses(); closeModal(); }
      } else {
        const res = await CustomerAddressService.create(formData);
        if (res.status === 201 || res.status === 200) { toast.success("Thêm địa chỉ thành công"); fetchAddresses(); closeModal(); }
      }
    } catch (err: any) { toast.error(err?.response?.data?.message || "Có lỗi xảy ra"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      const res = await CustomerAddressService.delete(id);
      if (res.status === 200) { toast.success("Đã xóa địa chỉ"); fetchAddresses(); }
    } catch (err: any) { toast.error(err?.response?.data?.message || "Không thể xóa địa chỉ"); }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await CustomerAddressService.setDefault(id);
      if (res.status === 200) { toast.success("Đã đặt làm địa chỉ mặc định"); fetchAddresses(); }
    } catch (err: any) { toast.error(err?.response?.data?.message || "Không thể đặt làm mặc định"); }
  };

  /* skeleton */
  if (authLoading || isLoading) return (
    <>
      <div className="min-h-screen bg-[#f5f5f5] py-6">
        <div className="max-w-5xl mx-auto px-4 animate-pulse space-y-3">
          <div className="h-10 bg-white rounded-sm w-64" />
          <div className="h-28 bg-white rounded-sm" />
          <div className="h-28 bg-white rounded-sm" />
        </div>
      </div>
      <Footer />
    </>
  );

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f5] py-5 pb-10">
        <div className="max-w-5xl mx-auto px-4">

          {/* ─── page card ─── */}
          <div className="bg-white rounded-sm">

            {/* header row */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Link href="/profile" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <h1 className="text-lg font-medium text-gray-800">Địa Chỉ Của Tôi</h1>
                  <p className="text-xs text-gray-400 mt-0.5">{addresses.length} địa chỉ đã lưu</p>
                </div>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
              >
                <Plus size={15} /> Thêm địa chỉ mới
              </button>
            </div>

            {/* content */}
            <div className="p-6">
              {addresses.length === 0 ? (
                /* empty state */
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={36} className="text-orange-300" />
                  </div>
                  <h3 className="text-base font-medium text-gray-700 mb-1">Chưa có địa chỉ giao hàng</h3>
                  <p className="text-sm text-gray-400 mb-6">Thêm địa chỉ để thanh toán nhanh hơn</p>
                  <button
                    onClick={openAddModal}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
                  >
                    Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                /* address list */
                <div className="divide-y divide-gray-100">
                  {addresses.map(addr => (
                    <div key={addr.addressId} className="py-5 flex items-start gap-4">
                      {/* icon */}
                      <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {addr.isDefault
                          ? <Star size={16} className="text-orange-400 fill-orange-400" />
                          : <MapPin size={16} className="text-gray-400" />
                        }
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <span className="font-semibold text-gray-800">{addr.recipientName || "—"}</span>
                          <span className="text-gray-200">|</span>
                          <span className="text-sm text-gray-500">{addr.phoneNumber || "—"}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 border border-orange-400 text-orange-500 text-[11px] rounded leading-none">
                              Mặc Định
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addr.addressLine}</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {[addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}
                        </p>
                      </div>

                      {/* actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(addr)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 size={13} /> Cập nhật
                          </button>
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleDelete(addr.addressId)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={13} /> Xóa
                            </button>
                          )}
                        </div>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.addressId)}
                            className="flex items-center gap-1 px-3 py-1 border border-gray-200 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 rounded transition-colors"
                          >
                            <Check size={12} /> Thiết lập mặc định
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* ─── MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">

            {/* modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {/* modal body */}
            <form id="address-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* 2-col: name + phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tên người nhận <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Số điện thoại <span className="text-red-400">*</span></label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="0912345678"
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              {/* address line */}
              <div>
                <label className={labelCls}>Địa chỉ chi tiết <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={e => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="Số nhà, tên đường, toà nhà..."
                  className={inputCls}
                  required
                />
              </div>

              {/* province */}
              <div>
                <label className={labelCls}>Tỉnh / Thành phố <span className="text-red-400">*</span></label>
                <select value={selectedProvinceCode || ""} onChange={handleProvinceChange} className={inputCls} required>
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>

              {/* 2-col: district + ward */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Quận / Huyện <span className="text-red-400">*</span></label>
                  <select
                    value={selectedDistrictCode || ""}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceCode}
                    className={inputCls}
                    required
                  >
                    <option value="">-- Chọn Quận / Huyện --</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Phường / Xã <span className="text-red-400">*</span></label>
                  <select
                    value={selectedWardCode || ""}
                    onChange={handleWardChange}
                    disabled={!selectedDistrictCode}
                    className={inputCls}
                    required
                  >
                    <option value="">-- Chọn Phường / Xã --</option>
                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              {/* default checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                  disabled={addresses.length === 0 || (editingAddress?.isDefault === true)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  Đặt làm địa chỉ mặc định
                </span>
              </label>

            </form>

            {/* modal footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                form="address-form"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                {isSubmitting ? "Đang lưu..." : editingAddress ? "Lưu cập nhật" : "Thêm địa chỉ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
