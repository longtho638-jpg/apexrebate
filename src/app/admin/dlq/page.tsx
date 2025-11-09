"use client";

import { useEffect, useState } from "react";
import ConfirmButton from "@/src/components/ConfirmButton";

export default function DLQPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDLQ = async () => {
      try {
        const r = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/dlq/list`,
          { cache: "no-store" }
        );
        const j = await r.json();
        setItems(j.items || []);
      } catch (err) {
        console.error("Failed to fetch DLQ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDLQ();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DLQ Replay Center</h1>
      <p className="text-sm text-neutral-600 mb-6">
        2-eyes + Idempotency. Dùng cho webhook/tasks lỗi.
      </p>

      {loading ? (
        <div className="p-4 text-neutral-600">Loading...</div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="p-4 border rounded-xl">Không có mục DLQ.</div>
          )}

          {items.map((it) => (
            <div
              key={it.id}
              className="p-4 border rounded-xl flex items-center justify-between"
            >
              <div className="text-sm">
                <div className="font-medium">
                  {it.id} — <span className="uppercase">{it.kind}</span> / {it.source}
                </div>
                <div className="text-neutral-600">
                  attempts: {it.attempts} · {new Date(it.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2">
                <ConfirmButton
                  label="Replay"
                  onConfirm={async () => {
                    await fetch("/api/admin/dlq/replay", {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                        "x-two-eyes": process.env.NEXT_PUBLIC_TWO_EYES_HINT || "",
                        "x-idempotency-key": crypto.randomUUID(),
                      },
                      body: JSON.stringify({ id: it.id }),
                    });
                    location.reload();
                  }}
                />

                <ConfirmButton
                  label="Delete"
                  variant="danger"
                  onConfirm={async () => {
                    await fetch("/api/admin/dlq/delete", {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                        "x-two-eyes": process.env.NEXT_PUBLIC_TWO_EYES_HINT || "",
                      },
                      body: JSON.stringify({ id: it.id }),
                    });
                    location.reload();
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-neutral-500">
        Gợi ý: đặt <code>TWO_EYES_TOKEN</code> ở server, và{" "}
        <code>NEXT_PUBLIC_TWO_EYES_HINT</code> = cùng giá trị trên môi trường
        staging để test nhanh (prod KHÔNG nên public).
      </div>
    </div>
  );
}
