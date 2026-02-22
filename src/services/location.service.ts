// services/location.service.ts
// UI dropdowns:      provinces.open-api.vn  (always works, no GHN token needed)
// GHN ID resolution: backend /api/Location  (resolves GHN IDs for shipping fee calc)

import { API_BASE } from '@/configs/api-configs';

// ===== Types for UI dropdowns (provinces.open-api.vn) =====
export interface Province {
    code: number;
    name: string;
    full_name: string;
    districts?: District[];
}

export interface District {
    code: number;
    name: string;
    full_name: string;
    wards?: Ward[];
}

export interface Ward {
    code: number;
    name: string;
    full_name: string;
}

// ===== Types for GHN IDs (from backend /api/Location) =====
export interface GHNProvince {
    provinceId: number;
    provinceName: string;
    code: string;
}

export interface GHNDistrict {
    districtId: number;
    provinceId: number;
    districtName: string;
    code: string;
    type: string;
    supportType: number;
}

export interface GHNWard {
    wardCode: string;
    districtId: number;
    wardName: string;
}

const VN_API = 'https://provinces.open-api.vn/api';

function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, ' ')
        .replace(/^(tinh|thanh pho|quan|huyen|phuong|xa|thi xa|thi tran)\s+/i, '')
        .trim();
}

export const LocationService = {
    // ===== UI DROPDOWN DATA (provinces.open-api.vn, no token dependency) =====

    async getProvinces(): Promise<Province[]> {
        try {
            const res = await fetch(`${VN_API}/p/`);
            return await res.json();
        } catch {
            return [];
        }
    },

    async getDistricts(provinceCode: number): Promise<District[]> {
        try {
            const res = await fetch(`${VN_API}/p/${provinceCode}?depth=2`);
            const data: Province = await res.json();
            return data?.districts ?? [];
        } catch {
            return [];
        }
    },

    async getWards(districtCode: number): Promise<Ward[]> {
        try {
            const res = await fetch(`${VN_API}/d/${districtCode}?depth=2`);
            const data: District = await res.json();
            return data?.wards ?? [];
        } catch {
            return [];
        }
    },

    // ===== GHN ID RESOLUTION (backend cache, used silently on address save) =====
    // Returns null if backend cache is empty or GHN token expired.
    // Address is saved with text names regardless; shipping falls back to text-lookup.

    async resolveGHNProvince(provinceName: string): Promise<GHNProvince | null> {
        try {
            const res = await fetch(`${API_BASE}/api/Location/provinces`);
            const json = await res.json();
            const list: GHNProvince[] = json?.data ?? [];
            const norm = normalize(provinceName);
            return list.find(p =>
                normalize(p.provinceName).includes(norm) || norm.includes(normalize(p.provinceName))
            ) ?? null;
        } catch {
            return null;
        }
    },

    async resolveGHNDistrict(ghnProvinceId: number, districtName: string): Promise<GHNDistrict | null> {
        try {
            const res = await fetch(`${API_BASE}/api/Location/provinces/${ghnProvinceId}/districts`);
            const json = await res.json();
            const list: GHNDistrict[] = json?.data ?? [];
            const norm = normalize(districtName);
            return list.find(d =>
                normalize(d.districtName).includes(norm) || norm.includes(normalize(d.districtName))
            ) ?? null;
        } catch {
            return null;
        }
    },

    async resolveGHNWard(ghnDistrictId: number, wardName: string): Promise<GHNWard | null> {
        try {
            const res = await fetch(`${API_BASE}/api/Location/districts/${ghnDistrictId}/wards`);
            const json = await res.json();
            const list: GHNWard[] = json?.data ?? [];
            const norm = normalize(wardName);
            return list.find(w =>
                normalize(w.wardName).includes(norm) || norm.includes(normalize(w.wardName))
            ) ?? null;
        } catch {
            return null;
        }
    },
};
