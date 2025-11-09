import ConfirmButton from "@/src/components/ConfirmButton";

async function fetchDLQ() {
  const r = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/dlq/list`,
    { cache: "no-store" }
  );
  const j = await r.json();
  return j.items as any[];
}

export default async function DLQPage() {
  const items = await fetchDLQ();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DLQ Replay Center</h1>
      <p className="text-sm text-neutral-600 mb-6">
        2-eyes + Idempotency. Dùng cho webhook/tasks lỗi.
      </p>

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

      <div className="mt-6 text-xs text-neutral-500">
        Gợi ý: đặt <code>TWO_EYES_TOKEN</code> ở server, và{" "}
        <code>NEXT_PUBLIC_TWO_EYES_HINT</code> = cùng giá trị trên môi trường
        staging để test nhanh (prod KHÔNG nên public).
      </div>
    </div>
  );
}
