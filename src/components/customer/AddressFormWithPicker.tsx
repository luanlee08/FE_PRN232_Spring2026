'use client';

import { useState, useEffect } from 'react';
import { LocationService, Province, District, Ward } from '@/services/location.service';

export interface AddressSelection {
    addressLine: string;
    city: string;
    district: string;
    ward: string;
    // GHN IDs for shipping fee calculation
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
}

interface AddressFormWithPickerProps {
    value: AddressSelection;
    onChange: (value: AddressSelection) => void;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

/**
 * AddressFormWithPicker - Reusable address picker component
 * 
 * Features:
 * - Cascading Province → District → Ward dropdowns using GHN master data (via backend)
 * - Stores GHN IDs (provinceId, districtId, wardCode) for accurate shipping fee calculation
 * - Auto-clear dependent dropdowns when parent changes
 * - Validation support with required prop
 * 
 * Usage:
 * ```tsx
 * const [address, setAddress] = useState<AddressSelection>({
 *   addressLine: '',
 *   city: '',
 *   district: '',
 *   ward: ''
 * });
 * 
 * <AddressFormWithPicker 
 *   value={address} 
 *   onChange={setAddress} 
 *   required 
 * />
 * ```
 */
export function AddressFormWithPicker({ 
    value, 
    onChange, 
    required = false, 
    disabled = false,
    className = ''
}: AddressFormWithPickerProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
    const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

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

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value ? parseInt(e.target.value) : null;
        setSelectedProvinceCode(code);
        setSelectedDistrictCode(null);
        setSelectedWardCode(null);
        setDistricts([]);
        setWards([]);

        const province = provinces.find(p => p.code === code);
        const provinceName = province?.name || '';
        // Start with text name, then silently resolve GHN ID
        const base = { ...value, city: provinceName, district: '', ward: '', provinceId: undefined, districtId: undefined, wardCode: undefined };
        onChange(base);
        if (province) {
            LocationService.resolveGHNProvince(provinceName).then(ghn => {
                if (ghn) onChange({ ...base, provinceId: ghn.provinceId });
            });
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value ? parseInt(e.target.value) : null;
        setSelectedDistrictCode(code);
        setSelectedWardCode(null);
        setWards([]);

        const district = districts.find(d => d.code === code);
        const districtName = district?.name || '';
        const base = { ...value, district: districtName, ward: '', districtId: undefined, wardCode: undefined };
        onChange(base);
        if (district && value.provinceId) {
            LocationService.resolveGHNDistrict(value.provinceId, districtName).then(ghn => {
                if (ghn) onChange({ ...base, districtId: ghn.districtId });
            });
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value ? parseInt(e.target.value) : null;
        setSelectedWardCode(e.target.value || null);
        const ward = wards.find(w => w.code === code);
        const wardName = ward?.name || '';
        const base = { ...value, ward: wardName, wardCode: undefined };
        onChange(base);
        if (ward && value.districtId) {
            LocationService.resolveGHNWard(value.districtId, wardName).then(ghn => {
                if (ghn) onChange({ ...base, wardCode: ghn.wardCode });
            });
        }
    };

    const handleAddressLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...value,
            addressLine: e.target.value
        });
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                    Địa chỉ chi tiết {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type="text"
                    value={value.addressLine}
                    onChange={handleAddressLineChange}
                    placeholder="Số nhà, tên đường..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required={required}
                    disabled={disabled}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[#222] mb-2">
                    Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={selectedProvinceCode || ''}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required={required}
                    disabled={disabled}
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
                    Quận/Huyện {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={selectedDistrictCode || ''}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceCode || disabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required={required}
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
                    Phường/Xã {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={selectedWardCode || ''}
                    onChange={handleWardChange}
                    disabled={!selectedDistrictCode || disabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required={required}
                >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                            {ward.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
