"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddressesRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/profile?tab=addresses");
    }, [router]);

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full" />
                Đang chuyển hướng...
            </div>
        </div>
    );
}
