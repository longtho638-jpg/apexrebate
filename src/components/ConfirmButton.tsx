"use client";
import { useState } from "react";

export default function ConfirmButton({
  onConfirm,
  label = "Thực thi",
  confirm = "Xác nhận?",
}: {
  onConfirm: () => Promise<void> | void;
  label?: string;
  confirm?: string;
}) {
  const [ask, setAsk] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <button
      className={`px-3 py-2 rounded-xl border ${
        ask ? "border-red-500 text-red-600" : "border-neutral-300"
      } disabled:opacity-60`}
      onClick={async () => {
        if (!ask) {
          setAsk(true);
          setTimeout(() => setAsk(false), 2500);
          return;
        }
        setBusy(true);
        try {
          await onConfirm();
        } finally {
          setBusy(false);
          setAsk(false);
        }
      }}
      disabled={busy}
      title={ask ? confirm : label}
    >
      {busy ? "Đang xử lý…" : ask ? confirm : label}
    </button>
  );
}
