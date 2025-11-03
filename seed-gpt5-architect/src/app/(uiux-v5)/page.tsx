"use client";

import React from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type DashboardResponse = {
  totalSavings: number;
  totalVolume: number;
};

export default function Page() {
  const { data, error } = useSWR<DashboardResponse>("/api/dashboard", fetcher);

  if (error) {
    return <div className="text-red-600">Lỗi tải dữ liệu.</div>;
  }

  if (!data) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <h2 className="font-semibold text-lg mb-2">Tổng Tiết Kiệm</h2>
        <p className="text-3xl font-bold text-primary">${data.totalSavings}</p>
      </div>
      <div className="p-6 rounded-2xl shadow-sm bg-white">
        <h2 className="font-semibold text-lg mb-2">Khối Lượng Giao Dịch</h2>
        <p className="text-3xl font-bold text-accent">${data.totalVolume}</p>
      </div>
    </div>
  );
}
