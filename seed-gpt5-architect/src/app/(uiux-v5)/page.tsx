"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Page() {
  const { data, error } = useSWR("/api/dashboard", fetcher);
  if (error) return <div className="text-red-400">Lỗi tải dữ liệu.</div>;
  if (!data) return <div className="text-zinc-400">Đang tải dữ liệu...</div>;

  return (
  <div className="min-h-screen bg-zinc-950 p-8">
  <div className="max-w-7xl mx-auto">
  <div className="grid gap-6 md:grid-cols-2 mb-8">
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
        <h2 className="font-semibold text-lg mb-2 text-zinc-100">Tổng Tiết Kiệm</h2>
        <p className="text-3xl font-bold text-wolf-400">${data.totalSavings}</p>
    </div>
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
        <h2 className="font-semibold text-lg mb-2 text-zinc-100">Khối Lượng Giao Dịch</h2>
          <p className="text-3xl font-bold text-amber-400">${data.totalVolume}</p>
        </div>
    </div>
    <div className="flex gap-4 flex-wrap">
      <button onClick={() => router.push('/vi/dashboard')} className="px-4 py-2 bg-wolf-600 text-white rounded-2xl hover:bg-wolf-700 transition">Go to Dashboard</button>
      <button onClick={() => router.push('/vi/tools')} className="px-4 py-2 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 transition">Go to Tools</button>
        <button onClick={() => router.push('/vi/hang-soi')} className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-2xl hover:bg-zinc-600 transition">Go to Hang Sói</button>
          <button onClick={() => router.push('/vi/wall-of-fame')} className="px-4 py-2 bg-zinc-800 text-zinc-100 rounded-2xl hover:bg-zinc-700 transition border border-zinc-700">Go to WOF</button>
        </div>
      </div>
    </div>
  );
}
